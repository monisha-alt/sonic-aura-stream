"""
AI-Powered Music Recommendation Engine
Combines emotion detection, Spotify data, and user preferences for intelligent recommendations.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import math

from .emotion_analyzer import EmotionProfile, emotion_analyzer
from .spotify_emotion_matcher import spotify_emotion_matcher, EmotionMatch, EmotionPlaylist
from .spotify_service import spotify_service

logger = logging.getLogger(__name__)

@dataclass
class UserProfile:
    """User's music listening profile."""
    user_id: str
    favorite_genres: List[str]
    favorite_artists: List[str]
    favorite_songs: List[str]
    listening_history: List[Dict[str, Any]]
    emotion_history: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

@dataclass
class RecommendationContext:
    """Context for generating recommendations."""
    current_emotion: EmotionProfile
    time_of_day: str
    day_of_week: str
    weather: Optional[str] = None
    activity: Optional[str] = None
    location: Optional[str] = None
    user_preferences: Optional[UserProfile] = None

@dataclass
class RecommendationResult:
    """Result of recommendation generation."""
    recommendations: List[EmotionMatch]
    playlist: Optional[EmotionPlaylist]
    reasoning: str
    confidence: float
    context_factors: List[str]
    alternative_suggestions: List[str]
    created_at: datetime

class RecommendationEngine:
    """AI-powered music recommendation engine."""
    
    def __init__(self):
        self.emotion_analyzer = emotion_analyzer
        self.spotify_matcher = spotify_emotion_matcher
        self.spotify_service = spotify_service
        
        # Recommendation weights for different factors
        self.factor_weights = {
            "emotion_match": 0.4,
            "user_history": 0.25,
            "popularity": 0.15,
            "diversity": 0.10,
            "context": 0.10
        }
        
        # Time-based recommendation modifiers
        self.time_modifiers = {
            "morning": {"energy_boost": 0.1, "valence_boost": 0.05, "genres": ["pop", "indie"]},
            "afternoon": {"energy_boost": 0.0, "valence_boost": 0.0, "genres": []},
            "evening": {"energy_boost": -0.05, "valence_boost": -0.02, "genres": ["jazz", "ambient"]},
            "night": {"energy_boost": -0.1, "valence_boost": -0.05, "genres": ["ambient", "chill"]}
        }
        
        # Activity-based recommendation modifiers
        self.activity_modifiers = {
            "workout": {"energy_boost": 0.3, "valence_boost": 0.15, "genres": ["electronic", "rock", "hip-hop"]},
            "study": {"energy_boost": -0.2, "valence_boost": 0.0, "genres": ["ambient", "instrumental", "classical"]},
            "party": {"energy_boost": 0.4, "valence_boost": 0.2, "genres": ["dance", "pop", "electronic"]},
            "commute": {"energy_boost": 0.0, "valence_boost": 0.05, "genres": ["pop", "indie", "alternative"]},
            "relaxation": {"energy_boost": -0.3, "valence_boost": 0.1, "genres": ["ambient", "chill", "jazz"]},
            "cooking": {"energy_boost": 0.1, "valence_boost": 0.1, "genres": ["jazz", "funk", "soul"]},
            "driving": {"energy_boost": 0.05, "valence_boost": 0.0, "genres": ["rock", "pop", "alternative"]}
        }

    async def generate_recommendations(
        self,
        emotion: str,
        intensity: float = 0.7,
        confidence: float = 0.8,
        context: Optional[RecommendationContext] = None,
        user_id: Optional[str] = None,
        recommendation_type: str = "mixed",  # "tracks", "playlist", "mixed"
        limit: int = 20
    ) -> RecommendationResult:
        """
        Generate intelligent music recommendations based on emotion and context.
        
        Args:
            emotion: Detected emotion
            intensity: Emotion intensity (0.0 to 1.0)
            confidence: Detection confidence (0.0 to 1.0)
            context: Optional recommendation context
            user_id: Optional user ID for personalization
            recommendation_type: Type of recommendations ("tracks", "playlist", "mixed")
            limit: Maximum number of recommendations
            
        Returns:
            RecommendationResult with recommendations and metadata
        """
        try:
            logger.info(f"🤖 Generating recommendations for emotion: {emotion}")
            
            # Create emotion profile
            emotion_profile = self.emotion_analyzer.analyze_emotion_profile(
                emotion=emotion,
                intensity=intensity,
                confidence=confidence,
                context=context.activity if context else None
            )
            
            # Apply context modifiers
            modified_profile = self._apply_context_modifiers(emotion_profile, context)
            
            # Get base recommendations
            base_recommendations = await self.spotify_matcher.find_emotion_matches(
                emotion_profile=modified_profile,
                limit=limit * 2  # Get more to filter and rank
            )
            
            # Apply personalization if user data available
            if user_id and context and context.user_preferences:
                personalized_recommendations = self._apply_personalization(
                    base_recommendations, 
                    context.user_preferences,
                    modified_profile
                )
            else:
                personalized_recommendations = base_recommendations
            
            # Rank and filter recommendations
            ranked_recommendations = self._rank_recommendations(
                personalized_recommendations,
                modified_profile,
                context
            )
            
            # Apply diversity filter
            diverse_recommendations = self._ensure_diversity(ranked_recommendations[:limit])
            
            # Generate playlist if requested
            playlist = None
            if recommendation_type in ["playlist", "mixed"]:
                playlist = await self.spotify_matcher.create_emotion_playlist(
                    emotion_profile=modified_profile,
                    track_count=min(15, limit),
                    genres=self._get_context_genres(context)
                )
            
            # Generate reasoning and alternative suggestions
            reasoning = self._generate_reasoning(emotion_profile, modified_profile, context, diverse_recommendations)
            alternative_suggestions = self._generate_alternative_suggestions(emotion_profile, context)
            context_factors = self._identify_context_factors(context, modified_profile)
            
            # Calculate overall confidence
            overall_confidence = self._calculate_confidence(
                confidence, 
                len(diverse_recommendations), 
                context
            )
            
            return RecommendationResult(
                recommendations=diverse_recommendations,
                playlist=playlist,
                reasoning=reasoning,
                confidence=overall_confidence,
                context_factors=context_factors,
                alternative_suggestions=alternative_suggestions,
                created_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return RecommendationResult(
                recommendations=[],
                playlist=None,
                reasoning=f"Error generating recommendations: {str(e)}",
                confidence=0.0,
                context_factors=[],
                alternative_suggestions=[],
                created_at=datetime.now()
            )

    async def get_smart_recommendations(
        self,
        emotion: str,
        intensity: float = 0.7,
        confidence: float = 0.8,
        time_of_day: Optional[str] = None,
        activity: Optional[str] = None,
        user_preferences: Optional[Dict[str, Any]] = None,
        limit: int = 15
    ) -> Dict[str, Any]:
        """
        Simplified API for getting smart recommendations.
        
        Args:
            emotion: Detected emotion
            intensity: Emotion intensity (0.0 to 1.0)
            confidence: Detection confidence (0.0 to 1.0)
            time_of_day: Optional time context
            activity: Optional activity context
            user_preferences: Optional user preferences
            limit: Number of recommendations
            
        Returns:
            Dictionary with recommendations and metadata
        """
        try:
            # Create context
            context = RecommendationContext(
                current_emotion=self.emotion_analyzer.analyze_emotion_profile(emotion, intensity, confidence),
                time_of_day=time_of_day or self._get_time_of_day(),
                day_of_week=datetime.now().strftime("%A").lower(),
                activity=activity,
                user_preferences=self._create_user_profile(user_preferences) if user_preferences else None
            )
            
            # Generate recommendations
            result = await self.generate_recommendations(
                emotion=emotion,
                intensity=intensity,
                confidence=confidence,
                context=context,
                recommendation_type="mixed",
                limit=limit
            )
            
            # Format response
            return {
                "emotion": emotion,
                "intensity": intensity,
                "confidence": result.confidence,
                "reasoning": result.reasoning,
                "context_factors": result.context_factors,
                "recommendations": [
                    {
                        "track_id": rec.track_id,
                        "name": rec.track_name,
                        "artist": rec.artist_name,
                        "album": rec.album_name,
                        "match_score": rec.match_score,
                        "preview_url": rec.preview_url,
                        "spotify_url": rec.spotify_url,
                        "album_cover": rec.album_cover,
                        "duration_ms": rec.duration_ms,
                        "popularity": rec.popularity,
                        "emotion_fit": rec.emotion_fit
                    }
                    for rec in result.recommendations
                ],
                "playlist": {
                    "emotion": result.playlist.emotion if result.playlist else emotion,
                    "tracks": len(result.playlist.tracks) if result.playlist else 0,
                    "total_duration_ms": result.playlist.total_duration_ms if result.playlist else 0,
                    "avg_match_score": result.playlist.avg_match_score if result.playlist else 0,
                    "mood_description": result.playlist.mood_description if result.playlist else "",
                    "playlist_id": result.playlist.playlist_id if result.playlist else "",
                    "cover_image": result.playlist.cover_image if result.playlist else ""
                } if result.playlist else None,
                "alternative_suggestions": result.alternative_suggestions,
                "created_at": result.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting smart recommendations: {e}")
            return {
                "emotion": emotion,
                "error": str(e),
                "recommendations": [],
                "playlist": None,
                "reasoning": "Unable to generate recommendations due to an error"
            }

    def _apply_context_modifiers(
        self, 
        emotion_profile: EmotionProfile, 
        context: Optional[RecommendationContext]
    ) -> EmotionProfile:
        """Apply context-based modifiers to emotion profile."""
        if not context:
            return emotion_profile
        
        # Start with base profile
        modified_profile = emotion_profile
        
        # Apply time-based modifiers
        if context.time_of_day in self.time_modifiers:
            time_mod = self.time_modifiers[context.time_of_day]
            modified_profile.energy_level = min(1.0, modified_profile.energy_level + time_mod["energy_boost"])
            modified_profile.valence = max(0.0, min(1.0, modified_profile.valence + time_mod["valence_boost"]))
        
        # Apply activity-based modifiers
        if context.activity in self.activity_modifiers:
            activity_mod = self.activity_modifiers[context.activity]
            modified_profile.energy_level = min(1.0, modified_profile.energy_level + activity_mod["energy_boost"])
            modified_profile.valence = max(0.0, min(1.0, modified_profile.valence + activity_mod["valence_boost"]))
        
        # Update arousal based on modified energy
        modified_profile.arousal = modified_profile.energy_level * modified_profile.intensity
        
        return modified_profile

    def _apply_personalization(
        self, 
        recommendations: List[EmotionMatch], 
        user_profile: UserProfile,
        emotion_profile: EmotionProfile
    ) -> List[EmotionMatch]:
        """Apply user personalization to recommendations."""
        if not user_profile or not recommendations:
            return recommendations
        
        personalized = []
        
        for rec in recommendations:
            # Boost score for user's favorite genres/artists
            genre_boost = 0.0
            artist_boost = 0.0
            
            # Check for genre matches
            for favorite_genre in user_profile.favorite_genres:
                if favorite_genre.lower() in rec.artist_name.lower():
                    genre_boost += 0.1
            
            # Check for artist matches
            if rec.artist_name in user_profile.favorite_artists:
                artist_boost += 0.2
            
            # Check listening history for similar tracks
            history_boost = 0.0
            for history_item in user_profile.listening_history[-10:]:  # Last 10 listens
                if (history_item.get("artist") == rec.artist_name or 
                    history_item.get("genre") in user_profile.favorite_genres):
                    history_boost += 0.05
            
            # Apply boosts
            total_boost = min(0.3, genre_boost + artist_boost + history_boost)
            rec.match_score = min(1.0, rec.match_score + total_boost)
            
            personalized.append(rec)
        
        return personalized

    def _rank_recommendations(
        self,
        recommendations: List[EmotionMatch],
        emotion_profile: EmotionProfile,
        context: Optional[RecommendationContext]
    ) -> List[EmotionMatch]:
        """Rank recommendations based on multiple factors."""
        if not recommendations:
            return []
        
        ranked = []
        
        for rec in recommendations:
            # Start with base match score
            total_score = rec.match_score * self.factor_weights["emotion_match"]
            
            # Add popularity factor
            popularity_score = rec.popularity / 100.0
            total_score += popularity_score * self.factor_weights["popularity"]
            
            # Add diversity factor (prefer different artists)
            diversity_score = 1.0  # Will be adjusted in _ensure_diversity
            total_score += diversity_score * self.factor_weights["diversity"]
            
            # Add context factor
            context_score = self._calculate_context_score(rec, context)
            total_score += context_score * self.factor_weights["context"]
            
            # Create new recommendation with updated score
            updated_rec = EmotionMatch(
                track_id=rec.track_id,
                track_name=rec.track_name,
                artist_name=rec.artist_name,
                album_name=rec.album_name,
                match_score=min(1.0, total_score),
                emotion_fit=rec.emotion_fit,
                preview_url=rec.preview_url,
                spotify_url=rec.spotify_url,
                album_cover=rec.album_cover,
                duration_ms=rec.duration_ms,
                popularity=rec.popularity
            )
            
            ranked.append(updated_rec)
        
        # Sort by total score
        ranked.sort(key=lambda x: x.match_score, reverse=True)
        return ranked

    def _ensure_diversity(self, recommendations: List[EmotionMatch]) -> List[EmotionMatch]:
        """Ensure diversity in recommendations by limiting similar artists."""
        if not recommendations:
            return []
        
        diverse = []
        artist_counts = {}
        max_artist_count = 2  # Max 2 tracks per artist
        
        for rec in recommendations:
            artist = rec.artist_name
            current_count = artist_counts.get(artist, 0)
            
            if current_count < max_artist_count:
                diverse.append(rec)
                artist_counts[artist] = current_count + 1
            elif len(diverse) < 10:  # Allow some flexibility for top recommendations
                diverse.append(rec)
                artist_counts[artist] = current_count + 1
        
        return diverse

    def _calculate_context_score(self, rec: EmotionMatch, context: Optional[RecommendationContext]) -> float:
        """Calculate context-based score for a recommendation."""
        if not context:
            return 0.5
        
        score = 0.5  # Base score
        
        # Time-based scoring
        if context.time_of_day == "morning" and rec.match_score > 0.7:
            score += 0.2
        elif context.time_of_day == "night" and rec.match_score < 0.6:
            score += 0.2
        
        # Activity-based scoring
        if context.activity == "workout" and rec.popularity > 60:
            score += 0.2
        elif context.activity == "study" and rec.match_score < 0.5:
            score += 0.2
        
        return min(1.0, score)

    def _generate_reasoning(
        self,
        original_profile: EmotionProfile,
        modified_profile: EmotionProfile,
        context: Optional[RecommendationContext],
        recommendations: List[EmotionMatch]
    ) -> str:
        """Generate human-readable reasoning for recommendations."""
        reasoning_parts = []
        
        # Emotion reasoning
        emotion = original_profile.primary_emotion.value
        intensity_desc = "very" if original_profile.intensity > 0.7 else "moderately" if original_profile.intensity > 0.4 else "somewhat"
        reasoning_parts.append(f"Based on your {intensity_desc} {emotion} mood")
        
        # Context reasoning
        if context:
            if context.activity:
                reasoning_parts.append(f"and {context.activity} context")
            if context.time_of_day:
                reasoning_parts.append(f"during {context.time_of_day}")
        
        # Recommendation quality reasoning
        if recommendations:
            avg_score = sum(rec.match_score for rec in recommendations) / len(recommendations)
            if avg_score > 0.8:
                reasoning_parts.append("I found excellent matches")
            elif avg_score > 0.6:
                reasoning_parts.append("I found good matches")
            else:
                reasoning_parts.append("I found some suitable matches")
        
        # Genre diversity
        if recommendations:
            genres = set()
            for rec in recommendations:
                # Extract genre hints from artist/album names (simplified)
                if any(genre in rec.artist_name.lower() for genre in ["pop", "rock", "jazz", "electronic"]):
                    genres.add("mixed")
            
            if len(genres) > 1:
                reasoning_parts.append("with diverse musical styles")
        
        return ", ".join(reasoning_parts) + "."

    def _generate_alternative_suggestions(
        self,
        emotion_profile: EmotionProfile,
        context: Optional[RecommendationContext]
    ) -> List[str]:
        """Generate alternative suggestions based on emotion and context."""
        suggestions = []
        
        emotion = emotion_profile.primary_emotion.value
        
        # Emotion-based alternatives
        emotion_alternatives = {
            "happy": ["Try upbeat pop or dance music", "Explore feel-good indie tracks", "Consider summer playlists"],
            "sad": ["Try melancholic indie or folk", "Explore ambient or chill music", "Consider healing playlists"],
            "angry": ["Try intense rock or metal", "Explore cathartic electronic music", "Consider workout playlists"],
            "calm": ["Try ambient or instrumental music", "Explore jazz or classical", "Consider meditation playlists"],
            "energetic": ["Try high-energy electronic", "Explore workout or party music", "Consider dance playlists"],
            "romantic": ["Try R&B or soul music", "Explore intimate acoustic tracks", "Consider love song playlists"],
            "focused": ["Try lo-fi or instrumental", "Explore classical or ambient", "Consider study playlists"]
        }
        
        suggestions.extend(emotion_alternatives.get(emotion, ["Try exploring different genres"]))
        
        # Context-based alternatives
        if context and context.activity:
            activity_suggestions = {
                "workout": ["Try high-energy tracks", "Explore motivational playlists"],
                "study": ["Try instrumental music", "Explore focus playlists"],
                "party": ["Try dance music", "Explore party playlists"],
                "commute": ["Try podcast-friendly music", "Explore easy listening"]
            }
            suggestions.extend(activity_suggestions.get(context.activity, []))
        
        return suggestions[:3]  # Limit to 3 suggestions

    def _identify_context_factors(
        self,
        context: Optional[RecommendationContext],
        emotion_profile: EmotionProfile
    ) -> List[str]:
        """Identify factors that influenced recommendations."""
        factors = []
        
        if context:
            if context.time_of_day:
                factors.append(f"Time: {context.time_of_day}")
            if context.activity:
                factors.append(f"Activity: {context.activity}")
            if context.weather:
                factors.append(f"Weather: {context.weather}")
            if context.user_preferences:
                factors.append("User preferences")
        
        factors.append(f"Emotion intensity: {emotion_profile.intensity:.1f}")
        factors.append(f"Energy level: {emotion_profile.energy_level:.1f}")
        
        return factors

    def _calculate_confidence(
        self,
        emotion_confidence: float,
        recommendation_count: int,
        context: Optional[RecommendationContext]
    ) -> float:
        """Calculate overall confidence in recommendations."""
        base_confidence = emotion_confidence
        
        # Boost confidence with more recommendations
        if recommendation_count > 10:
            base_confidence += 0.1
        elif recommendation_count > 5:
            base_confidence += 0.05
        
        # Boost confidence with rich context
        if context:
            context_factors = sum([
                1 if context.time_of_day else 0,
                1 if context.activity else 0,
                1 if context.user_preferences else 0
            ])
            base_confidence += context_factors * 0.05
        
        return min(1.0, base_confidence)

    def _get_time_of_day(self) -> str:
        """Get current time of day."""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"

    def _get_context_genres(self, context: Optional[RecommendationContext]) -> List[str]:
        """Get genres based on context."""
        genres = []
        
        if context:
            if context.time_of_day in self.time_modifiers:
                genres.extend(self.time_modifiers[context.time_of_day]["genres"])
            
            if context.activity in self.activity_modifiers:
                genres.extend(self.activity_modifiers[context.activity]["genres"])
        
        return list(set(genres))

    def _create_user_profile(self, user_preferences: Dict[str, Any]) -> Optional[UserProfile]:
        """Create UserProfile from user preferences dict."""
        if not user_preferences:
            return None
        
        try:
            return UserProfile(
                user_id=user_preferences.get("user_id", "anonymous"),
                favorite_genres=user_preferences.get("favorite_genres", []),
                favorite_artists=user_preferences.get("favorite_artists", []),
                favorite_songs=user_preferences.get("favorite_songs", []),
                listening_history=user_preferences.get("listening_history", []),
                emotion_history=user_preferences.get("emotion_history", []),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            return None

# Global instance
recommendation_engine = RecommendationEngine()
