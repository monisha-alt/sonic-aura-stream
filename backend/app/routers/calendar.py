from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import requests
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User
from app.core.auth import get_current_user
from app.core.config import settings

router = APIRouter()

class CalendarEvent:
    def __init__(self, event_data: dict):
        self.id = event_data.get('id')
        self.summary = event_data.get('summary', 'No Title')
        self.description = event_data.get('description', '')
        self.start = event_data.get('start', {})
        self.end = event_data.get('end', {})
        self.location = event_data.get('location', '')
        self.attendees = event_data.get('attendees', [])

@router.get("/status")
async def get_calendar_status(current_user: User = Depends(get_current_user)):
    """Check if user's calendar is connected"""
    # In a real implementation, you would check if the user has valid Google Calendar tokens
    # For now, we'll return a mock status
    return {
        "connected": True,  # This would be determined by checking stored tokens
        "user_id": current_user.id,
        "last_sync": datetime.utcnow().isoformat()
    }

@router.post("/connect")
async def connect_calendar(current_user: User = Depends(get_current_user)):
    """Initiate Google Calendar OAuth flow"""
    # Generate OAuth URL for Google Calendar
    oauth_url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:3000/callback&scope=https://www.googleapis.com/auth/calendar.readonly&response_type=code"
    
    return {
        "auth_url": oauth_url,
        "message": "Redirect user to this URL to authorize calendar access"
    }

@router.post("/callback")
async def handle_calendar_callback(
    code: str,
    current_user: User = Depends(get_current_user)
):
    """Handle OAuth callback and exchange code for tokens"""
    try:
        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": "http://localhost:3000/callback"
        }
        
        response = requests.post(token_url, data=token_data)
        if response.status_code == 200:
            tokens = response.json()
            
            # In a real implementation, you would store these tokens in the database
            # associated with the user for future API calls
            
            return {
                "success": True,
                "message": "Calendar connected successfully",
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token")
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to exchange authorization code")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
async def get_calendar_events(
    current_user: User = Depends(get_current_user),
    days_ahead: int = 7
):
    """Get upcoming calendar events"""
    try:
        # In a real implementation, you would use the stored access token
        # For now, we'll return mock events
        
        mock_events = [
            {
                "id": "event_1",
                "summary": "Team Meeting",
                "description": "Weekly team standup",
                "start": {
                    "dateTime": (datetime.utcnow() + timedelta(hours=2)).isoformat() + "Z"
                },
                "end": {
                    "dateTime": (datetime.utcnow() + timedelta(hours=3)).isoformat() + "Z"
                },
                "location": "Conference Room A",
                "attendees": [
                    {"email": "john@example.com", "displayName": "John Doe"},
                    {"email": "jane@example.com", "displayName": "Jane Smith"}
                ]
            },
            {
                "id": "event_2",
                "summary": "Gym Session",
                "description": "Morning workout",
                "start": {
                    "dateTime": (datetime.utcnow() + timedelta(days=1, hours=7)).isoformat() + "Z"
                },
                "end": {
                    "dateTime": (datetime.utcnow() + timedelta(days=1, hours=8)).isoformat() + "Z"
                },
                "location": "Fitness Center",
                "attendees": []
            },
            {
                "id": "event_3",
                "summary": "Study Session",
                "description": "Prepare for exam",
                "start": {
                    "dateTime": (datetime.utcnow() + timedelta(days=2, hours=14)).isoformat() + "Z"
                },
                "end": {
                    "dateTime": (datetime.utcnow() + timedelta(days=2, hours=16)).isoformat() + "Z"
                },
                "location": "Library",
                "attendees": []
            }
        ]
        
        return {
            "events": mock_events,
            "total_count": len(mock_events),
            "user_id": current_user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-playlist")
async def generate_playlist_for_event(
    event_id: str,
    current_user: User = Depends(get_current_user)
):
    """Generate a playlist based on a specific calendar event"""
    try:
        # In a real implementation, you would:
        # 1. Fetch the event details from Google Calendar
        # 2. Analyze the event context (title, description, time, location)
        # 3. Generate appropriate playlist recommendations
        
        # Mock playlist generation
        mock_playlist = {
            "id": f"playlist_{event_id}",
            "name": "Event-Based Playlist",
            "description": "AI-generated playlist based on your calendar event",
            "context": "work_meeting",
            "confidence": 0.85,
            "songs": [
                {
                    "id": "song_1",
                    "title": "Focus Music",
                    "artist": "Ambient Artist",
                    "duration": 240,
                    "cover_url": "https://via.placeholder.com/300x300",
                    "preview_url": "https://example.com/preview1.mp3"
                },
                {
                    "id": "song_2",
                    "title": "Productive Vibes",
                    "artist": "Chill Producer",
                    "duration": 180,
                    "cover_url": "https://via.placeholder.com/300x300",
                    "preview_url": "https://example.com/preview2.mp3"
                }
            ]
        }
        
        return mock_playlist
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/disconnect")
async def disconnect_calendar(current_user: User = Depends(get_current_user)):
    """Disconnect user's calendar"""
    try:
        # In a real implementation, you would:
        # 1. Revoke the access tokens
        # 2. Remove stored tokens from database
        # 3. Clear any cached calendar data
        
        return {
            "success": True,
            "message": "Calendar disconnected successfully",
            "user_id": current_user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sync-status")
async def get_sync_status(current_user: User = Depends(get_current_user)):
    """Get calendar sync status and last sync time"""
    return {
        "connected": True,
        "last_sync": datetime.utcnow().isoformat(),
        "sync_frequency": "every_15_minutes",
        "user_id": current_user.id,
        "total_events_synced": 25
    }
