"""
Enhanced Google Calendar service with playlist generation.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from pydantic import BaseModel

from app.core.config import settings
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger(__name__)

class CalendarEvent(BaseModel):
    """Calendar event model."""
    id: str
    summary: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    calendar_type: str = "work"  # work, personal, creative, workout, etc.

class CalendarService:
    """Enhanced Google Calendar service with context-aware playlist generation."""
    
    SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
    
    def __init__(self):
        self.service = None
        self.credentials = None
        
    def _get_credentials(self, user_id: str) -> Optional[Credentials]:
        """Get stored credentials for user."""
        # In production, retrieve from database
        # For now, return None to indicate no stored credentials
        return None
    
    def _store_credentials(self, user_id: str, credentials: Credentials):
        """Store user credentials securely."""
        # In production, store in encrypted database
        logger.info(f"📝 Credentials stored for user {user_id}")
    
    async def get_auth_url(self, user_id: str) -> str:
        """Generate Google OAuth authorization URL."""
        try:
            flow = InstalledAppFlow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": ["https://localhost:3000/callback"]
                    }
                },
                self.SCOPES
            )
            
            auth_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=user_id
            )
            
            logger.info(f"🔗 Generated auth URL for user {user_id}")
            return auth_url
            
        except Exception as e:
            logger.error(f"❌ Failed to generate auth URL: {e}")
            raise
    
    async def handle_oauth_callback(self, code: str, user_id: str) -> Dict[str, Any]:
        """Handle OAuth callback and exchange code for tokens."""
        try:
            flow = InstalledAppFlow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": ["https://localhost:3000/callback"]
                    }
                },
                self.SCOPES
            )
            
            # Exchange code for credentials
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Store credentials
            self._store_credentials(user_id, credentials)
            
            # Test the connection
            service = build('calendar', 'v3', credentials=credentials)
            calendar_list = service.calendarList().list().execute()
            
            return {
                "status": "success",
                "message": "Calendar connected successfully",
                "user_id": user_id,
                "calendars_count": len(calendar_list.get('items', [])),
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None
            }
            
        except Exception as e:
            logger.error(f"❌ OAuth callback failed: {e}")
            raise
    
    async def get_upcoming_events(self, user_id: str, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """Get upcoming events from user's calendar."""
        try:
            credentials = self._get_credentials(user_id)
            if not credentials:
                raise Exception("No stored credentials found. User needs to connect calendar first.")
            
            # Refresh credentials if needed
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                self._store_credentials(user_id, credentials)
            
            # Build service
            service = build('calendar', 'v3', credentials=credentials)
            
            # Get events for next N days
            now = datetime.utcnow()
            time_max = now + timedelta(days=days_ahead)
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now.isoformat() + 'Z',
                timeMax=time_max.isoformat() + 'Z',
                maxResults=50,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Process events
            processed_events = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                
                # Determine calendar type based on event details
                calendar_type = self._classify_event_type(event)
                
                processed_events.append({
                    "id": event['id'],
                    "summary": event.get('summary', 'No Title'),
                    "start": start,
                    "end": end,
                    "description": event.get('description', ''),
                    "calendar_type": calendar_type,
                    "location": event.get('location', ''),
                    "attendees": len(event.get('attendees', []))
                })
            
            logger.info(f"📅 Retrieved {len(processed_events)} events for user {user_id}")
            return processed_events
            
        except Exception as e:
            logger.error(f"❌ Failed to get calendar events: {e}")
            raise
    
    def _classify_event_type(self, event: Dict[str, Any]) -> str:
        """Classify event type based on summary and description."""
        summary = event.get('summary', '').lower()
        description = event.get('description', '').lower()
        location = event.get('location', '').lower()
        
        text = f"{summary} {description} {location}"
        
        # Classification keywords
        if any(word in text for word in ['meeting', 'call', 'conference', 'presentation', 'standup']):
            return 'work'
        elif any(word in text for word in ['workout', 'gym', 'run', 'exercise', 'training']):
            return 'workout'
        elif any(word in text for word in ['creative', 'design', 'write', 'art', 'music', 'studio']):
            return 'creative'
        elif any(word in text for word in ['date', 'romantic', 'anniversary', 'wedding']):
            return 'romantic'
        elif any(word in text for word in ['travel', 'flight', 'vacation', 'trip']):
            return 'travel'
        else:
            return 'personal'
    
    async def generate_contextual_playlist(
        self, 
        user_id: str, 
        event_id: str,
        event_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate playlist based on calendar event context."""
        try:
            logger.info(f"🎵 Generating playlist for event {event_id}")
            
            # Get event details
            if not event_context:
                events = await self.get_upcoming_events(user_id, days_ahead=1)
                event_context = next((e for e in events if e['id'] == event_id), None)
            
            if not event_context:
                raise Exception(f"Event {event_id} not found")
            
            # Determine playlist parameters based on event type
            playlist_config = self._get_playlist_config(event_context)
            
            # Get Spotify recommendations
            recommendations = await recommendation_service.get_contextual_recommendations(
                mood=playlist_config['mood'],
                genre=playlist_config['genre'],
                energy_level=playlist_config['energy_level'],
                duration_minutes=playlist_config['duration_minutes']
            )
            
            # Create playlist response
            playlist = {
                "playlist_name": playlist_config['name'],
                "description": playlist_config['description'],
                "event_id": event_id,
                "event_summary": event_context['summary'],
                "calendar_type": event_context['calendar_type'],
                "mood": playlist_config['mood'],
                "genre": playlist_config['genre'],
                "energy_level": playlist_config['energy_level'],
                "estimated_duration": playlist_config['duration_minutes'],
                "songs": recommendations[:playlist_config['track_count']],
                "generated_at": datetime.utcnow().isoformat(),
                "user_id": user_id
            }
            
            logger.info(f"✅ Generated playlist with {len(playlist['songs'])} tracks")
            return playlist
            
        except Exception as e:
            logger.error(f"❌ Failed to generate playlist: {e}")
            raise
    
    def _get_playlist_config(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Get playlist configuration based on event type."""
        event_type = event['calendar_type']
        duration = self._calculate_event_duration(event)
        
        configs = {
            'work': {
                'name': 'Focus & Productivity',
                'description': 'Instrumental tracks for concentration and focus',
                'mood': 'focused',
                'genre': 'ambient',
                'energy_level': 0.3,
                'track_count': 20,
                'duration_minutes': duration
            },
            'workout': {
                'name': 'High Energy Workout',
                'description': 'Upbeat tracks to power your workout',
                'mood': 'energetic',
                'genre': 'pop',
                'energy_level': 0.9,
                'track_count': 15,
                'duration_minutes': duration
            },
            'creative': {
                'name': 'Creative Inspiration',
                'description': 'Inspiring music for creative work',
                'mood': 'inspired',
                'genre': 'alternative',
                'energy_level': 0.6,
                'track_count': 25,
                'duration_minutes': duration
            },
            'romantic': {
                'name': 'Romantic Vibes',
                'description': 'Soft and romantic tracks',
                'mood': 'romantic',
                'genre': 'indie',
                'energy_level': 0.4,
                'track_count': 12,
                'duration_minutes': duration
            },
            'travel': {
                'name': 'Travel Playlist',
                'description': 'Adventure and discovery tracks',
                'mood': 'adventurous',
                'genre': 'folk',
                'energy_level': 0.7,
                'track_count': 30,
                'duration_minutes': duration
            },
            'personal': {
                'name': 'Personal Time',
                'description': 'Relaxing tracks for personal time',
                'mood': 'calm',
                'genre': 'acoustic',
                'energy_level': 0.5,
                'track_count': 18,
                'duration_minutes': duration
            }
        }
        
        return configs.get(event_type, configs['personal'])
    
    def _calculate_event_duration(self, event: Dict[str, Any]) -> int:
        """Calculate event duration in minutes."""
        try:
            start = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
            end = datetime.fromisoformat(event['end'].replace('Z', '+00:00'))
            duration = (end - start).total_seconds() / 60
            return max(30, min(180, int(duration)))  # Clamp between 30-180 minutes
        except:
            return 60  # Default 1 hour
    
    async def get_calendar_status(self, user_id: str) -> Dict[str, Any]:
        """Get calendar connection status."""
        try:
            credentials = self._get_credentials(user_id)
            
            if not credentials:
                return {
                    "connected": False,
                    "message": "Calendar not connected",
                    "user_id": user_id
                }
            
            # Test connection
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                self._store_credentials(user_id, credentials)
            
            service = build('calendar', 'v3', credentials=credentials)
            calendar_list = service.calendarList().list().execute()
            
            return {
                "connected": True,
                "message": "Calendar connected successfully",
                "user_id": user_id,
                "calendars_count": len(calendar_list.get('items', [])),
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None
            }
            
        except Exception as e:
            logger.error(f"❌ Calendar status check failed: {e}")
            return {
                "connected": False,
                "message": f"Calendar connection error: {str(e)}",
                "user_id": user_id
            }

# Global instance
calendar_service = CalendarService()
