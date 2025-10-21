"""
Dynamic Mood Playlist Generator
Creates and manages personalized playlists based on emotions, context, and user preferences.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import uuid

from .emotion_analyzer import EmotionProfile, emotion_analyzer
from .spotify_emotion_matcher import spotify_emotion_matcher, EmotionMatch, EmotionPlaylist
from .recommendation_engine import recommendation_engine, RecommendationContext

logger = logging.getLogger(__name__)

@dataclass
class PlaylistConfig:
    """Configuration for playlist generation."""
    name: str
    description: str
    track_count: int = 15
    duration_target_minutes: Optional[int] = None
    genres: Optional[List[str]] = None
    min_popularity: int = 20
    max_popularity: int = 100
    include_previews: bool = True
    energy_curve: str = "steady"  # "steady", "building", "declining", "wave"
    mood_transitions: bool = True

@dataclass
class GeneratedPlaylist:
    """Generated playlist with metadata."""
    playlist_id: str
    name: str
    description: str
    emotion: str
    intensity: float
    tracks: List[EmotionMatch]
    total_duration_ms: int
    avg_match_score: float
    energy_curve: List[float]
    mood_transitions: List[str]
    cover_image: str
    created_at: datetime
    expires_at: Optional[datetime]
    user_id: Optional[str]
    tags: List[str]

class MoodPlaylistGenerator:
    """Dynamic mood playlist generator with advanced features."""
    
    def __init__(self):
        self.emotion_analyzer = emotion_analyzer
        self.spotify_matcher = spotify_emotion_matcher
        self.recommendation_engine = recommendation_engine
        
        # Playlist templates for different emotions
        self.playlist_templates = {
            "happy": {
                "name_template": "{emotion} Vibes",
                "description_template": "Uplifting tracks to match your {emotion} mood",
                "energy_curve": "building",
                "tags": ["upbeat", "positive", "energetic"]
            },
            "sad": {
                "name_template": "Melancholy {emotion}",
                "description_template": "Reflective music for your {emotion} moments",
                "energy_curve": "declining",
                "tags": ["emotional", "introspective", "healing"]
            },
            "angry": {
                "name_template": "{emotion} Release",
                "description_template": "Intense tracks to channel your {emotion} energy",
                "energy_curve": "steady",
                "tags": ["intense", "cathartic", "powerful"]
            },
            "calm": {
                "name_template": "Peaceful {emotion}",
                "description_template": "Serene music for your {emotion} state",
                "energy_curve": "steady",
                "tags": ["relaxing", "peaceful", "meditative"]
            },
            "energetic": {
                "name_template": "{emotion} Power",
                "description_template": "High-energy tracks for your {emotion} mood",
                "energy_curve": "building",
                "tags": ["energetic", "motivating", "dynamic"]
            },
            "romantic": {
                "name_template": "{emotion} Moments",
                "description_template": "Intimate tracks for your {emotion} mood",
                "energy_curve": "wave",
                "tags": ["romantic", "intimate", "passionate"]
            },
            "nostalgic": {
                "name_template": "{emotion} Memories",
                "description_template": "Timeless tracks for your {emotion} mood",
                "energy_curve": "declining",
                "tags": ["nostalgic", "timeless", "memories"]
            },
            "anxious": {
                "name_template": "Soothing {emotion}",
                "description_template": "Calming music for your {emotion} moments",
                "energy_curve": "declining",
                "tags": ["soothing", "calming", "grounding"]
            },
            "focused": {
                "name_template": "{emotion} Flow",
                "description_template": "Concentration music for your {emotion} state",
                "energy_curve": "steady",
                "tags": ["focused", "productive", "concentration"]
            },
            "neutral": {
                "name_template": "Balanced {emotion}",
                "description_template": "Versatile tracks for your {emotion} mood",
                "energy_curve": "steady",
                "tags": ["balanced", "versatile", "neutral"]
            }
        }
        
        # Energy curve patterns
        self.energy_curves = {
            "steady": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            "building": [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
            "declining": [0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25],
            "wave": [0.4, 0.6, 0.5, 0.7, 0.4, 0.6, 0.5, 0.7, 0.4, 0.6]
        }

    async def generate_mood_playlist(
        self,
        emotion: str,
        intensity: float = 0.7,
        confidence: float = 0.8,
        config: Optional[PlaylistConfig] = None,
        context: Optional[RecommendationContext] = None,
        user_id: Optional[str] = None
    ) -> GeneratedPlaylist:
        """
        Generate a comprehensive mood-based playlist.
        
        Args:
            emotion: Detected emotion
            intensity: Emotion intensity (0.0 to 1.0)
            confidence: Detection confidence (0.0 to 1.0)
            config: Optional playlist configuration
            context: Optional recommendation context
            user_id: Optional user ID for personalization
            
        Returns:
            GeneratedPlaylist with tracks and metadata
        """
        try:
            logger.info(f"🎧 Generating mood playlist for emotion: {emotion}")
            
            # Create emotion profile
            emotion_profile = self.emotion_analyzer.analyze_emotion_profile(
                emotion=emotion,
                intensity=intensity,
                confidence=confidence,
                context=context.activity if context else None
            )
            
            # Get playlist template
            template = self.playlist_templates.get(emotion, self.playlist_templates["neutral"])
            
            # Create playlist configuration
            if not config:
                config = self._create_default_config(emotion, template, intensity)
            
            # Generate track recommendations
            recommendations = await self.recommendation_engine.generate_recommendations(
                emotion=emotion,
                intensity=intensity,
                confidence=confidence,
                context=context,
                user_id=user_id,
                recommendation_type="tracks",
                limit=config.track_count * 2  # Get more to filter
            )
            
            if not recommendations.recommendations:
                logger.warning("No recommendations found, creating fallback playlist")
                return await self._create_fallback_playlist(emotion, intensity, config, user_id)
            
            # Apply playlist configuration filters
            filtered_tracks = self._apply_playlist_filters(
                recommendations.recommendations,
                config
            )
            
            # Apply energy curve and mood transitions
            curated_tracks = self._apply_energy_curve(
                filtered_tracks,
                config.energy_curve,
                emotion_profile
            )
            
            # Add mood transitions if enabled
            mood_transitions = []
            if config.mood_transitions:
                mood_transitions = self._generate_mood_transitions(
                    curated_tracks,
                    emotion_profile
                )
            
            # Limit to target track count
            final_tracks = curated_tracks[:config.track_count]
            
            # Calculate playlist statistics
            total_duration = sum(track.duration_ms for track in final_tracks)
            avg_score = sum(track.match_score for track in final_tracks) / len(final_tracks) if final_tracks else 0
            
            # Generate playlist ID and metadata
            playlist_id = f"mood_{emotion}_{uuid.uuid4().hex[:8]}"
            
            # Create cover image (use first track's album cover)
            cover_image = final_tracks[0].album_cover if final_tracks else "https://via.placeholder.com/400x400/333/fff?text=Mood+Playlist"
            
            # Set expiration (playlists expire after 7 days)
            expires_at = datetime.now() + timedelta(days=7)
            
            return GeneratedPlaylist(
                playlist_id=playlist_id,
                name=config.name,
                description=config.description,
                emotion=emotion,
                intensity=intensity,
                tracks=final_tracks,
                total_duration_ms=total_duration,
                avg_match_score=avg_score,
                energy_curve=self._calculate_energy_curve(final_tracks),
                mood_transitions=mood_transitions,
                cover_image=cover_image,
                created_at=datetime.now(),
                expires_at=expires_at,
                user_id=user_id,
                tags=template["tags"]
            )
            
        except Exception as e:
            logger.error(f"Error generating mood playlist: {e}")
            return await self._create_fallback_playlist(emotion, intensity, config, user_id)

    async def generate_contextual_playlist(
        self,
        emotion: str,
        intensity: float = 0.7,
        time_of_day: Optional[str] = None,
        activity: Optional[str] = None,
        weather: Optional[str] = None,
        duration_minutes: Optional[int] = None,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> GeneratedPlaylist:
        """
        Generate playlist based on context (time, activity, weather).
        
        Args:
            emotion: Detected emotion
            intensity: Emotion intensity (0.0 to 1.0)
            time_of_day: Time context (morning, afternoon, evening, night)
            activity: Activity context (workout, study, commute, etc.)
            weather: Weather context (sunny, rainy, cloudy, etc.)
            duration_minutes: Target playlist duration
            user_preferences: Optional user preferences
            
        Returns:
            GeneratedPlaylist tailored to context
        """
        try:
            # Create recommendation context
            context = RecommendationContext(
                current_emotion=self.emotion_analyzer.analyze_emotion_profile(emotion, intensity, 0.8),
                time_of_day=time_of_day or self._get_time_of_day(),
                day_of_week=datetime.now().strftime("%A").lower(),
                weather=weather,
                activity=activity,
                user_preferences=self._create_user_profile(user_preferences) if user_preferences else None
            )
            
            # Create contextual playlist configuration
            config = self._create_contextual_config(
                emotion, intensity, time_of_day, activity, weather, duration_minutes
            )
            
            # Generate playlist
            return await self.generate_mood_playlist(
                emotion=emotion,
                intensity=intensity,
                confidence=0.8,
                config=config,
                context=context,
                user_id=user_preferences.get("user_id") if user_preferences else None
            )
            
        except Exception as e:
            logger.error(f"Error generating contextual playlist: {e}")
            return await self._create_fallback_playlist(emotion, intensity, None, None)

    async def generate_emotion_transition_playlist(
        self,
        from_emotion: str,
        to_emotion: str,
        intensity: float = 0.7,
        transition_duration_minutes: int = 30,
        user_id: Optional[str] = None
    ) -> GeneratedPlaylist:
        """
        Generate playlist that transitions from one emotion to another.
        
        Args:
            from_emotion: Starting emotion
            to_emotion: Target emotion
            intensity: Transition intensity (0.0 to 1.0)
            transition_duration_minutes: Duration of transition
            user_id: Optional user ID
            
        Returns:
            GeneratedPlaylist with emotion transition
        """
        try:
            logger.info(f"🎭 Generating emotion transition playlist: {from_emotion} → {to_emotion}")
            
            # Calculate tracks needed based on duration (assuming 3.5 min average per track)
            track_count = max(8, int(transition_duration_minutes / 3.5))
            
            # Get tracks for both emotions
            from_profile = self.emotion_analyzer.analyze_emotion_profile(from_emotion, intensity, 0.8)
            to_profile = self.emotion_analyzer.analyze_emotion_profile(to_emotion, intensity, 0.8)
            
            from_tracks = await self.spotify_matcher.find_emotion_matches(from_profile, limit=track_count // 2)
            to_tracks = await self.spotify_matcher.find_emotion_matches(to_profile, limit=track_count // 2)
            
            # Create transition tracks (blend of both emotions)
            transition_tracks = self._create_transition_tracks(from_tracks, to_tracks, track_count)
            
            # Calculate transition curve
            transition_curve = self._calculate_transition_curve(from_profile, to_profile, track_count)
            
            # Create playlist
            playlist_id = f"transition_{from_emotion}_{to_emotion}_{uuid.uuid4().hex[:8]}"
            
            return GeneratedPlaylist(
                playlist_id=playlist_id,
                name=f"From {from_emotion.title()} to {to_emotion.title()}",
                description=f"A musical journey from {from_emotion} to {to_emotion}",
                emotion=f"{from_emotion}_to_{to_emotion}",
                intensity=intensity,
                tracks=transition_tracks,
                total_duration_ms=sum(track.duration_ms for track in transition_tracks),
                avg_match_score=sum(track.match_score for track in transition_tracks) / len(transition_tracks) if transition_tracks else 0,
                energy_curve=transition_curve,
                mood_transitions=[f"Transitioning from {from_emotion} to {to_emotion}"],
                cover_image=transition_tracks[0].album_cover if transition_tracks else "https://via.placeholder.com/400x400/333/fff?text=Transition",
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(days=3),  # Shorter expiration for transitions
                user_id=user_id,
                tags=["transition", "emotional", "journey"]
            )
            
        except Exception as e:
            logger.error(f"Error generating emotion transition playlist: {e}")
            return await self._create_fallback_playlist(from_emotion, intensity, None, user_id)

    def _create_default_config(self, emotion: str, template: Dict[str, Any], intensity: float) -> PlaylistConfig:
        """Create default playlist configuration."""
        return PlaylistConfig(
            name=template["name_template"].format(emotion=emotion.title()),
            description=template["description_template"].format(emotion=emotion),
            track_count=15,
            energy_curve=template["energy_curve"],
            mood_transitions=True
        )

    def _create_contextual_config(
        self,
        emotion: str,
        intensity: float,
        time_of_day: Optional[str],
        activity: Optional[str],
        weather: Optional[str],
        duration_minutes: Optional[int]
    ) -> PlaylistConfig:
        """Create configuration based on context."""
        
        # Base configuration
        track_count = 15
        energy_curve = "steady"
        name_parts = [emotion.title()]
        description_parts = [f"Music for your {emotion} mood"]
        
        # Adjust based on time of day
        if time_of_day:
            time_modifiers = {
                "morning": {"track_count": 12, "energy_curve": "building", "name": "Morning"},
                "afternoon": {"track_count": 15, "energy_curve": "steady", "name": "Afternoon"},
                "evening": {"track_count": 18, "energy_curve": "declining", "name": "Evening"},
                "night": {"track_count": 20, "energy_curve": "declining", "name": "Night"}
            }
            
            if time_of_day in time_modifiers:
                mod = time_modifiers[time_of_day]
                track_count = mod["track_count"]
                energy_curve = mod["energy_curve"]
                name_parts.insert(0, mod["name"])
        
        # Adjust based on activity
        if activity:
            activity_modifiers = {
                "workout": {"track_count": 25, "energy_curve": "building", "name": "Workout"},
                "study": {"track_count": 12, "energy_curve": "steady", "name": "Study"},
                "commute": {"track_count": 15, "energy_curve": "steady", "name": "Commute"},
                "party": {"track_count": 30, "energy_curve": "building", "name": "Party"},
                "relaxation": {"track_count": 10, "energy_curve": "declining", "name": "Relaxation"}
            }
            
            if activity in activity_modifiers:
                mod = activity_modifiers[activity]
                track_count = mod["track_count"]
                energy_curve = mod["energy_curve"]
                name_parts.insert(0, mod["name"])
                description_parts.append(f"perfect for {activity}")
        
        # Adjust track count based on duration
        if duration_minutes:
            track_count = max(8, min(50, int(duration_minutes / 3.5)))
        
        # Adjust based on weather
        if weather:
            weather_modifiers = {
                "sunny": {"energy_curve": "building", "description": "on this sunny day"},
                "rainy": {"energy_curve": "declining", "description": "for this rainy day"},
                "cloudy": {"energy_curve": "steady", "description": "for this cloudy day"}
            }
            
            if weather in weather_modifiers:
                mod = weather_modifiers[weather]
                energy_curve = mod["energy_curve"]
                description_parts.append(mod["description"])
        
        return PlaylistConfig(
            name=" ".join(name_parts),
            description=", ".join(description_parts),
            track_count=track_count,
            energy_curve=energy_curve,
            mood_transitions=True
        )

    def _apply_playlist_filters(self, tracks: List[EmotionMatch], config: PlaylistConfig) -> List[EmotionMatch]:
        """Apply playlist configuration filters to tracks."""
        filtered = []
        
        for track in tracks:
            # Apply popularity filter
            if config.min_popularity <= track.popularity <= config.max_popularity:
                # Apply preview filter
                if not config.include_previews or track.preview_url:
                    filtered.append(track)
        
        return filtered

    def _apply_energy_curve(
        self,
        tracks: List[EmotionMatch],
        energy_curve: str,
        emotion_profile: EmotionProfile
    ) -> List[EmotionMatch]:
        """Apply energy curve to playlist tracks."""
        if not tracks or energy_curve == "steady":
            return tracks
        
        # Get curve pattern
        curve_pattern = self.energy_curves.get(energy_curve, self.energy_curves["steady"])
        
        # Sort tracks by energy level (based on match score and popularity)
        sorted_tracks = sorted(tracks, key=lambda x: (x.match_score + x.popularity / 100.0) / 2)
        
        # Apply curve by reordering tracks
        curved_tracks = []
        track_count = len(sorted_tracks)
        
        for i in range(min(track_count, len(curve_pattern))):
            curve_value = curve_pattern[i]
            
            # Map curve value to track index
            if energy_curve == "building":
                # Start with lower energy, build up
                track_index = int(curve_value * (track_count - 1))
            elif energy_curve == "declining":
                # Start with higher energy, wind down
                track_index = int((1 - curve_value) * (track_count - 1))
            else:  # wave
                # Oscillate between high and low energy
                track_index = int(abs(curve_value - 0.5) * 2 * (track_count - 1))
            
            track_index = max(0, min(track_count - 1, track_index))
            
            if track_index < len(sorted_tracks):
                curved_tracks.append(sorted_tracks[track_index])
        
        # Add remaining tracks
        used_indices = set()
        for track in curved_tracks:
            if track in sorted_tracks:
                used_indices.add(sorted_tracks.index(track))
        
        for i, track in enumerate(sorted_tracks):
            if i not in used_indices:
                curved_tracks.append(track)
        
        return curved_tracks

    def _generate_mood_transitions(self, tracks: List[EmotionMatch], emotion_profile: EmotionProfile) -> List[str]:
        """Generate mood transition descriptions."""
        if len(tracks) < 3:
            return []
        
        transitions = []
        track_count = len(tracks)
        
        # Create transitions at 1/3 and 2/3 points
        transition_points = [track_count // 3, 2 * track_count // 3]
        
        for point in transition_points:
            if point < len(tracks):
                track = tracks[point]
                transition_desc = f"Transitioning to {track.artist_name} - {track.track_name}"
                transitions.append(transition_desc)
        
        return transitions

    def _calculate_energy_curve(self, tracks: List[EmotionMatch]) -> List[float]:
        """Calculate actual energy curve of playlist tracks."""
        if not tracks:
            return []
        
        curve = []
        for track in tracks:
            # Use match score as energy indicator
            energy = track.match_score
            curve.append(energy)
        
        return curve

    def _calculate_transition_curve(
        self,
        from_profile: EmotionProfile,
        to_profile: EmotionProfile,
        track_count: int
    ) -> List[float]:
        """Calculate energy curve for emotion transition."""
        from_energy = from_profile.energy_level
        to_energy = to_profile.energy_level
        
        curve = []
        for i in range(track_count):
            # Linear interpolation from from_energy to to_energy
            progress = i / (track_count - 1) if track_count > 1 else 0
            energy = from_energy + (to_energy - from_energy) * progress
            curve.append(energy)
        
        return curve

    def _create_transition_tracks(
        self,
        from_tracks: List[EmotionMatch],
        to_tracks: List[EmotionMatch],
        target_count: int
    ) -> List[EmotionMatch]:
        """Create transition tracks by blending from and to tracks."""
        transition_tracks = []
        
        # Start with from_emotion tracks
        from_count = target_count // 3
        transition_tracks.extend(from_tracks[:from_count])
        
        # Add middle transition tracks (blend)
        middle_count = target_count // 3
        for i in range(middle_count):
            if i < len(from_tracks) and i < len(to_tracks):
                # Create blended track (simplified - just alternate)
                if i % 2 == 0:
                    transition_tracks.append(from_tracks[i])
                else:
                    transition_tracks.append(to_tracks[i])
        
        # End with to_emotion tracks
        to_count = target_count - len(transition_tracks)
        transition_tracks.extend(to_tracks[:to_count])
        
        return transition_tracks[:target_count]

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

    def _create_user_profile(self, user_preferences: Dict[str, Any]) -> Optional[Any]:
        """Create user profile from preferences (placeholder for now)."""
        # This would integrate with your user system
        return None

    async def _create_fallback_playlist(
        self,
        emotion: str,
        intensity: float,
        config: Optional[PlaylistConfig],
        user_id: Optional[str]
    ) -> GeneratedPlaylist:
        """Create fallback playlist when generation fails."""
        fallback_tracks = []
        
        try:
            # Try to get some basic recommendations
            basic_recs = await self.recommendation_engine.get_smart_recommendations(
                emotion=emotion,
                intensity=intensity,
                limit=10
            )
            
            if basic_recs.get("recommendations"):
                for rec_data in basic_recs["recommendations"]:
                    from .spotify_emotion_matcher import EmotionMatch
                    track = EmotionMatch(
                        track_id=rec_data["track_id"],
                        track_name=rec_data["name"],
                        artist_name=rec_data["artist"],
                        album_name=rec_data["album"],
                        match_score=rec_data["match_score"],
                        emotion_fit=rec_data.get("emotion_fit", {}),
                        preview_url=rec_data["preview_url"],
                        spotify_url=rec_data["spotify_url"],
                        album_cover=rec_data["album_cover"],
                        duration_ms=rec_data["duration_ms"],
                        popularity=rec_data["popularity"]
                    )
                    fallback_tracks.append(track)
        except Exception as e:
            logger.error(f"Error creating fallback tracks: {e}")
        
        return GeneratedPlaylist(
            playlist_id=f"fallback_{emotion}_{uuid.uuid4().hex[:8]}",
            name=f"{emotion.title()} Playlist",
            description=f"Fallback playlist for {emotion} mood",
            emotion=emotion,
            intensity=intensity,
            tracks=fallback_tracks,
            total_duration_ms=sum(track.duration_ms for track in fallback_tracks),
            avg_match_score=0.5,
            energy_curve=[0.5] * len(fallback_tracks),
            mood_transitions=[],
            cover_image="https://via.placeholder.com/400x400/333/fff?text=Fallback+Playlist",
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(days=1),
            user_id=user_id,
            tags=["fallback", "basic"]
        )

# Global instance
mood_playlist_generator = MoodPlaylistGenerator()
