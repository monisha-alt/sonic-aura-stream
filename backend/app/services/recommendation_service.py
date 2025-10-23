import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
from typing import List, Dict, Any, Optional
import requests
from app.core.config import settings
import json
import logging
import time
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.spotify_client = None
        self.weather_api_key = settings.WEATHER_API_KEY
        self.user_tokens = {}  # Cache for user access/refresh tokens
        self._initialize_spotify()
    
    def _initialize_spotify(self):
        """Initialize Spotify client"""
        try:
            if settings.SPOTIFY_CLIENT_ID and settings.SPOTIFY_CLIENT_SECRET:
                client_credentials_manager = SpotifyClientCredentials(
                    client_id=settings.SPOTIFY_CLIENT_ID,
                    client_secret=settings.SPOTIFY_CLIENT_SECRET
                )
                self.spotify_client = spotipy.Spotify(
                    client_credentials_manager=client_credentials_manager
                )
                logger.info("Spotify client initialized successfully")
            else:
                logger.warning("Spotify credentials not found")
        except Exception as e:
            logger.error(f"Error initializing Spotify client: {e}")
    
    async def get_weather_based_recommendations(
        self, 
        location: str, 
        emotion: str = None
    ) -> List[Dict[str, Any]]:
        """Get song recommendations based on weather and location"""
        try:
            weather_data = await self._get_weather_data(location)
            weather_condition = weather_data.get("weather", [{}])[0].get("main", "").lower()
            temperature = weather_data.get("main", {}).get("temp", 20)
            
            # Map weather conditions to music characteristics
            weather_mapping = {
                "clear": {"valence": 0.8, "energy": 0.7, "genre": "pop"},
                "clouds": {"valence": 0.6, "energy": 0.5, "genre": "indie"},
                "rain": {"valence": 0.4, "energy": 0.3, "genre": "ambient"},
                "snow": {"valence": 0.3, "energy": 0.2, "genre": "ambient"},
                "thunderstorm": {"valence": 0.2, "energy": 0.9, "genre": "rock"}
            }
            
            # Adjust based on temperature
            if temperature > 25:  # Hot weather
                weather_mapping[weather_condition]["energy"] = min(
                    weather_mapping.get(weather_condition, {}).get("energy", 0.5) + 0.2, 1.0
                )
            elif temperature < 10:  # Cold weather
                weather_mapping[weather_condition]["energy"] = max(
                    weather_mapping.get(weather_condition, {}).get("energy", 0.5) - 0.2, 0.0
                )
            
            recommendations = await self._get_spotify_recommendations(
                weather_mapping.get(weather_condition, {"valence": 0.5, "energy": 0.5})
            )
            
            return {
                "recommendations": recommendations,
                "weather_context": {
                    "condition": weather_condition,
                    "temperature": temperature,
                    "location": location
                }
            }
            
        except Exception as e:
            print(f"Error getting weather-based recommendations: {e}")
            return {"recommendations": [], "error": str(e)}
    
    async def get_time_based_recommendations(
        self, 
        hour: int, 
        day_of_week: int = None
    ) -> List[Dict[str, Any]]:
        """Get song recommendations based on time of day"""
        try:
            # Map time to music characteristics
            if 6 <= hour < 12:  # Morning
                characteristics = {"valence": 0.7, "energy": 0.6, "genre": "pop"}
            elif 12 <= hour < 17:  # Afternoon
                characteristics = {"valence": 0.6, "energy": 0.5, "genre": "indie"}
            elif 17 <= hour < 22:  # Evening
                characteristics = {"valence": 0.8, "energy": 0.8, "genre": "dance"}
            else:  # Night
                characteristics = {"valence": 0.4, "energy": 0.3, "genre": "ambient"}
            
            # Adjust for weekends
            if day_of_week and day_of_week >= 5:  # Weekend
                characteristics["energy"] = min(characteristics["energy"] + 0.2, 1.0)
                characteristics["valence"] = min(characteristics["valence"] + 0.1, 1.0)
            
            recommendations = await self._get_spotify_recommendations(characteristics)
            
            return {
                "recommendations": recommendations,
                "time_context": {
                    "hour": hour,
                    "day_of_week": day_of_week,
                    "period": self._get_time_period(hour)
                }
            }
            
        except Exception as e:
            print(f"Error getting time-based recommendations: {e}")
            return {"recommendations": [], "error": str(e)}
    
    async def get_emotion_based_recommendations(
        self, 
        emotion: str, 
        confidence: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Get song recommendations based on detected emotion"""
        try:
            emotion_mapping = {
                "happy": {"valence": 0.9, "energy": 0.8, "genre": "pop"},
                "sad": {"valence": 0.2, "energy": 0.3, "genre": "indie"},
                "angry": {"valence": 0.3, "energy": 0.9, "genre": "rock"},
                "calm": {"valence": 0.6, "energy": 0.2, "genre": "ambient"},
                "energetic": {"valence": 0.8, "energy": 0.9, "genre": "electronic"},
                "focused": {"valence": 0.5, "energy": 0.4, "genre": "instrumental"},
                "neutral": {"valence": 0.5, "energy": 0.5, "genre": "pop"}
            }
            
            characteristics = emotion_mapping.get(emotion, emotion_mapping["neutral"])
            
            # Adjust based on confidence
            if confidence < 0.5:
                # Blend with neutral characteristics
                neutral = emotion_mapping["neutral"]
                characteristics = {
                    "valence": (characteristics["valence"] + neutral["valence"]) / 2,
                    "energy": (characteristics["energy"] + neutral["energy"]) / 2,
                    "genre": characteristics["genre"]
                }
            
            recommendations = await self._get_spotify_recommendations(characteristics)
            
            return {
                "recommendations": recommendations,
                "emotion_context": {
                    "emotion": emotion,
                    "confidence": confidence,
                    "characteristics": characteristics
                }
            }
            
        except Exception as e:
            print(f"Error getting emotion-based recommendations: {e}")
            return {"recommendations": [], "error": str(e)}
    
    async def get_calendar_based_recommendations(
        self, 
        calendar_events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Get song recommendations based on calendar events"""
        try:
            if not calendar_events:
                return {"recommendations": [], "context": "no_events"}
            
            # Analyze upcoming events
            event_contexts = []
            for event in calendar_events:
                context = self._analyze_event_context(event)
                event_contexts.append(context)
            
            # Determine overall context
            overall_context = self._determine_overall_context(event_contexts)
            
            recommendations = await self._get_spotify_recommendations(overall_context)
            
            return {
                "recommendations": recommendations,
                "calendar_context": {
                    "events_count": len(calendar_events),
                    "contexts": event_contexts,
                    "overall_context": overall_context
                }
            }
            
        except Exception as e:
            print(f"Error getting calendar-based recommendations: {e}")
            return {"recommendations": [], "error": str(e)}
    
    async def _get_spotify_recommendations(self, characteristics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get recommendations from Spotify based on characteristics"""
        try:
            if not self.spotify_client:
                return []
            
            # Get recommendations from Spotify
            recommendations = self.spotify_client.recommendations(
                seed_genres=[characteristics.get("genre", "pop")],
                target_valence=characteristics.get("valence", 0.5),
                target_energy=characteristics.get("energy", 0.5),
                limit=20
            )
            
            # Format recommendations
            formatted_recommendations = []
            for track in recommendations["tracks"]:
                formatted_recommendations.append({
                    "id": track["id"],
                    "title": track["name"],
                    "artist": ", ".join([artist["name"] for artist in track["artists"]]),
                    "album": track["album"]["name"],
                    "duration": track["duration_ms"] // 1000,
                    "preview_url": track["preview_url"],
                    "cover_url": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
                    "spotify_url": track["external_urls"]["spotify"],
                    "popularity": track["popularity"],
                    "audio_features": self._get_track_audio_features(track["id"])
                })
            
            return formatted_recommendations
            
        except Exception as e:
            print(f"Error getting Spotify recommendations: {e}")
            return []
    
    def _get_track_audio_features(self, track_id: str) -> Dict[str, Any]:
        """Get audio features for a track"""
        try:
            if not self.spotify_client:
                return {}
            
            features = self.spotify_client.audio_features([track_id])[0]
            return {
                "valence": features["valence"],
                "energy": features["energy"],
                "danceability": features["danceability"],
                "acousticness": features["acousticness"],
                "instrumentalness": features["instrumentalness"],
                "tempo": features["tempo"],
                "key": features["key"],
                "mode": features["mode"],
                "time_signature": features["time_signature"]
            }
        except Exception as e:
            print(f"Error getting audio features: {e}")
            return {}
    
    async def _get_weather_data(self, location: str) -> Dict[str, Any]:
        """Get weather data for location"""
        try:
            if not self.weather_api_key:
                return {"weather": [{"main": "clear"}]}
            
            url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={self.weather_api_key}&units=metric"
            response = requests.get(url)
            return response.json()
        except Exception as e:
            print(f"Error getting weather data: {e}")
            return {"weather": [{"main": "clear"}]}
    
    def _get_time_period(self, hour: int) -> str:
        """Get time period description"""
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def _analyze_event_context(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a calendar event to determine music context"""
        title = event.get("summary", "").lower()
        description = event.get("description", "").lower()
        
        # Determine context based on keywords
        if any(word in title + description for word in ["meeting", "call", "conference"]):
            return {"valence": 0.4, "energy": 0.3, "genre": "ambient", "context": "work"}
        elif any(word in title + description for word in ["workout", "gym", "exercise"]):
            return {"valence": 0.8, "energy": 0.9, "genre": "electronic", "context": "workout"}
        elif any(word in title + description for word in ["party", "celebration", "birthday"]):
            return {"valence": 0.9, "energy": 0.9, "genre": "pop", "context": "party"}
        elif any(word in title + description for word in ["study", "exam", "homework"]):
            return {"valence": 0.5, "energy": 0.3, "genre": "instrumental", "context": "study"}
        else:
            return {"valence": 0.6, "energy": 0.5, "genre": "pop", "context": "general"}
    
    def _determine_overall_context(self, event_contexts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Determine overall context from multiple events"""
        if not event_contexts:
            return {"valence": 0.5, "energy": 0.5, "genre": "pop"}
        
        # Average the characteristics
        avg_valence = sum(ctx["valence"] for ctx in event_contexts) / len(event_contexts)
        avg_energy = sum(ctx["energy"] for ctx in event_contexts) / len(event_contexts)
        
        # Get most common genre
        genres = [ctx["genre"] for ctx in event_contexts]
        most_common_genre = max(set(genres), key=genres.count)
        
        return {
            "valence": avg_valence,
            "energy": avg_energy,
            "genre": most_common_genre
        }
    
    async def get_trending_albums(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get trending albums from Spotify"""
        try:
            if not self.spotify_client:
                return []
            
            # Get new releases
            results = self.spotify_client.new_releases(limit=limit)
            
            albums = []
            for album in results['albums']['items']:
                albums.append({
                    "id": album['id'],
                    "name": album['name'],
                    "artist": album['artists'][0]['name'],
                    "artist_id": album['artists'][0]['id'],
                    "release_date": album['release_date'],
                    "total_tracks": album['total_tracks'],
                    "cover_url": album['images'][0]['url'] if album['images'] else None,
                    "external_urls": album['external_urls']
                })
            
            return albums
            
        except Exception as e:
            logger.error(f"Error getting trending albums: {e}")
            return []
    
    async def get_featured_artists(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get featured artists from Spotify"""
        try:
            if not self.spotify_client:
                return []
            
            # Search for popular artists
            results = self.spotify_client.search(q='genre:pop', type='artist', limit=limit)
            
            artists = []
            for artist in results['artists']['items']:
                artists.append({
                    "id": artist['id'],
                    "name": artist['name'],
                    "genres": artist['genres'],
                    "popularity": artist['popularity'],
                    "followers": artist['followers']['total'],
                    "image_url": artist['images'][0]['url'] if artist['images'] else None,
                    "external_urls": artist['external_urls']
                })
            
            return artists
            
        except Exception as e:
            logger.error(f"Error getting featured artists: {e}")
            return []
    
    async def search_songs(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for songs on Spotify"""
        try:
            if not self.spotify_client:
                return []
            
            results = self.spotify_client.search(q=query, type='track', limit=limit)
            
            songs = []
            for track in results['tracks']['items']:
                # Get audio features
                audio_features = self._get_track_audio_features(track['id'])
                
                songs.append({
                    "id": track['id'],
                    "title": track['name'],
                    "artist": ", ".join([artist['name'] for artist in track['artists']]),
                    "album": track['album']['name'],
                    "duration": track['duration_ms'] // 1000,
                    "preview_url": track['preview_url'],
                    "cover_url": track['album']['images'][0]['url'] if track['album']['images'] else None,
                    "spotify_url": track['external_urls']['spotify'],
                    "popularity": track['popularity'],
                    "audio_features": audio_features
                })
            
            return songs
            
        except Exception as e:
            logger.error(f"Error searching songs: {e}")
            return []

    async def refresh_user_token(self, user_id: str, refresh_token: str) -> Dict[str, Any]:
        """Refresh user's Spotify access token."""
        try:
            oauth = SpotifyOAuth(
                client_id=settings.SPOTIFY_CLIENT_ID,
                client_secret=settings.SPOTIFY_CLIENT_SECRET,
                redirect_uri="https://localhost:3000/callback",
                scope="user-read-private user-read-email user-read-playback-state user-modify-playback-state"
            )
            
            # Use refresh token to get new access token
            token_info = oauth.refresh_access_token(refresh_token)
            
            # Cache the tokens
            self.user_tokens[user_id] = {
                "access_token": token_info["access_token"],
                "refresh_token": token_info.get("refresh_token", refresh_token),
                "expires_at": time.time() + token_info["expires_in"]
            }
            
            logger.info(f"✅ Refreshed token for user {user_id}")
            return token_info
            
        except Exception as e:
            logger.error(f"❌ Failed to refresh token for user {user_id}: {e}")
            raise

    async def get_user_spotify_client(self, user_id: str, access_token: str, refresh_token: Optional[str] = None) -> spotipy.Spotify:
        """Get Spotify client for authenticated user with auto-refresh."""
        try:
            # Check if we have cached tokens
            if user_id in self.user_tokens:
                cached_tokens = self.user_tokens[user_id]
                
                # Check if token is expired
                if time.time() >= cached_tokens["expires_at"] - 300:  # Refresh 5 minutes before expiry
                    if refresh_token:
                        await self.refresh_user_token(user_id, refresh_token)
                        access_token = self.user_tokens[user_id]["access_token"]
                    else:
                        logger.warning(f"⚠️  Token expired for user {user_id} but no refresh token available")
            
            # Create user-specific client
            user_client = spotipy.Spotify(auth=access_token)
            
            # Test the client
            user_info = user_client.current_user()
            logger.info(f"✅ Spotify client created for user: {user_info.get('display_name', user_id)}")
            
            return user_client
            
        except spotipy.SpotifyException as e:
            if e.http_status == 401 and refresh_token:
                logger.info(f"🔄 Token expired for user {user_id}, refreshing...")
                await self.refresh_user_token(user_id, refresh_token)
                access_token = self.user_tokens[user_id]["access_token"]
                return spotipy.Spotify(auth=access_token)
            else:
                logger.error(f"❌ Failed to create Spotify client for user {user_id}: {e}")
                raise

    async def check_user_premium_status(self, user_id: str, access_token: str) -> Dict[str, Any]:
        """Check if user has Spotify Premium."""
        try:
            user_client = await self.get_user_spotify_client(user_id, access_token)
            user_info = user_client.current_user()
            
            # Check subscription details
            product = user_info.get("product", "free")
            is_premium = product in ["premium", "family", "student"]
            
            return {
                "user_id": user_id,
                "is_premium": is_premium,
                "product": product,
                "display_name": user_info.get("display_name"),
                "country": user_info.get("country"),
                "web_playback_available": is_premium
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to check premium status for user {user_id}: {e}")
            return {
                "user_id": user_id,
                "is_premium": False,
                "product": "unknown",
                "web_playback_available": False,
                "error": str(e)
            }

    async def get_playback_devices(self, user_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Get user's available playback devices."""
        try:
            user_client = await self.get_user_spotify_client(user_id, access_token)
            devices = user_client.devices()
            
            return devices.get("devices", [])
            
        except Exception as e:
            logger.error(f"❌ Failed to get playback devices for user {user_id}: {e}")
            return []

    async def start_playback(self, user_id: str, access_token: str, track_uri: str, device_id: Optional[str] = None) -> Dict[str, Any]:
        """Start playback of a track for Premium users."""
        try:
            user_client = await self.get_user_spotify_client(user_id, access_token)
            
            # If no device specified, use the first available device
            if not device_id:
                devices = await self.get_playback_devices(user_id, access_token)
                if devices:
                    device_id = devices[0]["id"]
                else:
                    return {"error": "No playback devices available"}
            
            # Start playback
            user_client.start_playback(device_id=device_id, uris=[track_uri])
            
            return {
                "success": True,
                "device_id": device_id,
                "track_uri": track_uri,
                "message": "Playback started successfully"
            }
            
        except spotipy.SpotifyException as e:
            logger.error(f"❌ Failed to start playback for user {user_id}: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"❌ Unexpected error starting playback for user {user_id}: {e}")
            return {"error": "Unexpected error occurred"}

    async def get_track_audio_features(self, track_id: str) -> Dict[str, Any]:
        """Get detailed audio features for a track."""
        try:
            if not self.spotify_client:
                return {}
            
            features = self.spotify_client.audio_features(track_id)
            return features[0] if features else {}
            
        except Exception as e:
            logger.error(f"❌ Failed to get audio features for track {track_id}: {e}")
            return {}

# Global instance
recommendation_service = RecommendationService()
