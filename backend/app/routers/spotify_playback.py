"""
Spotify playback router with Web Playback SDK support.
"""
from fastapi import APIRouter, HTTPException, Depends, Form, Header
from typing import Dict, Any, Optional, List
import logging

from app.services.recommendation_service import recommendation_service
from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/oauth/callback")
async def handle_spotify_callback(
    code: str = Form(...),
    state: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """
    Handle Spotify OAuth callback and exchange code for tokens.
    """
    try:
        logger.info(f"🎵 Processing Spotify OAuth callback for user {user_id}")
        
        # In a real implementation, you would:
        # 1. Exchange code for access/refresh tokens
        # 2. Store tokens in database
        # 3. Return success response
        
        # For now, return mock success
        return {
            "status": "success",
            "message": "Spotify connected successfully",
            "user_id": user_id,
            "access_token": "mock_access_token",
            "refresh_token": "mock_refresh_token",
            "expires_in": 3600,
            "scope": "user-read-private user-read-email user-read-playback-state user-modify-playback-state"
        }
        
    except Exception as e:
        logger.error(f"❌ Spotify OAuth callback failed: {e}")
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")

@router.get("/user/premium-status")
async def check_premium_status(
    user_id: str,
    access_token: str = Header(..., alias="Authorization").replace("Bearer ", "")
):
    """Check if user has Spotify Premium subscription."""
    try:
        logger.info(f"🔍 Checking premium status for user {user_id}")
        
        result = await recommendation_service.check_user_premium_status(user_id, access_token)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Failed to check premium status: {e}")
        raise HTTPException(status_code=500, detail=f"Premium status check failed: {str(e)}")

@router.get("/user/devices")
async def get_playback_devices(
    user_id: str,
    access_token: str = Header(..., alias="Authorization").replace("Bearer ", "")
):
    """Get user's available playback devices."""
    try:
        logger.info(f"📱 Getting playback devices for user {user_id}")
        
        devices = await recommendation_service.get_playback_devices(user_id, access_token)
        
        return {
            "devices": devices,
            "count": len(devices),
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get playback devices: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get devices: {str(e)}")

@router.post("/playback/start")
async def start_playback(
    track_uri: str = Form(...),
    device_id: Optional[str] = Form(None),
    user_id: str = Form(...),
    access_token: str = Header(..., alias="Authorization").replace("Bearer ", "")
):
    """Start playback of a track for Premium users."""
    try:
        logger.info(f"▶️  Starting playback for user {user_id}: {track_uri}")
        
        result = await recommendation_service.start_playback(
            user_id, access_token, track_uri, device_id
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to start playback: {e}")
        raise HTTPException(status_code=500, detail=f"Playback failed: {str(e)}")

@router.post("/playback/pause")
async def pause_playback(
    user_id: str = Form(...),
    access_token: str = Header(..., alias="Authorization").replace("Bearer ", "")
):
    """Pause current playback."""
    try:
        logger.info(f"⏸️  Pausing playback for user {user_id}")
        
        user_client = await recommendation_service.get_user_spotify_client(user_id, access_token)
        user_client.pause_playback()
        
        return {
            "status": "success",
            "message": "Playback paused",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to pause playback: {e}")
        raise HTTPException(status_code=500, detail=f"Pause failed: {str(e)}")

@router.post("/playback/resume")
async def resume_playback(
    user_id: str = Form(...),
    access_token: str = Header(..., alias="Authorization").replace("Bearer ", "")
):
    """Resume paused playback."""
    try:
        logger.info(f"▶️  Resuming playback for user {user_id}")
        
        user_client = await recommendation_service.get_user_spotify_client(user_id, access_token)
        user_client.start_playback()
        
        return {
            "status": "success",
            "message": "Playback resumed",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to resume playback: {e}")
        raise HTTPException(status_code=500, detail=f"Resume failed: {str(e)}")

@router.get("/playback/current")
async def get_current_playback(
    user_id: str,
    access_token: str = Header(..., alias="Authorization").replace("Bearer ", "")
):
    """Get current playback information."""
    try:
        logger.info(f"🎵 Getting current playback for user {user_id}")
        
        user_client = await recommendation_service.get_user_spotify_client(user_id, access_token)
        current_playback = user_client.current_playback()
        
        return {
            "playback": current_playback,
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get current playback: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get playback info: {str(e)}")

@router.post("/token/refresh")
async def refresh_user_token(
    user_id: str = Form(...),
    refresh_token: str = Form(...)
):
    """Refresh user's Spotify access token."""
    try:
        logger.info(f"🔄 Refreshing token for user {user_id}")
        
        result = await recommendation_service.refresh_user_token(user_id, refresh_token)
        
        return {
            "status": "success",
            "access_token": result["access_token"],
            "expires_in": result["expires_in"],
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to refresh token: {e}")
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.get("/track/{track_id}/features")
async def get_track_features(track_id: str):
    """Get detailed audio features for a track."""
    try:
        logger.info(f"🎵 Getting audio features for track {track_id}")
        
        features = await recommendation_service.get_track_audio_features(track_id)
        
        if not features:
            raise HTTPException(status_code=404, detail="Track not found or no features available")
        
        return {
            "track_id": track_id,
            "features": features
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get track features: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get track features: {str(e)}")
