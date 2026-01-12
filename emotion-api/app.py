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
ENABLE_SILENCE_TRIM = os.environ.get("ENABLE_SILENCE_TRIM", "true").lower() == "true"
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.4"))
MIN_VOICED_MS = int(os.environ.get("MIN_VOICED_MS", "500"))
MIN_AUDIO_DURATION_MS = int(os.environ.get("MIN_AUDIO_DURATION_MS", "300"))
MAX_AUDIO_DURATION_MS = int(os.environ.get("MAX_AUDIO_DURATION_MS", "10000"))


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
    Preprocess audio for Wav2Vec2 model with improved quality.
    Converts audio bytes to numpy array, trims silence, and normalizes.
    
    Args:
        audio_bytes: WAV audio bytes (16kHz, mono, 16-bit)
    
    Returns:
        Audio array ready for model input (normalized float32, 16kHz)
    """
    try:
        import librosa
        
        # Read audio using soundfile
        audio_buffer = io.BytesIO(audio_bytes)
        audio_array, sample_rate = sf.read(audio_buffer, dtype='float32')
        
        # Verify sample rate is 16kHz (required by Wav2Vec2)
        if sample_rate != 16000:
            logger.warning(f"Sample rate is {sample_rate}Hz, resampling to 16kHz...")
            audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
            sample_rate = 16000
        
        # Normalize audio to [-1, 1] range if needed
        if audio_array.dtype != np.float32:
            audio_array = audio_array.astype(np.float32)
        
        # Ensure mono (single channel)
        if len(audio_array.shape) > 1:
            audio_array = np.mean(audio_array, axis=1)
        
        # Trim silence from beginning and end (improves emotion detection)
        if ENABLE_SILENCE_TRIM:
            try:
                # Trim silence using librosa (top_db=20 means 20dB below peak)
                audio_array, _ = librosa.effects.trim(
                    audio_array, 
                    top_db=20,  # Remove audio 20dB below peak
                    frame_length=2048,
                    hop_length=512
                )
                logger.info(f"Trimmed silence: {len(audio_array)} samples remaining")
            except Exception as e:
                logger.warning(f"Silence trimming failed: {e}")
        
        # Check audio duration after trimming
        duration_ms = (len(audio_array) / sample_rate) * 1000
        if duration_ms < MIN_AUDIO_DURATION_MS:
            raise ValueError(f"Audio too short after preprocessing: {duration_ms:.0f}ms (minimum: {MIN_AUDIO_DURATION_MS}ms)")
        if duration_ms > MAX_AUDIO_DURATION_MS:
            logger.warning(f"Audio very long: {duration_ms:.0f}ms, truncating to {MAX_AUDIO_DURATION_MS}ms")
            max_samples = int(MAX_AUDIO_DURATION_MS * sample_rate / 1000)
            audio_array = audio_array[:max_samples]
        
        # Optional high-pass filter (reduce rumble/low-frequency noise)
        if ENABLE_HIGHPASS and butter is not None and lfilter is not None:
            try:
                # 80 Hz 2nd-order high-pass (slightly lower for better voice preservation)
                cutoff_hz = 80.0
                nyq = 0.5 * sample_rate
                normal_cutoff = cutoff_hz / nyq
                b, a = butter(2, normal_cutoff, btype='high', analog=False)
                audio_array = lfilter(b, a, audio_array).astype(np.float32)
                logger.info("Applied high-pass filter (80Hz)")
            except Exception as e:
                logger.warning(f"High-pass filter failed: {e}")

        # Optional noise reduction (spectral gating) - less aggressive to preserve emotion cues
        if ENABLE_DENOISE and nr is not None:
            try:
                # Use stationary noise reduction with less aggressive settings
                # Less aggressive = preserves more emotion-relevant features
                audio_array = nr.reduce_noise(
                    y=audio_array, 
                    sr=sample_rate, 
                    prop_decrease=0.6,  # Less aggressive (was 0.8) to preserve emotion features
                    stationary=True,  # Better for voice
                    n_std_thresh_stationary=2.0  # More conservative threshold
                )
                logger.info("Applied noise reduction (conservative)")
            except Exception as e:
                logger.warning(f"Noise reduction failed: {e}")

        # Improved normalization: RMS-based normalization for better voice quality
        # This preserves the dynamic range better than max normalization
        rms = np.sqrt(np.mean(audio_array**2))
        if rms > 0:
            # Normalize to target RMS (0.1 = -20dB, good for speech)
            target_rms = 0.1
            audio_array = audio_array * (target_rms / rms)
            # Then clip to [-1, 1] to prevent clipping
            audio_array = np.clip(audio_array, -1.0, 1.0)
        else:
            # Fallback to max normalization if RMS is zero
            max_val = np.abs(audio_array).max()
            if max_val > 0:
                audio_array = audio_array / max_val
        
        logger.info(f"✅ Audio preprocessed: {len(audio_array)} samples, {duration_ms:.0f}ms, RMS: {np.sqrt(np.mean(audio_array**2)):.4f}")
        return audio_array
        
    except Exception as e:
        logger.error(f"Error preprocessing audio: {str(e)}")
        raise


def predict_emotion(audio_array: np.ndarray) -> dict:
    """
    Predict emotion from audio array using Wav2Vec2 model.
    Includes bias mitigation and calibration to prevent over-prediction of certain emotions.
    
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
        
        # Get logits (raw model outputs before softmax)
        logits = outputs.logits
        
        # Apply stronger temperature scaling to reduce overconfidence and bias
        # Higher temperature (2.5) makes the distribution much more uniform, reducing bias significantly
        temperature = 2.5
        scaled_logits = logits / temperature
        
        # Apply class rebalancing: reduce "angry" logit to mitigate bias
        # Get the index of "angry" emotion
        angry_idx = None
        for idx, label in ID2LABEL.items():
            if label.lower() == "angry":
                angry_idx = idx
                break
        
        # Reduce "angry" logit by subtracting a penalty (makes it less likely)
        if angry_idx is not None:
            penalty = 1.0  # Penalty to reduce angry predictions
            scaled_logits[0, angry_idx] = scaled_logits[0, angry_idx] - penalty
            logger.info(f"⚠️ Applied bias penalty to 'angry' class (idx {angry_idx})")
        
        # Get probabilities for all emotions using softmax on scaled logits
        probabilities = torch.nn.functional.softmax(scaled_logits, dim=-1).cpu().numpy()[0]
        
        # Get predicted class (emotion label index) from scaled probabilities
        predicted_class = np.argmax(probabilities)
        confidence = float(probabilities[predicted_class])
        
        # Map class index to emotion label
        emotion_label = ID2LABEL.get(predicted_class, str(predicted_class))
        
        # Create probability distribution for all emotions
        emotion_probs = {
            ID2LABEL.get(i, str(i)): float(prob) 
            for i, prob in enumerate(probabilities)
        }
        
        # Sort probabilities for analysis
        sorted_probs = sorted(emotion_probs.items(), key=lambda x: x[1], reverse=True)
        top_emotion, top_conf = sorted_probs[0]
        second_emotion, second_conf = sorted_probs[1] if len(sorted_probs) > 1 else (None, 0.0)
        third_emotion, third_conf = sorted_probs[2] if len(sorted_probs) > 2 else (None, 0.0)
        
        logger.info(f"🎭 Raw prediction: {emotion_label} (confidence: {confidence:.2%})")
        logger.info(f"📊 Top 3: {top_emotion} ({top_conf:.2%}), {second_emotion} ({second_conf:.2%}), {third_emotion} ({third_conf:.2%})")
        logger.info(f"📊 Full distribution: {emotion_probs}")
        
        # Aggressive bias mitigation: If "angry" is predicted, apply stricter checks
        confidence_diff = top_conf - second_conf
        
        # If "angry" is top, require much higher confidence and margin
        if top_emotion == "angry":
            # Require at least 70% confidence AND 25% margin over second emotion
            if top_conf < 0.70 or confidence_diff < 0.25:
                # Prefer second emotion if it's reasonable
                if second_conf > 0.20 and second_emotion != "angry":
                    logger.info(f"⚠️ Aggressive bias mitigation: 'angry' ({top_conf:.2%}) rejected. Using {second_emotion} ({second_conf:.2%}) instead.")
                    emotion_label = second_emotion
                    confidence = second_conf
                    top_emotion = second_emotion
                    top_conf = second_conf
                # If second is also angry or too low, try third
                elif third_conf > 0.20 and third_emotion and third_emotion != "angry":
                    logger.info(f"⚠️ Aggressive bias mitigation: Using third emotion {third_emotion} ({third_conf:.2%}) instead of 'angry'.")
                    emotion_label = third_emotion
                    confidence = third_conf
                    top_emotion = third_emotion
                    top_conf = third_conf
                else:
                    logger.info(f"⚠️ 'angry' predicted but confidence/margin too low. Returning 'uncertain'.")
                    emotion_label = "uncertain"
        
        # Additional check: If top emotion has very low confidence, use second if it's reasonable
        if top_conf < 0.35 and second_conf > 0.20:
            logger.info(f"⚠️ Low confidence on top emotion. Considering {second_emotion}.")
            if second_conf > top_conf * 0.75:  # Second is at least 75% of top
                emotion_label = second_emotion
                confidence = second_conf
                top_emotion = second_emotion
                top_conf = second_conf
        
        # Confidence gating with improved logic
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "emotion": "uncertain",
                "confidence": confidence,
                "probabilities": emotion_probs,
                "top_emotions": {
                    "first": {top_emotion: top_conf},
                    "second": {second_emotion: second_conf} if second_emotion else None,
                    "third": {third_emotion: third_conf} if third_emotion else None
                },
                "note": f"Low confidence ({confidence:.2%} < {CONFIDENCE_THRESHOLD:.2%}). Top: {top_emotion}."
            }
        elif confidence_diff < 0.15 and top_conf < 0.6:
            # Ambiguous case: top emotions are close
            return {
                "emotion": emotion_label,
                "confidence": confidence,
                "probabilities": emotion_probs,
                "top_emotions": {
                    "first": {top_emotion: top_conf},
                    "second": {second_emotion: second_conf} if second_emotion else None
                },
                "note": f"Ambiguous: {top_emotion} ({top_conf:.2%}) vs {second_emotion} ({second_conf:.2%})"
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
            "ENABLE_SILENCE_TRIM": ENABLE_SILENCE_TRIM,
            "CONFIDENCE_THRESHOLD": CONFIDENCE_THRESHOLD,
            "MIN_VOICED_MS": MIN_VOICED_MS,
            "MIN_AUDIO_DURATION_MS": MIN_AUDIO_DURATION_MS,
            "MAX_AUDIO_DURATION_MS": MAX_AUDIO_DURATION_MS
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
        
        # Preprocess audio for model (includes silence trimming, normalization, filtering)
        logger.info("🔄 Preprocessing audio...")
        try:
            audio_array = preprocess_audio(wav_bytes)
        except ValueError as ve:
            # Audio quality issues (too short, etc.)
            return JSONResponse(status_code=422, content={
                "emotion": "unsure",
                "confidence": 0.0,
                "probabilities": {},
                "note": str(ve)
            })
        
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

