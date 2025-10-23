"""
Enhanced Voice Emotion Detection Service
Uses OpenAI Whisper for speech-to-text and HuggingFace for emotion classification
"""

import os
import logging
import tempfile
import asyncio
from typing import Dict, Any, Optional, Tuple
import openai
from transformers import pipeline
import torch
import librosa
import soundfile as sf
import numpy as np

logger = logging.getLogger(__name__)

class VoiceAnalysisService:
    def __init__(self):
        self.openai_client = None
        self.emotion_classifier = None
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize OpenAI and HuggingFace services"""
        try:
            # Initialize OpenAI client
            openai_api_key = os.getenv('OPENAI_API_KEY')
            if openai_api_key and openai_api_key != 'your_openai_api_key':
                self.openai_client = openai.OpenAI(api_key=openai_api_key)
                logger.info("✅ OpenAI client initialized")
            else:
                logger.warning("⚠️ OpenAI API key not configured")
            
            # Initialize emotion classifier
            try:
                self.emotion_classifier = pipeline(
                    "text-classification",
                    model="j-hartmann/emotion-english-distilroberta-base",
                    return_all_scores=True
                )
                logger.info("✅ Emotion classifier initialized")
            except Exception as e:
                logger.warning(f"⚠️ Emotion classifier initialization failed: {e}")
                self.emotion_classifier = None
                
        except Exception as e:
            logger.error(f"❌ Service initialization error: {e}")
    
    async def analyze_voice_file(self, file_path: str) -> Dict[str, Any]:
        """
        Analyze voice file for emotion detection
        Pipeline: Audio → Speech-to-Text → Emotion Classification
        """
        request_id = f"voice_analysis_{hash(file_path) % 10000}"
        logger.info(f"🎤 [{request_id}] Starting voice analysis for: {file_path}")
        
        try:
            # Step 1: Preprocess audio
            processed_audio_path = await self._preprocess_audio(file_path)
            
            # Step 2: Speech-to-Text
            transcription = await self._speech_to_text(processed_audio_path)
            
            # Step 3: Emotion Classification
            emotion_result = await self._classify_emotion(transcription)
            
            # Step 4: Audio features analysis
            audio_features = await self._analyze_audio_features(processed_audio_path)
            
            # Clean up temporary file
            if processed_audio_path != file_path:
                try:
                    os.remove(processed_audio_path)
                except:
                    pass
            
            result = {
                "request_id": request_id,
                "transcription": transcription,
                "emotion": emotion_result["emotion"],
                "confidence": emotion_result["confidence"],
                "all_emotions": emotion_result["all_emotions"],
                "audio_features": audio_features,
                "method": "enhanced_ai_analysis",
                "success": True
            }
            
            logger.info(f"✅ [{request_id}] Voice analysis completed: {emotion_result['emotion']} ({emotion_result['confidence']:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ [{request_id}] Voice analysis failed: {e}")
            return {
                "request_id": request_id,
                "error": str(e),
                "success": False,
                "method": "enhanced_ai_analysis"
            }
    
    async def _preprocess_audio(self, file_path: str) -> str:
        """Preprocess audio file for better analysis"""
        try:
            # Load audio with librosa
            audio, sr = librosa.load(file_path, sr=16000, mono=True)
            
            # Normalize audio
            audio = librosa.util.normalize(audio)
            
            # Remove silence
            audio, _ = librosa.effects.trim(audio, top_db=20)
            
            # Create temporary file for processed audio
            temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
            sf.write(temp_file.name, audio, 16000)
            temp_file.close()
            
            logger.info(f"🔧 Audio preprocessed: {len(audio)} samples at {sr}Hz")
            return temp_file.name
            
        except Exception as e:
            logger.warning(f"⚠️ Audio preprocessing failed: {e}")
            return file_path
    
    async def _speech_to_text(self, file_path: str) -> str:
        """Convert speech to text using OpenAI Whisper"""
        if not self.openai_client:
            logger.warning("⚠️ OpenAI client not available, using fallback transcription")
            return "Sample transcription for testing"
        
        try:
            with open(file_path, 'rb') as audio_file:
                transcript = self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            logger.info(f"📝 Transcription completed: {len(transcript)} characters")
            return transcript.strip()
            
        except Exception as e:
            logger.error(f"❌ Speech-to-text failed: {e}")
            return "Transcription failed"
    
    async def _classify_emotion(self, text: str) -> Dict[str, Any]:
        """Classify emotion from transcribed text"""
        if not self.emotion_classifier or not text or text == "Transcription failed":
            logger.warning("⚠️ Emotion classifier not available, using fallback")
            return self._fallback_emotion_classification(text)
        
        try:
            # Get emotion predictions
            predictions = self.emotion_classifier(text)
            
            # Find the emotion with highest score
            best_emotion = max(predictions[0], key=lambda x: x['score'])
            
            # Map to our emotion categories
            emotion_mapping = {
                'joy': 'happy',
                'sadness': 'sad',
                'anger': 'angry',
                'fear': 'fearful',
                'surprise': 'surprised',
                'disgust': 'disgusted',
                'neutral': 'neutral'
            }
            
            mapped_emotion = emotion_mapping.get(best_emotion['label'], best_emotion['label'])
            
            result = {
                "emotion": mapped_emotion,
                "confidence": best_emotion['score'],
                "all_emotions": {pred['label']: pred['score'] for pred in predictions[0]}
            }
            
            logger.info(f"🎭 Emotion classified: {mapped_emotion} ({best_emotion['score']:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Emotion classification failed: {e}")
            return self._fallback_emotion_classification(text)
    
    def _fallback_emotion_classification(self, text: str) -> Dict[str, Any]:
        """Fallback emotion classification using keyword matching"""
        if not text or text == "Transcription failed":
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "all_emotions": {"neutral": 0.5}
            }
        
        # Simple keyword-based emotion detection
        text_lower = text.lower()
        
        happy_keywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'good']
        sad_keywords = ['sad', 'depressed', 'down', 'terrible', 'awful', 'hate', 'bad', 'cry']
        angry_keywords = ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated']
        
        happy_score = sum(1 for word in happy_keywords if word in text_lower)
        sad_score = sum(1 for word in sad_keywords if word in text_lower)
        angry_score = sum(1 for word in angry_keywords if word in text_lower)
        
        if happy_score > sad_score and happy_score > angry_score:
            emotion = "happy"
            confidence = min(0.8, 0.5 + happy_score * 0.1)
        elif sad_score > angry_score:
            emotion = "sad"
            confidence = min(0.8, 0.5 + sad_score * 0.1)
        elif angry_score > 0:
            emotion = "angry"
            confidence = min(0.8, 0.5 + angry_score * 0.1)
        else:
            emotion = "neutral"
            confidence = 0.6
        
        return {
            "emotion": emotion,
            "confidence": confidence,
            "all_emotions": {
                "happy": happy_score * 0.1,
                "sad": sad_score * 0.1,
                "angry": angry_score * 0.1,
                "neutral": 0.4
            }
        }
    
    async def _analyze_audio_features(self, file_path: str) -> Dict[str, Any]:
        """Analyze audio features for additional emotion context"""
        try:
            # Load audio
            audio, sr = librosa.load(file_path, sr=16000)
            
            # Extract features
            mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)
            zero_crossing_rate = librosa.feature.zero_crossing_rate(audio)
            tempo, _ = librosa.beat.beat_track(y=audio, sr=sr)
            
            # Calculate statistics
            features = {
                "mfcc_mean": float(np.mean(mfccs)),
                "mfcc_std": float(np.std(mfccs)),
                "spectral_centroid_mean": float(np.mean(spectral_centroids)),
                "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
                "tempo": float(tempo),
                "duration": len(audio) / sr,
                "energy": float(np.mean(audio**2))
            }
            
            logger.info(f"🎵 Audio features extracted: tempo={features['tempo']:.1f}, energy={features['energy']:.3f}")
            return features
            
        except Exception as e:
            logger.error(f"❌ Audio feature extraction failed: {e}")
            return {
                "error": str(e),
                "duration": 0,
                "energy": 0
            }

# Global instance
voice_analysis_service = VoiceAnalysisService()
