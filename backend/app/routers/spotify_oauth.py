"""
Spotify OAuth Authentication Router
Handles OAuth flow, token exchange, and refresh
"""

import os
import logging
import requests
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
# from app.database.database_service import db_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/spotify", tags=["Spotify OAuth"])

# In-memory token storage (replace with database in production)
spotify_tokens: Dict[str, Dict[str, Any]] = {}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None
    scope: Optional[str] = None

class TokenInfo(BaseModel):
    has_access_token: bool
    has_refresh_token: bool
    expires_at: Optional[str] = None
    token_expired: bool = False

@router.get("/login")
async def spotify_login():
    """Initiate Spotify OAuth flow"""
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/callback')
    
    if not client_id:
        raise HTTPException(status_code=500, detail="Spotify client ID not configured")
    
    # Generate state parameter for security
    state = str(uuid.uuid4())
    
    # Spotify OAuth URL
    auth_url = (
        f"https://accounts.spotify.com/authorize?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"scope=user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative&"
        f"redirect_uri={redirect_uri}&"
        f"state={state}"
    )
    
    logger.info(f"🎵 Initiating Spotify OAuth flow with state: {state}")
    return {"auth_url": auth_url, "state": state}

@router.get("/callback")
async def spotify_callback(code: str = Query(...), state: str = Query(None)):
    """Handle Spotify OAuth callback and exchange code for tokens"""
    request_id = str(uuid.uuid4())
    logger.info(f"🔄 [{request_id}] Processing Spotify callback with code")
    
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/callback')
    
    if not client_id or not client_secret:
        logger.error(f"❌ [{request_id}] Spotify credentials not configured")
        raise HTTPException(status_code=500, detail="Spotify credentials not configured")
    
    try:
        # Exchange code for tokens
        token_data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': client_id,
            'client_secret': client_secret
        }
        
        response = requests.post(
            'https://accounts.spotify.com/api/token',
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        logger.info(f"📡 [{request_id}] Spotify token response status: {response.status_code}")
        
        if response.status_code == 200:
            token_response = response.json()
            
            # Calculate expiration time
            expires_at = datetime.now() + timedelta(seconds=token_response['expires_in'])
            
            # Store tokens (in-memory for now, database integration pending)
            user_id = "default_user"
            spotify_tokens[user_id] = {
                'access_token': token_response['access_token'],
                'refresh_token': token_response.get('refresh_token'),
                'expires_at': expires_at.isoformat(),
                'token_type': token_response.get('token_type', 'Bearer'),
                'scope': token_response.get('scope')
            }
            
            logger.info(f"✅ [{request_id}] Tokens stored successfully for user: {user_id}")
            logger.info(f"🕒 [{request_id}] Token expires at: {expires_at}")
            
            return {
                "message": "Authentication successful",
                "user_id": user_id,
                "expires_at": expires_at.isoformat(),
                "has_refresh_token": bool(token_response.get('refresh_token'))
            }
        else:
            error_detail = response.text
            logger.error(f"❌ [{request_id}] Spotify token exchange failed: {response.status_code} - {error_detail}")
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {error_detail}")
            
    except requests.RequestException as e:
        logger.error(f"❌ [{request_id}] Request error during token exchange: {e}")
        raise HTTPException(status_code=500, detail=f"Token exchange request failed: {str(e)}")
    except Exception as e:
        logger.error(f"❌ [{request_id}] Unexpected error during token exchange: {e}")
        raise HTTPException(status_code=500, detail=f"Token exchange failed: {str(e)}")

@router.post("/refresh")
async def refresh_spotify_token(user_id: str = "default_user"):
    """Refresh Spotify access token using refresh token"""
    request_id = str(uuid.uuid4())
    logger.info(f"🔄 [{request_id}] Refreshing token for user: {user_id}")
    
    if user_id not in spotify_tokens:
        logger.error(f"❌ [{request_id}] No tokens found for user: {user_id}")
        raise HTTPException(status_code=404, detail="No tokens found for user")
    
    stored_tokens = spotify_tokens[user_id]
    refresh_token = stored_tokens.get('refresh_token')
    
    if not refresh_token:
        logger.error(f"❌ [{request_id}] No refresh token available for user: {user_id}")
        raise HTTPException(status_code=400, detail="No refresh token available")
    
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    try:
        # Refresh token request
        token_data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': client_id,
            'client_secret': client_secret
        }
        
        response = requests.post(
            'https://accounts.spotify.com/api/token',
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        logger.info(f"📡 [{request_id}] Spotify refresh response status: {response.status_code}")
        
        if response.status_code == 200:
            token_response = response.json()
            
            # Update stored tokens
            expires_at = datetime.now() + timedelta(seconds=token_response['expires_in'])
            spotify_tokens[user_id].update({
                'access_token': token_response['access_token'],
                'expires_at': expires_at.isoformat(),
                'token_type': token_response.get('token_type', 'Bearer')
            })
            
            # Update refresh token if provided
            if 'refresh_token' in token_response:
                spotify_tokens[user_id]['refresh_token'] = token_response['refresh_token']
            
            logger.info(f"✅ [{request_id}] Token refreshed successfully")
            
            return {
                "message": "Token refreshed successfully",
                "expires_at": expires_at.isoformat(),
                "has_refresh_token": bool(spotify_tokens[user_id].get('refresh_token'))
            }
        else:
            error_detail = response.text
            logger.error(f"❌ [{request_id}] Spotify refresh failed: {response.status_code} - {error_detail}")
            raise HTTPException(status_code=400, detail=f"Token refresh failed: {error_detail}")
            
    except requests.RequestException as e:
        logger.error(f"❌ [{request_id}] Request error during token refresh: {e}")
        raise HTTPException(status_code=500, detail=f"Token refresh request failed: {str(e)}")
    except Exception as e:
        logger.error(f"❌ [{request_id}] Unexpected error during token refresh: {e}")
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.get("/debug")
async def debug_spotify_tokens(user_id: str = "default_user"):
    """Debug endpoint to check token status (remove in production)"""
    if user_id not in spotify_tokens:
        return {"message": "No tokens found for user", "user_id": user_id}
    
    tokens = spotify_tokens[user_id]
    expires_at = datetime.fromisoformat(tokens['expires_at'])
    is_expired = datetime.now() >= expires_at
    
    return {
        "user_id": user_id,
        "has_access_token": bool(tokens.get('access_token')),
        "has_refresh_token": bool(tokens.get('refresh_token')),
        "expires_at": tokens['expires_at'],
        "token_expired": is_expired,
        "access_token_preview": tokens.get('access_token', '')[:20] + "..." if tokens.get('access_token') else None,
        "token_type": tokens.get('token_type'),
        "scope": tokens.get('scope')
    }

def get_user_access_token(user_id: str = "default_user") -> Optional[str]:
    """Helper function to get valid access token for user"""
    if user_id not in spotify_tokens:
        return None
    
    tokens = spotify_tokens[user_id]
    expires_at = datetime.fromisoformat(tokens['expires_at'])
    
    # Check if token is expired (with 5-minute buffer)
    if datetime.now() >= (expires_at - timedelta(minutes=5)):
        logger.warning(f"⚠️ Token for user {user_id} is expired or about to expire")
        return None
    
    return tokens.get('access_token')
