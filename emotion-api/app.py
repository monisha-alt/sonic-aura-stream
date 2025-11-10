"""
FastAPI Backend for Wav2Vec2-Emotion Detection
Uses the superb/wav2vec2-base-superb-er model from Hugging Face
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import torch
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2Processor, AutoProcessor, Wav2Vec2FeatureExtractor
import soundfile as sf
import io
import numpy as np
from pydub import AudioSegment
import logging
import os
from typing import Optional, Dict

# Optional preprocessing utilities
import math
try:
    import webrtcvad  # Voice Activity Detection
except Exception:
    webrtcvad = None  # Will be checked at runtime
try:
    import noisereduce as nr  # Noise reduction
except Exception:
    nr = None
try:
    from scipy.signal import butter, lfilter
except Exception:
    butter = None
    lfilter = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set Hugging Face cache directory to a writable location
# Hugging Face Spaces doesn't allow writing to /.cache
# Use /tmp or /app/.cache for Hugging Face models
cache_dir = os.environ.get("HF_HOME", "/tmp/huggingface_cache")
os.environ["HF_HOME"] = cache_dir
# Note: TRANSFORMERS_CACHE is deprecated, using HF_HOME only
os.makedirs(cache_dir, exist_ok=True)
logger.info(f"📁 Using Hugging Face cache directory: {cache_dir}")

# Lifespan context manager for startup/shutdown
# Note: If lifespan fails, we'll use @app.on_event("startup") as fallback
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Loads model on startup and handles cleanup on shutdown.
    """
    # Startup: Load model
    logger.info("🚀 Starting up Wav2Vec2 Emotion Detection API...")
    try:
        load_model()
        logger.info("✅ Startup complete - Model loaded!")
    except Exception as e:
        logger.error(f"❌ Model loading failed during startup: {e}")
        logger.warning("⚠️ App will continue, but emotion detection may not work")
        logger.warning("⚠️ Model will be loaded lazily on first request")
    yield
    # Shutdown: Cleanup (if needed)
    logger.info("🛑 Shutting down...")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Wav2Vec2 Emotion Detection API",
    description="Real-time emotion detection from audio using Wav2Vec2 model",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - Allow requests from React frontend
# For public API, allow all origins (common for ML APIs)
# Using allow_origins=["*"] for maximum compatibility

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for public API
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Resolve model identifier (local fine-tuned model by default if present)
_default_model_id = "superb/wav2vec2-base-superb-er"
_local_model_dir = os.path.join(os.path.dirname(__file__), "wav2vec2-ravdess-emotion")
MODEL_ID_OR_PATH = os.getenv("MODEL_ID_OR_PATH")

if not MODEL_ID_OR_PATH:
    if os.path.isdir(_local_model_dir):
        MODEL_ID_OR_PATH = _local_model_dir
    else:
        MODEL_ID_OR_PATH = _default_model_id

logger.info(f"🤗 Using model source: {MODEL_ID_OR_PATH}")

# Global variables for model, processor, and label mapping
model: Optional[Wav2Vec2ForSequenceClassification] = None
processor: Optional[Wav2Vec2Processor] = None
feature_extractor: Optional[Wav2Vec2FeatureExtractor] = None
ID2LABEL: Dict[int, str] = {}
LABELS_LIST: list[str] = []

# Configurable preprocessing via env vars
ENABLE_VAD = os.environ.get("ENABLE_VAD", "true").lower() == "true"
ENABLE_DENOISE = os.environ.get("ENABLE_DENOISE", "true").lower() == "true"
ENABLE_HIGHPASS = os.environ.get("ENABLE_HIGHPASS", "true").lower() == "true"
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.55"))
MIN_VOICED_MS = int(os.environ.get("MIN_VOICED_MS", "500"))


def load_model():
    """
    Load the Wav2Vec2-Emotion model and processor from Hugging Face.
    This function is called once at startup to initialize the model.
    If called again (lazy loading), it will skip if already loaded.
    """
    global model, processor, feature_extractor, ID2LABEL, LABELS_LIST
    
    # Skip if already loaded
    if model is not None:
        logger.info("✅ Model already loaded, skipping...")
        return
    
    try:
        logger.info("🔄 Loading Wav2Vec2 emotion model...")
        logger.info(f"Model source: {MODEL_ID_OR_PATH}")
        
        model_name = MODEL_ID_OR_PATH
        
        # Try loading feature extractor first (Wav2Vec2 doesn't always need tokenizer)
        # Specify cache_dir explicitly to use writable location
        logger.info("📦 Loading feature extractor / processor...")
        try:
            feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
                model_name,
                cache_dir=cache_dir,
                local_files_only=os.path.isdir(model_name)
            )
            logger.info("✅ Feature extractor loaded!")
            processor = feature_extractor  # Use feature extractor as processor
        except Exception as e_fe:
            logger.warning(f"⚠️ Feature extractor failed: {e_fe}")
            
            # Try using AutoProcessor
            try:
                logger.info("📦 Trying AutoProcessor...")
                processor = AutoProcessor.from_pretrained(
                    model_name,
                    cache_dir=cache_dir,
                    local_files_only=os.path.isdir(model_name)
                )
                logger.info("✅ AutoProcessor loaded successfully!")
            except Exception as e1:
                logger.warning(f"⚠️ AutoProcessor failed: {e1}")
                logger.info("📦 Trying Wav2Vec2Processor directly...")
                # Fallback to direct processor
                try:
                    processor = Wav2Vec2Processor.from_pretrained(
                        model_name,
                        cache_dir=cache_dir,
                        local_files_only=os.path.isdir(model_name)
                    )
                    logger.info("✅ Wav2Vec2Processor loaded successfully!")
                except Exception as e2:
                    logger.error(f"❌ All processor methods failed!")
                    logger.error(f"   FeatureExtractor: {e_fe}")
                    logger.error(f"   AutoProcessor: {e1}")
                    logger.error(f"   Wav2Vec2Processor: {e2}")
                    raise
        
        # Load the model (specify cache_dir explicitly)
        logger.info("📦 Loading model (this may take a minute)...")
        model = Wav2Vec2ForSequenceClassification.from_pretrained(
            model_name,
            cache_dir=cache_dir,
            local_files_only=os.path.isdir(model_name)
        )
        
        # Set model to evaluation mode (not training)
        model.eval()
        
        # Capture label mapping dynamically from config
        config_id2label = getattr(model.config, "id2label", None) or {}
        if isinstance(config_id2label, dict):
            ID2LABEL.clear()
            for key, value in config_id2label.items():
                try:
                    ID2LABEL[int(key)] = str(value)
                except (ValueError, TypeError):
                    continue
        if not ID2LABEL:
            ID2LABEL.update({idx: label for idx, label in enumerate(["neutral", "happy", "sad", "angry", "fearful", "disgust", "surprised", "calm"])})

        LABELS_LIST.clear()
        for idx in sorted(ID2LABEL):
            LABELS_LIST.append(ID2LABEL[idx])

        logger.info("✅ Model loaded successfully!")
        logger.info(f"📊 Model device: {next(model.parameters()).device}")
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")
        logger.error(f"📋 Full error: {repr(e)}")
        import traceback
        logger.error(f"📋 Traceback:\n{traceback.format_exc()}")
        raise


def convert_audio_to_wav(audio_bytes: bytes, input_format: str = "webm") -> bytes:
    """
    Convert audio bytes to WAV format (16kHz, mono, 16-bit).
    The Wav2Vec2 model expects specific audio format.
    
    Args:
        audio_bytes: Raw audio data as bytes
        input_format: Input format (webm, mp3, wav, etc.)
    
    Returns:
        WAV audio bytes (16kHz, mono, 16-bit)
    """
    try:
        # If already WAV, just verify format and return
        if input_format.lower() == "wav":
            logger.info("Audio is already WAV format")
            return audio_bytes
        
        # Try using librosa first (supports more formats, no ffmpeg needed for basic formats)
        try:
            import librosa
            logger.info(f"Attempting to convert {input_format} using librosa...")
            
            # Load audio with librosa (handles format conversion internally)
            audio_array, sample_rate = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)
            
            # Normalize audio
            audio_array = librosa.util.normalize(audio_array)
            
            # Convert to int16 WAV format
            audio_int16 = (audio_array * 32767).astype(np.int16)
            
            # Create WAV file in memory
            wav_buffer = io.BytesIO()
            sf.write(wav_buffer, audio_int16, 16000, format='WAV', subtype='PCM_16')
            wav_bytes = wav_buffer.getvalue()
            
            logger.info(f"✅ Successfully converted {input_format} to WAV using librosa")
            return wav_bytes
            
        except Exception as librosa_error:
            logger.warning(f"librosa conversion failed: {librosa_error}")
            
            # Fallback to pydub (requires ffmpeg)
            logger.info(f"Falling back to pydub for {input_format}...")
            try:
                audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format=input_format)
                
                # Convert to required format:
                # - 16kHz sample rate (Wav2Vec2 requirement)
                # - Mono (single channel)
                # - 16-bit depth
                audio = audio.set_frame_rate(16000)
                audio = audio.set_channels(1)
                audio = audio.set_sample_width(2)  # 16-bit = 2 bytes per sample
                
                # Export to WAV bytes
                wav_buffer = io.BytesIO()
                audio.export(wav_buffer, format="wav")
                wav_bytes = wav_buffer.getvalue()
                
                logger.info(f"✅ Successfully converted {input_format} to WAV using pydub")
                return wav_bytes
                
            except Exception as pydub_error:
                logger.error(f"pydub conversion also failed: {pydub_error}")
                raise Exception(
                    f"Audio conversion failed. {input_format} format requires ffmpeg. "
                    f"Please install ffmpeg or convert audio to WAV format first. "
                    f"Error details: {pydub_error}"
                )
        
    except Exception as e:
        logger.error(f"Error converting audio: {str(e)}")
        raise


def preprocess_audio(audio_bytes: bytes) -> np.ndarray:
    """
    Preprocess audio for Wav2Vec2 model.
    Converts audio bytes to numpy array and normalizes.
    
    Args:
        audio_bytes: WAV audio bytes (16kHz, mono, 16-bit)
    
    Returns:
        Audio array ready for model input (normalized float32, 16kHz)
    """
    try:
        # Read audio using soundfile
        audio_buffer = io.BytesIO(audio_bytes)
        audio_array, sample_rate = sf.read(audio_buffer, dtype='float32')
        
        # Verify sample rate is 16kHz (required by Wav2Vec2)
        if sample_rate != 16000:
            logger.warning(f"Sample rate is {sample_rate}Hz, resampling to 16kHz...")
            # Note: pydub already handles this in convert_audio_to_wav
        
        # Normalize audio to [-1, 1] range if needed
        if audio_array.dtype != np.float32:
            audio_array = audio_array.astype(np.float32)
        
        # Ensure mono (single channel)
        if len(audio_array.shape) > 1:
            audio_array = np.mean(audio_array, axis=1)
        
        # Normalize to [-1, 1] range
        max_val = np.abs(audio_array).max()
        if max_val > 0:
            audio_array = audio_array / max_val
        
        # Optional high-pass filter (reduce rumble/low-frequency noise)
        if ENABLE_HIGHPASS and butter is not None and lfilter is not None:
            try:
                # 100 Hz 2nd-order high-pass
                cutoff_hz = 100.0
                nyq = 0.5 * 16000
                normal_cutoff = cutoff_hz / nyq
                b, a = butter(2, normal_cutoff, btype='high', analog=False)
                audio_array = lfilter(b, a, audio_array).astype(np.float32)
            except Exception as e:
                logger.warning(f"High-pass filter failed: {e}")

        # Optional noise reduction (spectral gating)
        if ENABLE_DENOISE and nr is not None:
            try:
                audio_array = nr.reduce_noise(y=audio_array, sr=16000, prop_decrease=0.9)
            except Exception as e:
                logger.warning(f"Noise reduction failed: {e}")

        return audio_array
        
    except Exception as e:
        logger.error(f"Error preprocessing audio: {str(e)}")
        raise


def predict_emotion(audio_array: np.ndarray) -> dict:
    """
    Predict emotion from audio array using Wav2Vec2 model.
    
    Args:
        audio_array: Preprocessed audio array (float32, 16kHz, mono)
    
    Returns:
        Dictionary with emotion label and confidence score
    """
    global model, processor
    
    try:
        # Use processor to prepare input for model
        # This handles tokenization and feature extraction
        inputs = processor(
            audio_array,
            sampling_rate=16000,
            return_tensors="pt",  # Return PyTorch tensors
            padding=True
        )
        
        # Move inputs to same device as model (CPU or GPU)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Move model to device if needed
        if next(model.parameters()).device != device:
            model = model.to(device)
        
        # Run inference (no gradient computation)
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Get predicted class (emotion label index)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=-1).item()
        
        # Get probabilities for all emotions using softmax
        probabilities = torch.nn.functional.softmax(logits, dim=-1).cpu().numpy()[0]
        
        # Get confidence (probability of predicted emotion)
        confidence = float(probabilities[predicted_class])
        
        # Map class index to emotion label
        emotion_label = ID2LABEL.get(predicted_class, str(predicted_class))
        
        # Create probability distribution for all emotions
        emotion_probs = {
            ID2LABEL.get(i, str(i)): float(prob) 
            for i, prob in enumerate(probabilities)
        }
        
        logger.info(f"🎭 Detected emotion: {emotion_label} (confidence: {confidence:.2%})")
        logger.info(f"📊 Probability distribution: {emotion_probs}")
        
        # Confidence gating
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "emotion": "uncertain",
                "confidence": confidence,
                "probabilities": emotion_probs,
                "note": f"Low confidence (< {CONFIDENCE_THRESHOLD}). Returning 'uncertain'."
            }
        else:
            return {
                "emotion": emotion_label,
                "confidence": confidence,
                "probabilities": emotion_probs
            }
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        raise


# Model loading is now handled by lifespan context manager above


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Wav2Vec2 Emotion Detection API",
        "model": MODEL_ID_OR_PATH,
        "emotions": LABELS_LIST or list(ID2LABEL.values())
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None and processor is not None,
        "device": str(torch.device("cuda" if torch.cuda.is_available() else "cpu")),
        "model_name": MODEL_ID_OR_PATH,
        "config": {
            "ENABLE_VAD": ENABLE_VAD,
            "ENABLE_DENOISE": ENABLE_DENOISE,
            "ENABLE_HIGHPASS": ENABLE_HIGHPASS,
            "CONFIDENCE_THRESHOLD": CONFIDENCE_THRESHOLD,
            "MIN_VOICED_MS": MIN_VOICED_MS
        },
        "labels": LABELS_LIST or list(ID2LABEL.values())
    }


@app.post("/predict")
async def predict_emotion_endpoint(
    audio: UploadFile = File(..., description="Audio file (WAV, MP3, WebM, etc.)")
):
    """
    Predict emotion from uploaded audio file.
    
    Steps:
    1. Receive audio file from frontend
    2. Convert to WAV format (16kHz, mono, 16-bit)
    3. Preprocess audio for model
    4. Run Wav2Vec2 model inference
    5. Return detected emotion and confidence
    
    Args:
        audio: Audio file uploaded from frontend
    
    Returns:
        JSON response with emotion, confidence, and probability distribution
    """
    # Lazy loading: If model wasn't loaded at startup, load it now
    global model, processor
    if model is None or processor is None:
        logger.warning("⚠️ Model not loaded, attempting lazy loading...")
        try:
            load_model()
            logger.info("✅ Model loaded successfully on first request!")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise HTTPException(
                status_code=503,
                detail=f"Model not available. Please wait a moment and try again. Error: {str(e)}"
            )
    
    try:
        # Read uploaded audio file
        audio_bytes = await audio.read()
        logger.info(f"📥 Received audio file: {audio.filename}, size: {len(audio_bytes)} bytes")
        
        # Determine input format from file extension or MIME type
        input_format = "webm"  # Default (browser recordings are usually WebM)
        if audio.filename:
            ext = audio.filename.split(".")[-1].lower()
            if ext in ["mp3", "wav", "m4a", "ogg"]:
                input_format = ext
        
        # Convert audio to WAV format (16kHz, mono, 16-bit)
        logger.info("🔄 Converting audio to WAV format...")
        wav_bytes = convert_audio_to_wav(audio_bytes, input_format=input_format)
        
        # Preprocess audio for model
        logger.info("🔄 Preprocessing audio...")
        audio_array = preprocess_audio(wav_bytes)
        logger.info(f"✅ Audio preprocessed: {len(audio_array)} samples at 16kHz")
        
        # Optional VAD gating - skip if insufficient speech
        if ENABLE_VAD:
            if webrtcvad is None:
                logger.warning("VAD enabled but webrtcvad not installed; proceeding without VAD")
            else:
                try:
                    vad = webrtcvad.Vad(2)  # 0-3 aggressiveness
                    # Convert float32 to 16-bit PCM for VAD
                    pcm16 = (np.clip(audio_array, -1.0, 1.0) * 32767).astype(np.int16)
                    pcm_bytes = pcm16.tobytes()
                    frame_ms = 20
                    bytes_per_frame = int(16000 * (frame_ms / 1000.0)) * 2  # 2 bytes per sample
                    num_frames = len(pcm_bytes) // bytes_per_frame
                    voiced_frames = 0
                    for i in range(num_frames):
                        start = i * bytes_per_frame
                        end = start + bytes_per_frame
                        frame = pcm_bytes[start:end]
                        if len(frame) == bytes_per_frame and vad.is_speech(frame, 16000):
                            voiced_frames += 1
                    voiced_ms = voiced_frames * frame_ms
                    logger.info(f"VAD voiced duration: {voiced_ms} ms")
                    if voiced_ms < MIN_VOICED_MS:
                        return JSONResponse(status_code=422, content={
                            "emotion": "unsure",
                            "confidence": 0.0,
                            "probabilities": {},
                            "note": f"Insufficient speech detected (< {MIN_VOICED_MS} ms). Please record again."
                        })
                except Exception as e:
                    logger.warning(f"VAD processing failed: {e}")

        # Predict emotion
        logger.info("🧠 Running emotion prediction...")
        result = predict_emotion(audio_array)
        
        # Return result
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"❌ Error in predict endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment (cloud platforms like Render set this automatically)
    # Default to 8000 for local development
    port = int(os.environ.get("PORT", 8000))
    
    # Check if running in production (cloud environment)
    is_production = os.environ.get("ENVIRONMENT", "development") == "production"
    
    # Run the FastAPI server
    uvicorn.run(
        "app:app",
        host="0.0.0.0",  # Listen on all interfaces
        port=port,  # Use environment port or 8000 for local
        reload=not is_production  # Only reload in development
    )

