"""
Spotify Web API Integration Service
Handles authentication, data fetching, and caching for Spotify data
"""

import os
import logging
import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json
import requests
from dataclasses import dataclass
import redis
# from sqlalchemy.orm import Session
# from app.database import get_db

logger = logging.getLogger(__name__)

@dataclass
class SpotifyTrack:
    id: str
    name: str
    artist: str
    album: str
    preview_url: Optional[str]
    external_urls: Dict[str, str]
    duration_ms: int
    popularity: int
    cover_url: Optional[str]
    audio_features: Optional[Dict[str, Any]] = None

@dataclass
class SpotifyArtist:
    id: str
    name: str
    genres: List[str]
    popularity: int
    image_url: Optional[str]
    external_urls: Dict[str, str]

@dataclass
class SpotifyAlbum:
    id: str
    name: str
    artist: str
    release_date: str
    total_tracks: int
    image_url: Optional[str]
    external_urls: Dict[str, str]

class SpotifyService:
    def __init__(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'https://localhost:3000/callback')
        self.base_url = 'https://api.spotify.com/v1'
        self.token_url = 'https://accounts.spotify.com/api/token'
        
        # Redis for caching
        try:
            self.redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}")
            self.redis_client = None
        
        # Access token (client credentials flow)
        self.access_token = None
        self.token_expires_at = None
        
        # Check if credentials are configured
        if not self.client_id or not self.client_secret:
            logger.warning("⚠️ Spotify credentials not configured. Using mock data.")
            logger.info("📋 To get real Spotify data:")
            logger.info("   1. Go to https://developer.spotify.com/dashboard")
            logger.info("   2. Create a new app and get Client ID & Secret")
            logger.info("   3. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env file")
        else:
            logger.info("🎵 Spotify service initialized with credentials")

    async def _get_access_token(self) -> str:
        """Get Spotify access token using client credentials flow"""
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        if not self.client_id or not self.client_secret:
            logger.warning("⚠️ Spotify credentials not configured")
            return None
        
        try:
            # Client credentials flow
            auth_response = requests.post(
                self.token_url,
                data={
                    'grant_type': 'client_credentials',
                    'client_id': self.client_id,
                    'client_secret': self.client_secret,
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if auth_response.status_code == 200:
                token_data = auth_response.json()
                self.access_token = token_data['access_token']
                expires_in = token_data.get('expires_in', 3600)
                self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
                
                logger.info("✅ Spotify access token obtained")
                return self.access_token
            else:
                logger.error(f"❌ Failed to get Spotify token: {auth_response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error getting Spotify token: {e}")
            return None

    async def _get_headers(self) -> Dict[str, str]:
        """Get headers with authorization token"""
        token = await self._get_access_token()
        if not token:
            return {}
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    async def _cache_get(self, key: str) -> Optional[Any]:
        """Get data from Redis cache"""
        if not self.redis_client:
            return None
        try:
            cached_data = self.redis_client.get(key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"⚠️ Redis cache get error: {e}")
        return None

    async def _cache_set(self, key: str, data: Any, ttl: int = 3600) -> None:
        """Set data in Redis cache"""
        if not self.redis_client:
            return
        try:
            self.redis_client.setex(key, ttl, json.dumps(data))
        except Exception as e:
            logger.warning(f"⚠️ Redis cache set error: {e}")

    async def get_new_releases(self, limit: int = 20) -> List[SpotifyAlbum]:
        """Get new album releases from Spotify"""
        cache_key = f"spotify:new_releases:{limit}"
        
        # Check cache first
        cached_data = await self._cache_get(cache_key)
        if cached_data:
            logger.info("📦 Using cached new releases")
            return [SpotifyAlbum(**album) for album in cached_data]
        
        try:
            headers = await self._get_headers()
            if not headers:
                logger.warning("⚠️ No Spotify token available")
                return []
            
            response = requests.get(
                f"{self.base_url}/browse/new-releases",
                headers=headers,
                params={'limit': limit, 'country': 'US'}
            )
            
            if response.status_code == 200:
                data = response.json()
                albums = []
                
                for item in data['albums']['items']:
                    album = SpotifyAlbum(
                        id=item['id'],
                        name=item['name'],
                        artist=item['artists'][0]['name'] if item['artists'] else 'Unknown',
                        release_date=item['release_date'],
                        total_tracks=item['total_tracks'],
                        image_url=item['images'][0]['url'] if item['images'] else None,
                        external_urls=item['external_urls']
                    )
                    albums.append(album)
                
                # Cache the results
                await self._cache_set(cache_key, [album.__dict__ for album in albums], ttl=21600)  # 6 hours
                
                logger.info(f"✅ Fetched {len(albums)} new releases")
                return albums
            else:
                logger.error(f"❌ Failed to fetch new releases: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Error fetching new releases: {e}")
            return []

    async def get_featured_playlists(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get featured playlists from Spotify"""
        cache_key = f"spotify:featured_playlists:{limit}"
        
        # Check cache first
        cached_data = await self._cache_get(cache_key)
        if cached_data:
            logger.info("🎵 Using cached featured playlists")
            return cached_data
        
        try:
            headers = await self._get_headers()
            if not headers:
                return []
            
            response = requests.get(
                f"{self.base_url}/browse/featured-playlists",
                headers=headers,
                params={'limit': limit, 'country': 'US'}
            )
            
            if response.status_code == 200:
                data = response.json()
                playlists = []
                
                for item in data['playlists']['items']:
                    playlist = {
                        'id': item['id'],
                        'name': item['name'],
                        'description': item['description'],
                        'image_url': item['images'][0]['url'] if item['images'] else None,
                        'tracks_total': item['tracks']['total'],
                        'external_urls': item['external_urls']
                    }
                    playlists.append(playlist)
                
                # Cache the results
                await self._cache_set(cache_key, playlists, ttl=21600)  # 6 hours
                
                logger.info(f"✅ Fetched {len(playlists)} featured playlists")
                return playlists
            else:
                logger.error(f"❌ Failed to fetch featured playlists: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Error fetching featured playlists: {e}")
            return []

    async def get_top_tracks(self, limit: int = 20) -> List[SpotifyTrack]:
        """Get top tracks from Spotify"""
        cache_key = f"spotify:top_tracks:{limit}"
        
        # Check cache first
        cached_data = await self._cache_get(cache_key)
        if cached_data:
            logger.info("🎶 Using cached top tracks")
            return [SpotifyTrack(**track) for track in cached_data]
        
        try:
            headers = await self._get_headers()
            if not headers:
                return []
            
            # Get top tracks by searching for popular tracks
            response = requests.get(
                f"{self.base_url}/search",
                headers=headers,
                params={
                    'q': 'year:2024',
                    'type': 'track',
                    'limit': limit,
                    'market': 'US'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                tracks = []
                
                for item in data['tracks']['items']:
                    track = SpotifyTrack(
                        id=item['id'],
                        name=item['name'],
                        artist=item['artists'][0]['name'] if item['artists'] else 'Unknown',
                        album=item['album']['name'],
                        preview_url=item['preview_url'],
                        external_urls=item['external_urls'],
                        duration_ms=item['duration_ms'],
                        popularity=item['popularity'],
                        cover_url=item['album']['images'][0]['url'] if item['album']['images'] else None
                    )
                    tracks.append(track)
                
                # Cache the results
                await self._cache_set(cache_key, [track.__dict__ for track in tracks], ttl=21600)  # 6 hours
                
                logger.info(f"✅ Fetched {len(tracks)} top tracks")
                return tracks
            else:
                logger.error(f"❌ Failed to fetch top tracks: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Error fetching top tracks: {e}")
            return []

    async def get_audio_features(self, track_id: str) -> Optional[Dict[str, Any]]:
        """Get audio features for a specific track"""
        cache_key = f"spotify:audio_features:{track_id}"
        
        # Check cache first
        cached_data = await self._cache_get(cache_key)
        if cached_data:
            return cached_data
        
        try:
            headers = await self._get_headers()
            if not headers:
                return None
            
            response = requests.get(
                f"{self.base_url}/audio-features/{track_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                features = response.json()
                
                # Cache the results
                await self._cache_set(cache_key, features, ttl=86400)  # 24 hours
                
                return features
            else:
                logger.error(f"❌ Failed to fetch audio features for {track_id}: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error fetching audio features: {e}")
            return None

    async def search_tracks(self, query: str, limit: int = 20) -> List[SpotifyTrack]:
        """Search for tracks"""
        try:
            headers = await self._get_headers()
            if not headers:
                return []
            
            response = requests.get(
                f"{self.base_url}/search",
                headers=headers,
                params={
                    'q': query,
                    'type': 'track',
                    'limit': limit,
                    'market': 'US'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                tracks = []
                
                for item in data['tracks']['items']:
                    track = SpotifyTrack(
                        id=item['id'],
                        name=item['name'],
                        artist=item['artists'][0]['name'] if item['artists'] else 'Unknown',
                        album=item['album']['name'],
                        preview_url=item['preview_url'],
                        external_urls=item['external_urls'],
                        duration_ms=item['duration_ms'],
                        popularity=item['popularity'],
                        cover_url=item['album']['images'][0]['url'] if item['album']['images'] else None
                    )
                    tracks.append(track)
                
                logger.info(f"✅ Found {len(tracks)} tracks for query: {query}")
                return tracks
            else:
                logger.error(f"❌ Failed to search tracks: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Error searching tracks: {e}")
            return []

# Global instance
spotify_service = SpotifyService()
