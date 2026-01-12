import torch
import torchaudio
import librosa
import numpy as np
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2Processor
from typing import Dict, Any, Tuple
import io
import soundfile as sf
from app.core.config import settings

class EmotionDetectionService:
    def __init__(self):
        self.model_name = "facebook/wav2vec2-base-960h"
        self.processor = None
        self.model = None
        self.emotion_labels = [
            "angry", "calm", "disgust", "fearful", "happy", "neutral", "sad", "surprised"
        ]
        self._load_model()
    
    def _load_model(self):
        """Load the emotion detection model"""
        try:
            # For production, you might want to use a pre-trained emotion detection model
            # Here we'll use a simple approach with Wav2Vec2
            self.processor = Wav2Vec2Processor.from_pretrained(self.model_name)
            self.model = Wav2Vec2ForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=len(self.emotion_labels)
            )
            print("Emotion detection model loaded successfully")
        except Exception as e:
            print(f"Error loading emotion detection model: {e}")
            self.processor = None
            self.model = None
    
    async def detect_emotion_from_audio(self, audio_file: bytes) -> Dict[str, Any]:
        """
        Detect emotion from audio file
        Args:
            audio_file: Raw audio bytes
        Returns:
            Dict with emotion, confidence, and metadata
        """
        try:
            # Load audio from bytes
            audio_data, sample_rate = librosa.load(io.BytesIO(audio_file), sr=16000)
            
            # Preprocess audio
            audio_features = self._extract_audio_features(audio_data, sample_rate)
            
            # For now, we'll use a simple rule-based approach
            # In production, you'd use the loaded ML model
            emotion, confidence = self._analyze_audio_features(audio_features)
            
            return {
                "emotion": emotion,
                "confidence": confidence,
                "features": audio_features,
                "sample_rate": sample_rate,
                "duration": len(audio_data) / sample_rate
            }
            
        except Exception as e:
            print(f"Error in emotion detection: {e}")
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "error": str(e)
            }
    
    def _extract_audio_features(self, audio_data: np.ndarray, sample_rate: int) -> Dict[str, float]:
        """Extract audio features for emotion analysis"""
        features = {}
        
        # Energy
        features["energy"] = np.mean(librosa.feature.rms(y=audio_data)[0])
        
        # Zero crossing rate
        features["zcr"] = np.mean(librosa.feature.zero_crossing_rate(audio_data)[0])
        
        # Spectral centroid
        features["spectral_centroid"] = np.mean(librosa.feature.spectral_centroid(y=audio_data, sr=sample_rate)[0])
        
        # MFCC features
        mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
        features["mfcc_mean"] = np.mean(mfccs, axis=1).tolist()
        
        # Pitch
        pitches, magnitudes = librosa.piptrack(y=audio_data, sr=sample_rate)
        features["pitch_mean"] = np.mean(pitches[pitches > 0])
        
        # Tempo
        tempo, _ = librosa.beat.beat_track(y=audio_data, sr=sample_rate)
        features["tempo"] = tempo
        
        return features
    
    def _analyze_audio_features(self, features: Dict[str, float]) -> Tuple[str, float]:
        """Analyze audio features to determine emotion"""
        # Simple rule-based emotion detection
        # In production, use a trained ML model
        
        energy = features.get("energy", 0)
        tempo = features.get("tempo", 0)
        pitch = features.get("pitch_mean", 0)
        
        # Rule-based classification
        if energy > 0.1 and tempo > 120:
            return "happy", 0.8
        elif energy < 0.05 and tempo < 80:
            return "sad", 0.8
        elif energy > 0.15 and pitch > 200:
            return "surprised", 0.7
        elif energy > 0.12 and tempo > 140:
            return "angry", 0.7
        elif energy < 0.08 and tempo < 100:
            return "calm", 0.8
        else:
            return "neutral", 0.6
    
    async def detect_emotion_from_text(self, text: str) -> Dict[str, Any]:
        """
        Detect emotion from text input
        Args:
            text: Input text
        Returns:
            Dict with emotion, confidence, and metadata
        """
        # Simple keyword-based emotion detection
        emotion_keywords = {
            "happy": ["happy", "joy", "excited", "great", "amazing", "wonderful", "fantastic"],
            "sad": ["sad", "depressed", "down", "melancholy", "gloomy", "blue"],
            "angry": ["angry", "mad", "furious", "irritated", "annoyed"],
            "calm": ["calm", "peaceful", "relaxed", "serene", "tranquil"],
            "energetic": ["energetic", "pumped", "hyped", "active", "dynamic"],
            "focused": ["focused", "concentrated", "determined", "productive"]
        }
        
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            emotion_scores[emotion] = score
        
        if not any(emotion_scores.values()):
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "text_length": len(text)
            }
        
        best_emotion = max(emotion_scores, key=emotion_scores.get)
        confidence = min(emotion_scores[best_emotion] / len(emotion_keywords[best_emotion]), 1.0)
        
        return {
            "emotion": best_emotion,
            "confidence": confidence,
            "text_length": len(text),
            "emotion_scores": emotion_scores
        }

# Global instance
emotion_service = EmotionDetectionService()
