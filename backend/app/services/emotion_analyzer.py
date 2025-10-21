"""
Enhanced Emotion Analyzer for Music Recommendation System
Analyzes emotions and maps them to music preferences and Spotify audio features.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class EmotionType(str, Enum):
    """Supported emotion types for music recommendation."""
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    CALM = "calm"
    ENERGETIC = "energetic"
    ROMANTIC = "romantic"
    NOSTALGIC = "nostalgic"
    ANXIOUS = "anxious"
    FOCUSED = "focused"
    NEUTRAL = "neutral"

@dataclass
class EmotionProfile:
    """Comprehensive emotion profile for music recommendation."""
    primary_emotion: EmotionType
    intensity: float  # 0.0 to 1.0
    confidence: float  # 0.0 to 1.0
    secondary_emotions: List[Tuple[EmotionType, float]]
    mood_context: str
    energy_level: float  # 0.0 (low) to 1.0 (high)
    valence: float  # -1.0 (negative) to 1.0 (positive)
    arousal: float  # 0.0 (calm) to 1.0 (exciting)

@dataclass
class MusicPreferences:
    """Music preferences derived from emotion analysis."""
    target_valence: float  # Spotify valence (0.0 to 1.0)
    target_energy: float  # Spotify energy (0.0 to 1.0)
    target_danceability: float  # Spotify danceability (0.0 to 1.0)
    target_acousticness: float  # Spotify acousticness (0.0 to 1.0)
    target_instrumentalness: float  # Spotify instrumentalness (0.0 to 1.0)
    target_liveness: float  # Spotify liveness (0.0 to 1.0)
    target_speechiness: float  # Spotify speechiness (0.0 to 1.0)
    target_tempo: Optional[int]  # BPM
    preferred_genres: List[str]
    mood_keywords: List[str]

class EmotionAnalyzer:
    """Advanced emotion analyzer for music recommendation."""
    
    def __init__(self):
        # Emotion to music feature mapping
        self.emotion_mappings = {
            EmotionType.HAPPY: {
                "valence": (0.7, 1.0),
                "energy": (0.6, 1.0),
                "danceability": (0.6, 1.0),
                "acousticness": (0.0, 0.4),
                "tempo_range": (120, 180),
                "genres": ["pop", "dance", "funk", "disco", "reggae"],
                "mood_keywords": ["upbeat", "joyful", "celebratory", "positive", "cheerful"]
            },
            EmotionType.SAD: {
                "valence": (0.0, 0.3),
                "energy": (0.0, 0.4),
                "danceability": (0.0, 0.4),
                "acousticness": (0.4, 1.0),
                "tempo_range": (60, 100),
                "genres": ["indie", "folk", "blues", "ballad", "ambient"],
                "mood_keywords": ["melancholic", "emotional", "introspective", "healing", "comforting"]
            },
            EmotionType.ANGRY: {
                "valence": (0.0, 0.4),
                "energy": (0.7, 1.0),
                "danceability": (0.3, 0.8),
                "acousticness": (0.0, 0.3),
                "tempo_range": (140, 200),
                "genres": ["rock", "metal", "punk", "rap", "electronic"],
                "mood_keywords": ["intense", "aggressive", "powerful", "cathartic", "rebellious"]
            },
            EmotionType.CALM: {
                "valence": (0.4, 0.8),
                "energy": (0.0, 0.3),
                "danceability": (0.0, 0.3),
                "acousticness": (0.6, 1.0),
                "tempo_range": (60, 90),
                "genres": ["ambient", "chill", "jazz", "classical", "new age"],
                "mood_keywords": ["peaceful", "relaxing", "serene", "meditative", "tranquil"]
            },
            EmotionType.ENERGETIC: {
                "valence": (0.6, 1.0),
                "energy": (0.8, 1.0),
                "danceability": (0.7, 1.0),
                "acousticness": (0.0, 0.3),
                "tempo_range": (130, 180),
                "genres": ["electronic", "pop", "dance", "rock", "hip-hop"],
                "mood_keywords": ["pumped", "motivating", "dynamic", "exciting", "adrenaline"]
            },
            EmotionType.ROMANTIC: {
                "valence": (0.6, 0.9),
                "energy": (0.2, 0.6),
                "danceability": (0.3, 0.8),
                "acousticness": (0.3, 0.8),
                "tempo_range": (80, 120),
                "genres": ["r&b", "pop", "jazz", "soul", "ballad"],
                "mood_keywords": ["romantic", "intimate", "passionate", "sensual", "loving"]
            },
            EmotionType.NOSTALGIC: {
                "valence": (0.3, 0.7),
                "energy": (0.2, 0.5),
                "danceability": (0.2, 0.6),
                "acousticness": (0.4, 0.9),
                "tempo_range": (70, 110),
                "genres": ["indie", "folk", "classic rock", "jazz", "blues"],
                "mood_keywords": ["nostalgic", "retro", "vintage", "memories", "timeless"]
            },
            EmotionType.ANXIOUS: {
                "valence": (0.2, 0.5),
                "energy": (0.4, 0.8),
                "danceability": (0.1, 0.5),
                "acousticness": (0.2, 0.7),
                "tempo_range": (100, 140),
                "genres": ["ambient", "experimental", "indie", "alternative"],
                "mood_keywords": ["soothing", "grounding", "centering", "mindful", "calming"]
            },
            EmotionType.FOCUSED: {
                "valence": (0.4, 0.7),
                "energy": (0.3, 0.6),
                "danceability": (0.0, 0.4),
                "acousticness": (0.3, 0.9),
                "tempo_range": (60, 100),
                "genres": ["ambient", "instrumental", "classical", "lo-fi", "jazz"],
                "mood_keywords": ["concentrated", "productive", "mindful", "flow", "focused"]
            },
            EmotionType.NEUTRAL: {
                "valence": (0.4, 0.6),
                "energy": (0.3, 0.6),
                "danceability": (0.3, 0.6),
                "acousticness": (0.2, 0.7),
                "tempo_range": (80, 120),
                "genres": ["pop", "indie", "alternative", "jazz"],
                "mood_keywords": ["balanced", "neutral", "versatile", "moderate", "steady"]
            }
        }
        
        # Contextual modifiers
        self.context_modifiers = {
            "morning": {"energy_multiplier": 0.8, "valence_boost": 0.1},
            "afternoon": {"energy_multiplier": 1.0, "valence_boost": 0.0},
            "evening": {"energy_multiplier": 0.9, "valence_boost": -0.05},
            "night": {"energy_multiplier": 0.7, "valence_boost": -0.1},
            "workout": {"energy_multiplier": 1.3, "valence_boost": 0.15},
            "study": {"energy_multiplier": 0.6, "valence_boost": 0.0},
            "party": {"energy_multiplier": 1.4, "valence_boost": 0.2},
            "commute": {"energy_multiplier": 0.9, "valence_boost": 0.05}
        }

    def analyze_emotion_profile(
        self, 
        emotion: str, 
        intensity: float, 
        confidence: float,
        context: Optional[str] = None
    ) -> EmotionProfile:
        """
        Create comprehensive emotion profile from detected emotion.
        
        Args:
            emotion: Detected emotion string
            intensity: Emotion intensity (0.0 to 1.0)
            confidence: Detection confidence (0.0 to 1.0)
            context: Optional context (time, activity, etc.)
            
        Returns:
            EmotionProfile with comprehensive emotion analysis
        """
        try:
            # Normalize emotion to enum
            emotion_type = self._normalize_emotion(emotion)
            
            # Get base emotion mapping
            emotion_config = self.emotion_mappings.get(emotion_type, self.emotion_mappings[EmotionType.NEUTRAL])
            
            # Apply intensity scaling
            valence_range = emotion_config["valence"]
            energy_range = emotion_config["energy"]
            
            # Calculate target values with intensity adjustment
            target_valence = valence_range[0] + (valence_range[1] - valence_range[0]) * intensity
            target_energy = energy_range[0] + (energy_range[1] - energy_range[0]) * intensity
            
            # Apply context modifiers
            if context and context in self.context_modifiers:
                modifier = self.context_modifiers[context]
                target_energy *= modifier["energy_multiplier"]
                target_valence = max(0.0, min(1.0, target_valence + modifier["valence_boost"]))
            
            # Calculate arousal (excitement level)
            arousal = target_energy * intensity
            
            # Generate secondary emotions
            secondary_emotions = self._generate_secondary_emotions(emotion_type, intensity)
            
            # Generate mood context
            mood_context = self._generate_mood_context(emotion_type, intensity, context)
            
            return EmotionProfile(
                primary_emotion=emotion_type,
                intensity=intensity,
                confidence=confidence,
                secondary_emotions=secondary_emotions,
                mood_context=mood_context,
                energy_level=target_energy,
                valence=target_valence,
                arousal=arousal
            )
            
        except Exception as e:
            logger.error(f"Error analyzing emotion profile: {e}")
            # Return neutral fallback
            return EmotionProfile(
                primary_emotion=EmotionType.NEUTRAL,
                intensity=0.5,
                confidence=0.5,
                secondary_emotions=[],
                mood_context="neutral mood",
                energy_level=0.5,
                valence=0.5,
                arousal=0.3
            )

    def generate_music_preferences(self, emotion_profile: EmotionProfile) -> MusicPreferences:
        """
        Generate music preferences from emotion profile.
        
        Args:
            emotion_profile: Analyzed emotion profile
            
        Returns:
            MusicPreferences with target Spotify audio features
        """
        try:
            emotion_config = self.emotion_mappings[emotion_profile.primary_emotion]
            
            # Calculate target audio features
            valence_range = emotion_config["valence"]
            energy_range = emotion_config["energy"]
            danceability_range = emotion_config["danceability"]
            acousticness_range = emotion_config["acousticness"]
            
            # Apply intensity scaling
            intensity = emotion_profile.intensity
            
            target_valence = valence_range[0] + (valence_range[1] - valence_range[0]) * intensity
            target_energy = energy_range[0] + (energy_range[1] - energy_range[0]) * intensity
            target_danceability = danceability_range[0] + (danceability_range[1] - danceability_range[0]) * intensity
            target_acousticness = acousticness_range[0] + (acousticness_range[1] - acousticness_range[0]) * intensity
            
            # Calculate other features based on emotion
            target_instrumentalness = self._calculate_instrumentalness(emotion_profile)
            target_liveness = self._calculate_liveness(emotion_profile)
            target_speechiness = self._calculate_speechiness(emotion_profile)
            target_tempo = self._calculate_tempo(emotion_profile)
            
            # Get preferred genres
            preferred_genres = emotion_config["genres"].copy()
            
            # Add secondary emotion genres
            for secondary_emotion, weight in emotion_profile.secondary_emotions:
                if weight > 0.3:  # Only add if significant
                    secondary_config = self.emotion_mappings.get(secondary_emotion)
                    if secondary_config:
                        preferred_genres.extend(secondary_config["genres"])
            
            # Remove duplicates and limit
            preferred_genres = list(set(preferred_genres))[:8]
            
            # Get mood keywords
            mood_keywords = emotion_config["mood_keywords"].copy()
            
            return MusicPreferences(
                target_valence=target_valence,
                target_energy=target_energy,
                target_danceability=target_danceability,
                target_acousticness=target_acousticness,
                target_instrumentalness=target_instrumentalness,
                target_liveness=target_liveness,
                target_speechiness=target_speechiness,
                target_tempo=target_tempo,
                preferred_genres=preferred_genres,
                mood_keywords=mood_keywords
            )
            
        except Exception as e:
            logger.error(f"Error generating music preferences: {e}")
            # Return neutral preferences
            return MusicPreferences(
                target_valence=0.5,
                target_energy=0.5,
                target_danceability=0.5,
                target_acousticness=0.5,
                target_instrumentalness=0.1,
                target_liveness=0.1,
                target_speechiness=0.1,
                target_tempo=100,
                preferred_genres=["pop", "indie"],
                mood_keywords=["balanced", "neutral"]
            )

    def _normalize_emotion(self, emotion: str) -> EmotionType:
        """Normalize emotion string to EmotionType enum."""
        emotion_lower = emotion.lower().strip()
        
        # Direct mapping
        emotion_map = {
            "happy": EmotionType.HAPPY,
            "sad": EmotionType.SAD,
            "angry": EmotionType.ANGRY,
            "calm": EmotionType.CALM,
            "energetic": EmotionType.ENERGETIC,
            "romantic": EmotionType.ROMANTIC,
            "nostalgic": EmotionType.NOSTALGIC,
            "anxious": EmotionType.ANXIOUS,
            "focused": EmotionType.FOCUSED,
            "neutral": EmotionType.NEUTRAL,
            # Alternative names
            "joyful": EmotionType.HAPPY,
            "excited": EmotionType.ENERGETIC,
            "relaxed": EmotionType.CALM,
            "peaceful": EmotionType.CALM,
            "depressed": EmotionType.SAD,
            "melancholic": EmotionType.SAD,
            "furious": EmotionType.ANGRY,
            "irritated": EmotionType.ANGRY,
            "passionate": EmotionType.ROMANTIC,
            "nostalgic": EmotionType.NOSTALGIC,
            "worried": EmotionType.ANXIOUS,
            "concentrated": EmotionType.FOCUSED
        }
        
        return emotion_map.get(emotion_lower, EmotionType.NEUTRAL)

    def _generate_secondary_emotions(self, primary: EmotionType, intensity: float) -> List[Tuple[EmotionType, float]]:
        """Generate secondary emotions based on primary emotion and intensity."""
        secondary_map = {
            EmotionType.HAPPY: [(EmotionType.ENERGETIC, 0.6), (EmotionType.ROMANTIC, 0.3)],
            EmotionType.SAD: [(EmotionType.NOSTALGIC, 0.7), (EmotionType.CALM, 0.4)],
            EmotionType.ANGRY: [(EmotionType.ENERGETIC, 0.8), (EmotionType.SAD, 0.2)],
            EmotionType.CALM: [(EmotionType.FOCUSED, 0.6), (EmotionType.ROMANTIC, 0.3)],
            EmotionType.ENERGETIC: [(EmotionType.HAPPY, 0.7), (EmotionType.ANGRY, 0.2)],
            EmotionType.ROMANTIC: [(EmotionType.HAPPY, 0.5), (EmotionType.CALM, 0.6)],
            EmotionType.NOSTALGIC: [(EmotionType.SAD, 0.8), (EmotionType.CALM, 0.5)],
            EmotionType.ANXIOUS: [(EmotionType.SAD, 0.4), (EmotionType.ENERGETIC, 0.3)],
            EmotionType.FOCUSED: [(EmotionType.CALM, 0.7), (EmotionType.ENERGETIC, 0.3)],
            EmotionType.NEUTRAL: [(EmotionType.CALM, 0.4), (EmotionType.HAPPY, 0.3)]
        }
        
        secondaries = secondary_map.get(primary, [])
        return [(emotion, weight * intensity) for emotion, weight in secondaries]

    def _generate_mood_context(self, emotion: EmotionType, intensity: float, context: Optional[str]) -> str:
        """Generate descriptive mood context."""
        intensity_desc = "very" if intensity > 0.7 else "moderately" if intensity > 0.4 else "slightly"
        context_desc = f" during {context}" if context else ""
        
        mood_descriptions = {
            EmotionType.HAPPY: f"{intensity_desc} joyful and uplifting{context_desc}",
            EmotionType.SAD: f"{intensity_desc} melancholic and reflective{context_desc}",
            EmotionType.ANGRY: f"{intensity_desc} intense and cathartic{context_desc}",
            EmotionType.CALM: f"{intensity_desc} peaceful and relaxing{context_desc}",
            EmotionType.ENERGETIC: f"{intensity_desc} dynamic and motivating{context_desc}",
            EmotionType.ROMANTIC: f"{intensity_desc} passionate and intimate{context_desc}",
            EmotionType.NOSTALGIC: f"{intensity_desc} nostalgic and timeless{context_desc}",
            EmotionType.ANXIOUS: f"{intensity_desc} contemplative and grounding{context_desc}",
            EmotionType.FOCUSED: f"{intensity_desc} concentrated and productive{context_desc}",
            EmotionType.NEUTRAL: f"balanced and versatile{context_desc}"
        }
        
        return mood_descriptions.get(emotion, "neutral mood")

    def _calculate_instrumentalness(self, profile: EmotionProfile) -> float:
        """Calculate target instrumentalness based on emotion profile."""
        if profile.primary_emotion in [EmotionType.FOCUSED, EmotionType.CALM, EmotionType.ANXIOUS]:
            return 0.6 + (profile.intensity * 0.3)
        elif profile.primary_emotion in [EmotionType.ROMANTIC, EmotionType.NOSTALGIC]:
            return 0.3 + (profile.intensity * 0.4)
        else:
            return 0.1 + (profile.intensity * 0.2)

    def _calculate_liveness(self, profile: EmotionProfile) -> float:
        """Calculate target liveness based on emotion profile."""
        if profile.primary_emotion in [EmotionType.ENERGETIC, EmotionType.HAPPY]:
            return 0.3 + (profile.intensity * 0.4)
        elif profile.primary_emotion == EmotionType.ANGRY:
            return 0.4 + (profile.intensity * 0.3)
        else:
            return 0.1 + (profile.intensity * 0.2)

    def _calculate_speechiness(self, profile: EmotionProfile) -> float:
        """Calculate target speechiness based on emotion profile."""
        if profile.primary_emotion in [EmotionType.ANGRY, EmotionType.ENERGETIC]:
            return 0.2 + (profile.intensity * 0.3)
        else:
            return 0.05 + (profile.intensity * 0.1)

    def _calculate_tempo(self, profile: EmotionProfile) -> Optional[int]:
        """Calculate target tempo based on emotion profile."""
        emotion_config = self.emotion_mappings[profile.primary_emotion]
        tempo_range = emotion_config["tempo_range"]
        
        # Apply intensity scaling
        tempo = tempo_range[0] + (tempo_range[1] - tempo_range[0]) * profile.intensity
        return int(tempo)

    async def analyze_user_history(self, emotion_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze user's emotion history to find patterns and preferences.
        
        Args:
            emotion_history: List of past emotion detections
            
        Returns:
            Analysis results with patterns and recommendations
        """
        if not emotion_history:
            return {"patterns": [], "recommendations": []}
        
        try:
            # Analyze emotion frequency
            emotion_counts = {}
            intensity_sum = 0
            confidence_sum = 0
            
            for record in emotion_history:
                emotion = record.get("emotion", "neutral")
                intensity = record.get("intensity", 0.5)
                confidence = record.get("confidence", 0.5)
                
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                intensity_sum += intensity
                confidence_sum += confidence
            
            # Find dominant emotions
            total_records = len(emotion_history)
            dominant_emotions = [
                {"emotion": emotion, "frequency": count / total_records}
                for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
            ]
            
            # Calculate averages
            avg_intensity = intensity_sum / total_records
            avg_confidence = confidence_sum / total_records
            
            # Generate recommendations
            recommendations = self._generate_history_recommendations(dominant_emotions, avg_intensity)
            
            return {
                "total_detections": total_records,
                "dominant_emotions": dominant_emotions[:3],
                "average_intensity": avg_intensity,
                "average_confidence": avg_confidence,
                "patterns": self._identify_patterns(emotion_history),
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Error analyzing user history: {e}")
            return {"patterns": [], "recommendations": []}

    def _generate_history_recommendations(self, dominant_emotions: List[Dict], avg_intensity: float) -> List[str]:
        """Generate recommendations based on emotion history."""
        recommendations = []
        
        if dominant_emotions:
            primary_emotion = dominant_emotions[0]["emotion"]
            
            if primary_emotion in ["sad", "anxious"]:
                recommendations.extend([
                    "Consider uplifting music to balance your mood",
                    "Try calming instrumental tracks for relaxation",
                    "Explore nature sounds or ambient music"
                ])
            elif primary_emotion in ["happy", "energetic"]:
                recommendations.extend([
                    "Keep exploring upbeat and danceable tracks",
                    "Try discovering new energetic artists",
                    "Consider workout or party playlists"
                ])
            elif primary_emotion in ["focused", "calm"]:
                recommendations.extend([
                    "Perfect for productivity and concentration",
                    "Explore lo-fi or classical music",
                    "Try ambient and instrumental tracks"
                ])
        
        if avg_intensity > 0.7:
            recommendations.append("You prefer high-intensity music - explore energetic genres")
        elif avg_intensity < 0.3:
            recommendations.append("You prefer gentle music - explore acoustic and ambient genres")
        
        return recommendations[:3]

    def _identify_patterns(self, emotion_history: List[Dict[str, Any]]) -> List[str]:
        """Identify patterns in emotion history."""
        patterns = []
        
        # Check for time-based patterns (if timestamps available)
        emotions_by_time = {}
        for record in emotion_history:
            if "timestamp" in record:
                hour = record["timestamp"].hour
                emotion = record["emotion"]
                if hour not in emotions_by_time:
                    emotions_by_time[hour] = []
                emotions_by_time[hour].append(emotion)
        
        if emotions_by_time:
            # Find time-based patterns
            for hour, emotions in emotions_by_time.items():
                if len(emotions) > 2:  # At least 3 detections at this hour
                    most_common = max(set(emotions), key=emotions.count)
                    patterns.append(f"Most {most_common} emotions detected around {hour}:00")
        
        return patterns

# Global instance
emotion_analyzer = EmotionAnalyzer()
