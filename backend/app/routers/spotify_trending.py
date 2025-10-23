"""
Spotify Trending Data Router
Provides trending music data using authenticated Spotify API calls
"""

import logging
import requests
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from .spotify_oauth import get_user_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/spotify", tags=["Spotify Trending"])

def get_spotify_headers(user_id: str = "default_user") -> Dict[str, str]:
    """Get authenticated headers for Spotify API calls"""
    access_token = get_user_access_token(user_id)
    
    if not access_token:
        raise HTTPException(
            status_code=401, 
            detail="No valid Spotify access token. Please authenticate first at /auth/spotify/login"
        )
    
    return {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

@router.get("/trending")
async def get_trending_music(
    limit: int = Query(20, ge=1, le=50, description="Number of items to return"),
    country: str = Query("US", description="Country code for localized results")
):
    """Get trending music data from Spotify"""
    request_id = str(uuid.uuid4())
    logger.info(f"🎵 [{request_id}] Fetching trending music (limit: {limit}, country: {country})")
    
    try:
        headers = get_spotify_headers()
        
        # Fetch new releases
        new_releases_response = requests.get(
            'https://api.spotify.com/v1/browse/new-releases',
            headers=headers,
            params={'limit': limit, 'country': country}
        )
        
        logger.info(f"📡 [{request_id}] New releases response: {new_releases_response.status_code}")
        
        if new_releases_response.status_code == 401:
            logger.warning(f"⚠️ [{request_id}] Access token expired, need to refresh")
            raise HTTPException(
                status_code=401, 
                detail="Access token expired. Please refresh your token at /auth/spotify/refresh"
            )
        
        if new_releases_response.status_code != 200:
            error_detail = new_releases_response.text
            logger.error(f"❌ [{request_id}] Spotify API error: {new_releases_response.status_code} - {error_detail}")
            raise HTTPException(
                status_code=new_releases_response.status_code,
                detail=f"Spotify API error: {error_detail}"
            )
        
        new_releases_data = new_releases_response.json()
        
        # Process and format the response
        albums = []
        for album in new_releases_data.get('albums', {}).get('items', []):
            album_info = {
                'id': album['id'],
                'name': album['name'],
                'artist': album['artists'][0]['name'] if album['artists'] else 'Unknown Artist',
                'release_date': album['release_date'],
                'total_tracks': album['total_tracks'],
                'image_url': album['images'][0]['url'] if album['images'] else None,
                'external_urls': album['external_urls'],
                'album_type': album['album_type'],
                'popularity': album.get('popularity', 0)
            }
            albums.append(album_info)
        
        # Fetch featured playlists
        featured_response = requests.get(
            'https://api.spotify.com/v1/browse/featured-playlists',
            headers=headers,
            params={'limit': limit, 'country': country}
        )
        
        playlists = []
        if featured_response.status_code == 200:
            featured_data = featured_response.json()
            for playlist in featured_data.get('playlists', {}).get('items', []):
                playlist_info = {
                    'id': playlist['id'],
                    'name': playlist['name'],
                    'description': playlist['description'],
                    'image_url': playlist['images'][0]['url'] if playlist['images'] else None,
                    'tracks_total': playlist['tracks']['total'],
                    'external_urls': playlist['external_urls'],
                    'owner': playlist['owner']['display_name']
                }
                playlists.append(playlist_info)
        
        # Fetch user's top tracks (if available)
        top_tracks_response = requests.get(
            'https://api.spotify.com/v1/me/top/tracks',
            headers=headers,
            params={'limit': limit, 'time_range': 'short_term'}
        )
        
        tracks = []
        if top_tracks_response.status_code == 200:
            top_tracks_data = top_tracks_response.json()
            for track in top_tracks_data.get('items', []):
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': track['artists'][0]['name'] if track['artists'] else 'Unknown Artist',
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'popularity': track['popularity'],
                    'preview_url': track.get('preview_url'),
                    'external_urls': track['external_urls'],
                    'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None
                }
                tracks.append(track_info)
        
        logger.info(f"✅ [{request_id}] Successfully fetched trending data: {len(albums)} albums, {len(playlists)} playlists, {len(tracks)} tracks")
        
        return {
            "source": "spotify_api",
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "data": {
                "albums": albums,
                "playlists": playlists,
                "tracks": tracks
            },
            "metadata": {
                "total_albums": len(albums),
                "total_playlists": len(playlists),
                "total_tracks": len(tracks),
                "country": country,
                "limit": limit
            }
        }
        
    except HTTPException:
        raise
    except requests.RequestException as e:
        logger.error(f"❌ [{request_id}] Request error: {e}")
        raise HTTPException(status_code=500, detail=f"Request to Spotify API failed: {str(e)}")
    except Exception as e:
        logger.error(f"❌ [{request_id}] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/new-releases")
async def get_new_releases(
    limit: int = Query(20, ge=1, le=50),
    country: str = Query("US")
):
    """Get new releases from Spotify"""
    request_id = str(uuid.uuid4())
    logger.info(f"🎵 [{request_id}] Fetching new releases (limit: {limit})")
    
    try:
        headers = get_spotify_headers()
        
        response = requests.get(
            'https://api.spotify.com/v1/browse/new-releases',
            headers=headers,
            params={'limit': limit, 'country': country}
        )
        
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Access token expired. Please refresh.")
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Spotify API error: {response.text}")
        
        data = response.json()
        albums = []
        
        for album in data.get('albums', {}).get('items', []):
            albums.append({
                'id': album['id'],
                'name': album['name'],
                'artist': album['artists'][0]['name'] if album['artists'] else 'Unknown',
                'release_date': album['release_date'],
                'image_url': album['images'][0]['url'] if album['images'] else None,
                'external_urls': album['external_urls']
            })
        
        return {
            "source": "spotify_api",
            "albums": albums,
            "total": len(albums)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [{request_id}] Error fetching new releases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_spotify(
    query: str = Query(..., description="Search query"),
    limit: int = Query(20, ge=1, le=50),
    type: str = Query("track", description="Search type: track, album, artist, playlist")
):
    """Search Spotify for tracks, albums, artists, or playlists"""
    request_id = str(uuid.uuid4())
    logger.info(f"🔍 [{request_id}] Searching Spotify: '{query}' (type: {type})")
    
    try:
        headers = get_spotify_headers()
        
        response = requests.get(
            'https://api.spotify.com/v1/search',
            headers=headers,
            params={
                'q': query,
                'type': type,
                'limit': limit
            }
        )
        
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Access token expired. Please refresh.")
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Spotify API error: {response.text}")
        
        data = response.json()
        
        return {
            "source": "spotify_api",
            "query": query,
            "type": type,
            "results": data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [{request_id}] Error searching Spotify: {e}")
        raise HTTPException(status_code=500, detail=str(e))
