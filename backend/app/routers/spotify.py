from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.services.recommendation_service import recommendation_service
from app.core.auth import get_current_user
from app.models import User

router = APIRouter()

@router.get("/trending-albums")
async def get_trending_albums(
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get trending albums from Spotify"""
    try:
        albums = await recommendation_service.get_trending_albums(limit)
        return {
            "albums": albums,
            "total_count": len(albums)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/featured-artists")
async def get_featured_artists(
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get featured artists from Spotify"""
    try:
        artists = await recommendation_service.get_featured_artists(limit)
        return {
            "artists": artists,
            "total_count": len(artists)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_spotify(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Search for songs, artists, and albums on Spotify"""
    try:
        songs = await recommendation_service.search_songs(query, limit)
        return {
            "songs": songs,
            "query": query,
            "total_count": len(songs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/genres")
async def get_available_genres(
    current_user: User = Depends(get_current_user)
):
    """Get available music genres from Spotify"""
    try:
        if not recommendation_service.spotify_client:
            raise HTTPException(status_code=503, detail="Spotify client not available")
        
        genres = recommendation_service.spotify_client.recommendation_genre_seeds()
        return {
            "genres": genres.get("genres", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/playlist/{playlist_id}")
async def get_playlist_tracks(
    playlist_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get tracks from a specific Spotify playlist"""
    try:
        if not recommendation_service.spotify_client:
            raise HTTPException(status_code=503, detail="Spotify client not available")
        
        playlist = recommendation_service.spotify_client.playlist(playlist_id)
        tracks = []
        
        for item in playlist['tracks']['items']:
            track = item['track']
            if track:  # Skip None tracks
                tracks.append({
                    "id": track['id'],
                    "title": track['name'],
                    "artist": ", ".join([artist['name'] for artist in track['artists']]),
                    "album": track['album']['name'],
                    "duration": track['duration_ms'] // 1000,
                    "preview_url": track['preview_url'],
                    "cover_url": track['album']['images'][0]['url'] if track['album']['images'] else None,
                    "spotify_url": track['external_urls']['spotify']
                })
        
        return {
            "playlist": {
                "id": playlist['id'],
                "name": playlist['name'],
                "description": playlist['description'],
                "owner": playlist['owner']['display_name'],
                "tracks_count": playlist['tracks']['total'],
                "cover_url": playlist['images'][0]['url'] if playlist['images'] else None
            },
            "tracks": tracks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
