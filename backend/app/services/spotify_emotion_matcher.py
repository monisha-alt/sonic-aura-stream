"""
Spotify Emotion Matcher Service
Matches Spotify tracks with user emotions using audio features and AI.
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import math

from .spotify_service import spotify_service
from .emotion_analyzer import EmotionProfile, MusicPreferences, emotion_analyzer

logger = logging.getLogger(__name__)

@dataclass
class EmotionMatch:
    """Result of matching a track with an emotion."""
    track_id: str
    track_name: str
    artist_name: str
    album_name: str
    match_score: float  # 0.0 to 1.0
    emotion_fit: Dict[str, float]  # Individual feature scores
    preview_url: Optional[str]
    spotify_url: str
    album_cover: str
    duration_ms: int
    popularity: int

@dataclass
class EmotionPlaylist:
    """Generated playlist for a specific emotion."""
    emotion: str
    tracks: List[EmotionMatch]
    total_duration_ms: int
    avg_match_score: float
    mood_description: str
    playlist_id: str
    cover_image: str

class SpotifyEmotionMatcher:
    """Service to match Spotify tracks with user emotions."""
    
    def __init__(self):
        self.spotify_service = spotify_service
        self.emotion_analyzer = emotion_analyzer
        
        # Weight configuration for matching algorithm
        self.feature_weights = {
            "valence": 0.25,
            "energy": 0.20,
            "danceability": 0.15,
            "acousticness": 0.10,
            "instrumentalness": 0.10,
            "liveness": 0.05,
            "speechiness": 0.05,
            "tempo": 0.10
        }
        
        # Tolerance ranges for features (how much deviation is acceptable)
        self.tolerance_ranges = {
            "valence": 0.2,
            "energy": 0.2,
            "danceability": 0.3,
            "acousticness": 0.4,
            "instrumentalness": 0.3,
            "liveness": 0.4,
            "speechiness": 0.3,
            "tempo": 0.15
        }

    async def find_emotion_matches(
        self, 
        emotion_profile: EmotionProfile,
        limit: int = 20,
        genres: Optional[List[str]] = None,
        min_popularity: int = 0
    ) -> List[EmotionMatch]:
        """
        Find Spotify tracks that match the given emotion profile.
        
        Args:
            emotion_profile: User's emotion profile
            limit: Maximum number of tracks to return
            genres: Optional genre filter
            min_popularity: Minimum popularity score (0-100)
            
        Returns:
            List of EmotionMatch objects sorted by match score
        """
        try:
            logger.info(f"🎵 Finding emotion matches for {emotion_profile.primary_emotion.value}")
            
            # Generate music preferences from emotion
            music_prefs = self.emotion_analyzer.generate_music_preferences(emotion_profile)
            
            # Get search queries based on emotion and genres
            search_queries = self._generate_search_queries(emotion_profile, music_prefs, genres)
            
            all_matches = []
            
            # Search for tracks using different queries
            for query in search_queries:
                try:
                    # Search tracks
                    search_results = await self.spotify_service.search_tracks(
                        query=query,
                        limit=min(50, limit * 2)  # Get more to filter later
                    )
                    
                    if not search_results or not search_results.get("tracks"):
                        continue
                    
                    tracks = search_results["tracks"].get("items", [])
                    
                    # Get track IDs for audio features
                    track_ids = [track["id"] for track in tracks[:20]]  # Limit to avoid API limits
                    
                    if track_ids:
                        # Get audio features for tracks
                        audio_features = await self._get_audio_features_batch(track_ids)
                        
                        # Match tracks with emotion profile
                        for track in tracks:
                            track_id = track["id"]
                            if track_id in audio_features:
                                match = self._calculate_emotion_match(
                                    track, 
                                    audio_features[track_id], 
                                    music_prefs,
                                    emotion_profile
                                )
                                
                                if match and match.match_score > 0.3:  # Minimum match threshold
                                    all_matches.append(match)
                
                except Exception as e:
                    logger.warning(f"Error searching with query '{query}': {e}")
                    continue
            
            # Remove duplicates and sort by match score
            unique_matches = self._remove_duplicates(all_matches)
            unique_matches.sort(key=lambda x: x.match_score, reverse=True)
            
            # Filter by popularity if specified
            if min_popularity > 0:
                unique_matches = [m for m in unique_matches if m.popularity >= min_popularity]
            
            # Return top matches
            return unique_matches[:limit]
            
        except Exception as e:
            logger.error(f"Error finding emotion matches: {e}")
            return []

    async def create_emotion_playlist(
        self,
        emotion_profile: EmotionProfile,
        playlist_name: Optional[str] = None,
        track_count: int = 15,
        genres: Optional[List[str]] = None
    ) -> EmotionPlaylist:
        """
        Create a complete playlist for the given emotion profile.
        
        Args:
            emotion_profile: User's emotion profile
            playlist_name: Optional custom playlist name
            track_count: Number of tracks in playlist
            genres: Optional genre filter
            
        Returns:
            EmotionPlaylist object
        """
        try:
            logger.info(f"🎧 Creating emotion playlist for {emotion_profile.primary_emotion.value}")
            
            # Find matching tracks
            matches = await self.find_emotion_matches(
                emotion_profile=emotion_profile,
                limit=track_count,
                genres=genres,
                min_popularity=20  # Ensure decent quality tracks
            )
            
            if not matches:
                logger.warning("No matching tracks found, creating fallback playlist")
                matches = await self._create_fallback_matches(emotion_profile, track_count)
            
            # Generate playlist metadata
            playlist_name = playlist_name or f"{emotion_profile.primary_emotion.value.title()} Vibes"
            mood_description = emotion_profile.mood_context
            
            # Calculate playlist statistics
            total_duration = sum(match.duration_ms for match in matches)
            avg_score = sum(match.match_score for match in matches) / len(matches) if matches else 0
            
            # Generate playlist ID
            playlist_id = f"emotion_{emotion_profile.primary_emotion.value}_{int(asyncio.get_event_loop().time())}"
            
            # Use first track's album cover as playlist cover
            cover_image = matches[0].album_cover if matches else "https://via.placeholder.com/400x400/333/fff?text=Playlist"
            
            return EmotionPlaylist(
                emotion=emotion_profile.primary_emotion.value,
                tracks=matches,
                total_duration_ms=total_duration,
                avg_match_score=avg_score,
                mood_description=mood_description,
                playlist_id=playlist_id,
                cover_image=cover_image
            )
            
        except Exception as e:
            logger.error(f"Error creating emotion playlist: {e}")
            # Return empty playlist as fallback
            return EmotionPlaylist(
                emotion=emotion_profile.primary_emotion.value,
                tracks=[],
                total_duration_ms=0,
                avg_match_score=0.0,
                mood_description="No tracks available",
                playlist_id="empty",
                cover_image="https://via.placeholder.com/400x400/333/fff?text=No+Tracks"
            )

    async def get_recommendations_for_emotion(
        self,
        emotion: str,
        intensity: float = 0.7,
        confidence: float = 0.8,
        context: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get quick recommendations for an emotion without full profile.
        
        Args:
            emotion: Emotion string
            intensity: Emotion intensity (0.0 to 1.0)
            confidence: Detection confidence (0.0 to 1.0)
            context: Optional context
            limit: Number of recommendations
            
        Returns:
            Dictionary with recommendations and metadata
        """
        try:
            # Create emotion profile
            emotion_profile = self.emotion_analyzer.analyze_emotion_profile(
                emotion=emotion,
                intensity=intensity,
                confidence=confidence,
                context=context
            )
            
            # Find matches
            matches = await self.find_emotion_matches(
                emotion_profile=emotion_profile,
                limit=limit
            )
            
            # Generate music preferences for additional info
            music_prefs = self.emotion_analyzer.generate_music_preferences(emotion_profile)
            
            return {
                "emotion": emotion,
                "intensity": intensity,
                "confidence": confidence,
                "context": context,
                "mood_description": emotion_profile.mood_context,
                "recommended_tracks": [
                    {
                        "track_id": match.track_id,
                        "name": match.track_name,
                        "artist": match.artist_name,
                        "album": match.album_name,
                        "match_score": match.match_score,
                        "preview_url": match.preview_url,
                        "spotify_url": match.spotify_url,
                        "album_cover": match.album_cover,
                        "duration_ms": match.duration_ms,
                        "popularity": match.popularity
                    }
                    for match in matches
                ],
                "target_features": {
                    "valence": music_prefs.target_valence,
                    "energy": music_prefs.target_energy,
                    "danceability": music_prefs.target_danceability,
                    "acousticness": music_prefs.target_acousticness,
                    "tempo": music_prefs.target_tempo
                },
                "preferred_genres": music_prefs.preferred_genres,
                "mood_keywords": music_prefs.mood_keywords
            }
            
        except Exception as e:
            logger.error(f"Error getting emotion recommendations: {e}")
            return {
                "emotion": emotion,
                "error": str(e),
                "recommended_tracks": [],
                "mood_description": "Unable to generate recommendations"
            }

    def _generate_search_queries(
        self, 
        emotion_profile: EmotionProfile, 
        music_prefs: MusicPreferences,
        genres: Optional[List[str]]
    ) -> List[str]:
        """Generate search queries for finding matching tracks."""
        queries = []
        
        # Use preferred genres or provided genres
        search_genres = genres or music_prefs.preferred_genres[:3]
        
        # Emotion-based queries
        emotion = emotion_profile.primary_emotion.value
        queries.extend([
            f"mood:{emotion}",
            f"genre:{search_genres[0]}" if search_genres else emotion,
            f"year:2020-2024 genre:{search_genres[0]}" if search_genres else f"year:2020-2024 {emotion}"
        ])
        
        # Mood keyword queries
        for keyword in music_prefs.mood_keywords[:2]:
            queries.append(f"mood:{keyword}")
        
        # Genre-specific queries
        for genre in search_genres[:2]:
            queries.append(f"genre:{genre}")
        
        # Remove duplicates and limit
        return list(set(queries))[:5]

    async def _get_audio_features_batch(self, track_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Get audio features for multiple tracks efficiently."""
        try:
            features_dict = {}
            
            # Process in batches to avoid API limits
            batch_size = 10
            for i in range(0, len(track_ids), batch_size):
                batch = track_ids[i:i + batch_size]
                
                for track_id in batch:
                    try:
                        features = await self.spotify_service.get_audio_features(track_id)
                        if features:
                            features_dict[track_id] = features
                    except Exception as e:
                        logger.warning(f"Error getting features for track {track_id}: {e}")
                        continue
                
                # Small delay between batches
                await asyncio.sleep(0.1)
            
            return features_dict
            
        except Exception as e:
            logger.error(f"Error getting audio features batch: {e}")
            return {}

    def _calculate_emotion_match(
        self,
        track: Dict[str, Any],
        audio_features: Dict[str, Any],
        music_prefs: MusicPreferences,
        emotion_profile: EmotionProfile
    ) -> Optional[EmotionMatch]:
        """Calculate how well a track matches the emotion profile."""
        try:
            # Extract track information
            track_id = track["id"]
            track_name = track["name"]
            artist_name = track["artists"][0]["name"] if track["artists"] else "Unknown Artist"
            album_name = track["album"]["name"] if track["album"] else "Unknown Album"
            preview_url = track.get("preview_url")
            spotify_url = track.get("external_urls", {}).get("spotify", "")
            album_cover = track["album"]["images"][0]["url"] if track["album"]["images"] else ""
            duration_ms = track.get("duration_ms", 0)
            popularity = track.get("popularity", 0)
            
            # Calculate feature scores
            feature_scores = {}
            total_weighted_score = 0.0
            total_weight = 0.0
            
            # Core audio features
            features_to_match = [
                ("valence", music_prefs.target_valence),
                ("energy", music_prefs.target_energy),
                ("danceability", music_prefs.target_danceability),
                ("acousticness", music_prefs.target_acousticness),
                ("instrumentalness", music_prefs.target_instrumentalness),
                ("liveness", music_prefs.target_liveness),
                ("speechiness", music_prefs.target_speechiness)
            ]
            
            for feature_name, target_value in features_to_match:
                if feature_name in audio_features:
                    actual_value = audio_features[feature_name]
                    tolerance = self.tolerance_ranges.get(feature_name, 0.2)
                    weight = self.feature_weights.get(feature_name, 0.1)
                    
                    # Calculate score based on how close actual is to target
                    difference = abs(actual_value - target_value)
                    if difference <= tolerance:
                        score = 1.0 - (difference / tolerance) * 0.5  # Max 1.0, min 0.5
                    else:
                        score = max(0.0, 1.0 - (difference - tolerance) / tolerance * 0.5)
                    
                    feature_scores[feature_name] = score
                    total_weighted_score += score * weight
                    total_weight += weight
            
            # Tempo matching
            if music_prefs.target_tempo and "tempo" in audio_features:
                actual_tempo = audio_features["tempo"]
                target_tempo = music_prefs.target_tempo
                tempo_tolerance = target_tempo * self.tolerance_ranges["tempo"]
                
                tempo_difference = abs(actual_tempo - target_tempo)
                if tempo_difference <= tempo_tolerance:
                    tempo_score = 1.0 - (tempo_difference / tempo_tolerance) * 0.5
                else:
                    tempo_score = max(0.0, 1.0 - (tempo_difference - tempo_tolerance) / tempo_tolerance * 0.5)
                
                feature_scores["tempo"] = tempo_score
                total_weighted_score += tempo_score * self.feature_weights["tempo"]
                total_weight += self.feature_weights["tempo"]
            
            # Calculate final match score
            if total_weight > 0:
                base_score = total_weighted_score / total_weight
                
                # Apply popularity bonus (slight boost for popular tracks)
                popularity_bonus = min(0.1, popularity / 1000.0)
                
                # Apply duration penalty for very short/long tracks
                duration_penalty = 0.0
                if duration_ms < 30000:  # Less than 30 seconds
                    duration_penalty = 0.2
                elif duration_ms > 600000:  # More than 10 minutes
                    duration_penalty = 0.1
                
                final_score = max(0.0, min(1.0, base_score + popularity_bonus - duration_penalty))
            else:
                final_score = 0.0
            
            # Only return matches above minimum threshold
            if final_score > 0.3:
                return EmotionMatch(
                    track_id=track_id,
                    track_name=track_name,
                    artist_name=artist_name,
                    album_name=album_name,
                    match_score=final_score,
                    emotion_fit=feature_scores,
                    preview_url=preview_url,
                    spotify_url=spotify_url,
                    album_cover=album_cover,
                    duration_ms=duration_ms,
                    popularity=popularity
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error calculating emotion match: {e}")
            return None

    def _remove_duplicates(self, matches: List[EmotionMatch]) -> List[EmotionMatch]:
        """Remove duplicate tracks from matches list."""
        seen_ids = set()
        unique_matches = []
        
        for match in matches:
            if match.track_id not in seen_ids:
                seen_ids.add(match.track_id)
                unique_matches.append(match)
        
        return unique_matches

    async def _create_fallback_matches(
        self, 
        emotion_profile: EmotionProfile, 
        track_count: int
    ) -> List[EmotionMatch]:
        """Create fallback matches when no real matches are found."""
        try:
            # Try to get some popular tracks as fallback
            search_results = await self.spotify_service.get_top_tracks(limit=track_count)
            
            if not search_results or not search_results.get("tracks"):
                return []
            
            fallback_matches = []
            tracks = search_results["tracks"][:track_count]
            
            for track in tracks:
                # Create basic match with neutral score
                match = EmotionMatch(
                    track_id=track["id"],
                    track_name=track["name"],
                    artist_name=track["artists"][0]["name"] if track["artists"] else "Unknown",
                    album_name=track["album"]["name"] if track["album"] else "Unknown",
                    match_score=0.5,  # Neutral fallback score
                    emotion_fit={"valence": 0.5, "energy": 0.5},
                    preview_url=track.get("preview_url"),
                    spotify_url=track.get("external_urls", {}).get("spotify", ""),
                    album_cover=track["album"]["images"][0]["url"] if track["album"]["images"] else "",
                    duration_ms=track.get("duration_ms", 0),
                    popularity=track.get("popularity", 0)
                )
                fallback_matches.append(match)
            
            return fallback_matches
            
        except Exception as e:
            logger.error(f"Error creating fallback matches: {e}")
            return []

# Global instance
spotify_emotion_matcher = SpotifyEmotionMatcher()
