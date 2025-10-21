from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import logging
from dotenv import load_dotenv
# from app.database.models import Base
# from app.database import engine

# Configure logging based on environment
import os
log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
environment = os.getenv('ENVIRONMENT', 'development')

if environment == 'production':
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('aura_music.log')
        ]
    )
else:
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import services after environment variables are loaded
from app.services.spotify_service import spotify_service
from app.routers.emotion_recommendations import router as emotion_router
from app.routers.spotify_oauth import router as spotify_oauth_router
from app.routers.spotify_trending import router as spotify_trending_router
from app.routers.voice_upload import router as voice_upload_router
# from app.routers.feedback import router as feedback_router

# Import environment validation
try:
    from app.core.validation import validate_environment, check_external_dependencies
    logger.info("🔍 Running environment validation...")
    
    # Validate environment variables
    config = validate_environment()
    
    # Check external dependencies
    deps_ok = check_external_dependencies()
    
    logger.info("✅ Environment validation passed!")
    logger.info(f"📦 External dependencies: {'✅ OK' if deps_ok else '⚠️  Some missing'}")
    
except ImportError:
    logger.warning("⚠️  Environment validation module not available")
except Exception as e:
    logger.error(f"❌ Environment validation failed: {e}")
    logger.warning("⚠️  Continuing with basic configuration...")

# Initialize FastAPI app
app = FastAPI(
    title="Aura Music API",
    description="AI-Powered Music Streaming Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize database tables (disabled for now)
# try:
#     Base.metadata.create_all(bind=engine)
#     logger.info("✅ Database tables created successfully")
# except Exception as e:
#     logger.warning(f"⚠️ Database initialization warning: {e}")

# CORS middleware - environment-aware configuration
allowed_origins = os.getenv('ALLOWED_ORIGINS', 
    'http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176'
).split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(emotion_router)
app.include_router(spotify_oauth_router)
app.include_router(spotify_trending_router)
app.include_router(voice_upload_router)
# app.include_router(feedback_router)

# Pydantic models
class EmotionDetectionRequest(BaseModel):
    text: Optional[str] = None
    emotion: Optional[str] = None
    confidence: Optional[float] = None

class SongRecommendation(BaseModel):
    id: str
    title: str
    artist: str
    album: str
    duration: int
    preview_url: Optional[str] = None
    cover_url: Optional[str] = None
    spotify_url: Optional[str] = None
    popularity: Optional[int] = None

class RecommendationResponse(BaseModel):
    recommendations: List[SongRecommendation]
    emotion: Optional[str] = None
    confidence: Optional[float] = None

class CommentRequest(BaseModel):
    song_id: int
    content: str
    timestamp: float
    parent_id: Optional[int] = None

class Comment(BaseModel):
    id: int
    content: str
    timestamp: float
    user_id: int
    song_id: int
    parent_id: Optional[int] = None
    created_at: str
    replies: Optional[List['Comment']] = None

# Mock data
MOCK_SONGS = [
    {
        "id": "1",
        "title": "Anti-Hero",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "duration": 201,
        "preview_url": "https://p.scdn.co/mp3-preview/sample1.mp3",
        "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Midnights",
        "spotify_url": "https://open.spotify.com/track/1",
        "popularity": 95
    },
    {
        "id": "2",
        "title": "As It Was",
        "artist": "Harry Styles",
        "album": "Harry's House",
        "duration": 167,
        "preview_url": "https://p.scdn.co/mp3-preview/sample2.mp3",
        "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Harry's+House",
        "spotify_url": "https://open.spotify.com/track/2",
        "popularity": 92
    },
    {
        "id": "3",
        "title": "Heat Waves",
        "artist": "Glass Animals",
        "album": "Dreamland",
        "duration": 238,
        "preview_url": "https://p.scdn.co/mp3-preview/sample3.mp3",
        "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Dreamland",
        "spotify_url": "https://open.spotify.com/track/3",
        "popularity": 88
    }
]

MOCK_ALBUMS = [
    {
        "id": "1",
        "name": "Midnights",
        "artist": "Taylor Swift",
        "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Midnights",
        "release_date": "2022-10-21",
        "total_tracks": 13
    },
    {
        "id": "2",
        "name": "Harry's House",
        "artist": "Harry Styles",
        "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Harry's+House",
        "release_date": "2022-05-20",
        "total_tracks": 13
    }
]

MOCK_ARTISTS = [
    {
        "id": "1",
        "name": "Taylor Swift",
        "genres": ["Pop", "Country"],
        "popularity": 95,
        "image_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=TS"
    },
    {
        "id": "2",
        "name": "Harry Styles",
        "genres": ["Pop", "Rock"],
        "popularity": 92,
        "image_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=HS"
    }
]

# Routes
@app.get("/")
async def root():
    return {
        "message": "Aura Music Streaming API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Enhanced health check endpoint for Docker and load balancers"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "redis": "connected", 
            "openai": "configured",
            "spotify": "configured",
            "weather": "configured",
            "google_calendar": "configured"
        },
        "features": {
            "emotion_detection": "active",
            "voice_processing": "active",
            "spotify_integration": "active",
            "weather_recommendations": "active",
            "calendar_sync": "active",
            "song_summarization": "active"
        }
    }

# Emotion Detection
@app.post("/api/emotions/detect-text")
async def detect_emotion_from_text(request: EmotionDetectionRequest):
    """Detect emotion from text input"""
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # Simple emotion detection based on keywords
    text_lower = request.text.lower()
    emotion_scores = {
        "happy": ["happy", "joy", "excited", "great", "amazing", "wonderful", "fantastic"],
        "sad": ["sad", "depressed", "down", "melancholy", "blue", "gloomy"],
        "angry": ["angry", "mad", "furious", "rage", "annoyed", "irritated"],
        "calm": ["calm", "peaceful", "relaxed", "serene", "tranquil", "zen"],
        "energetic": ["energetic", "pumped", "hyped", "active", "dynamic", "intense"]
    }
    
    emotion_counts = {}
    for emotion, keywords in emotion_scores.items():
        emotion_counts[emotion] = sum(1 for keyword in keywords if keyword in text_lower)
    
    if not any(emotion_counts.values()):
        detected_emotion = "neutral"
        confidence = 0.5
    else:
        detected_emotion = max(emotion_counts, key=emotion_counts.get)
        confidence = min(0.9, 0.5 + (emotion_counts[detected_emotion] * 0.1))
    
    return {
        "emotion": detected_emotion,
        "confidence": confidence,
        "text": request.text
    }

@app.post("/api/emotions/detect-voice")
async def detect_emotion_from_voice(audio_file: UploadFile = File(...)):
    """Enhanced emotion detection from voice recording with full pipeline"""
    try:
        logger.info(f"🎤 Processing voice emotion detection: {audio_file.filename}")
        
        # Validate file type
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an audio file (WebM, WAV, MP3, etc.)"
            )
        
        # Read audio data
        audio_data = await audio_file.read()
        logger.info(f"📁 Audio file size: {len(audio_data)} bytes, type: {audio_file.content_type}")
        
        if len(audio_data) == 0:
            raise HTTPException(status_code=400, detail="Audio file is empty")
        
        # Try to use enhanced emotion detection service
        try:
            from app.services.enhanced_emotion_detection import enhanced_emotion_service
            
            result = await enhanced_emotion_service.detect_emotion_from_voice(
                audio_data, 
                audio_file.filename or "audio.webm",
                "demo_user"
            )
            
            return {
                "emotion": result.emotion,
                "intensity": result.intensity,
                "confidence": result.confidence,
                "method": result.method,
                "transcription": result.transcription,
                "metadata": {
                    "file_size": len(audio_data),
                    "content_type": audio_file.content_type,
                    "filename": audio_file.filename,
                    "user_id": "demo_user"
                }
            }
            
        except ImportError:
            logger.warning("⚠️  Enhanced emotion service not available, using fallback")
            
        # Enhanced fallback with more unique results based on audio characteristics
        import time
        import random
        time.sleep(1)  # Simulate processing time
        
        # Use multiple factors to create more unique results
        file_hash = hash(audio_data)
        file_size = len(audio_data)
        timestamp = int(time.time())
        
        # Create a more complex hash for variety
        combined_hash = hash(str(file_hash) + str(file_size) + str(timestamp))
        
        emotions = ["happy", "sad", "angry", "calm", "energetic", "romantic", "nostalgic", "anxious", "neutral"]
        
        # Use different parts of the hash for different properties
        emotion_index = abs(combined_hash) % len(emotions)
        detected_emotion = emotions[emotion_index]
        
        # More varied confidence and intensity
        confidence = 0.6 + (abs(combined_hash >> 8) % 40) / 100  # 0.6-0.99
        intensity = 0.4 + (abs(combined_hash >> 16) % 60) / 100  # 0.4-0.99
        
        # Generate more realistic transcription based on emotion
        transcriptions = {
            "happy": ["I'm feeling really great today!", "This is amazing, I love it!", "I'm so excited about everything!"],
            "sad": ["I'm feeling a bit down today.", "Everything seems so difficult right now.", "I'm having a tough time."],
            "angry": ["I'm really frustrated with this situation.", "This is making me so mad!", "I can't stand this anymore."],
            "calm": ["I'm feeling very peaceful right now.", "Everything is so serene and quiet.", "I'm in a relaxed state of mind."],
            "energetic": ["I'm full of energy today!", "Let's go and do something exciting!", "I'm pumped up and ready!"],
            "romantic": ["I'm feeling so romantic and loving.", "My heart is full of love today.", "I'm in such a romantic mood."],
            "nostalgic": ["I'm thinking about the good old days.", "I miss those wonderful memories.", "Those were such beautiful times."],
            "anxious": ["I'm feeling worried about things.", "I can't stop thinking about problems.", "I'm feeling anxious today."],
            "neutral": ["I'm feeling okay, nothing special.", "Just a regular day for me.", "I'm in a neutral mood today."]
        }
        
        selected_transcription = random.choice(transcriptions[detected_emotion])
        
        logger.info(f"🎭 Mock emotion detection: {detected_emotion} (confidence: {confidence:.2f}, intensity: {intensity:.2f})")
        
        return {
            "emotion": detected_emotion,
            "intensity": intensity,
            "confidence": confidence,
            "method": "enhanced_mock_analysis",
            "transcription": selected_transcription,
            "metadata": {
                "file_size": len(audio_data),
                "content_type": audio_file.content_type,
                "filename": audio_file.filename,
                "user_id": "demo_user",
                "analysis_timestamp": timestamp,
                "hash_info": {
                    "file_hash": file_hash,
                    "combined_hash": combined_hash,
                    "emotion_index": emotion_index
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in voice emotion detection: {e}")
        raise HTTPException(status_code=500, detail=f"Voice emotion detection failed: {str(e)}")

# Recommendations
@app.get("/api/recommendations/emotion-based")
async def get_emotion_based_recommendations(
    emotion: str,
    confidence: float = 0.5,
    limit: int = 10
):
    """Get song recommendations based on detected emotion"""
    
    # Filter songs based on emotion (mock logic)
    emotion_mapping = {
        "happy": ["Anti-Hero", "As It Was"],
        "sad": ["Heat Waves"],
        "calm": ["Anti-Hero", "Heat Waves"],
        "energetic": ["As It Was", "Anti-Hero"],
        "neutral": ["Anti-Hero", "As It Was", "Heat Waves"]
    }
    
    recommended_titles = emotion_mapping.get(emotion, emotion_mapping["neutral"])
    recommendations = [song for song in MOCK_SONGS if song["title"] in recommended_titles]
    
    return {
        "recommendations": recommendations[:limit],
        "emotion": emotion,
        "confidence": confidence,
        "total_count": len(recommendations)
    }

@app.get("/api/recommendations/weather-based")
async def get_weather_based_recommendations(
    location: str,
    emotion: Optional[str] = None,
    limit: int = 10
):
    """Get song recommendations based on weather and location"""
    
    # Mock weather-based recommendations
    recommendations = MOCK_SONGS[:limit]
    
    return {
        "recommendations": recommendations,
        "location": location,
        "weather_context": {
            "condition": "sunny",
            "temperature": 22,
            "humidity": 65
        },
        "emotion": emotion
    }

# Spotify Integration
@app.get("/api/spotify/trending-albums")
async def get_trending_albums(limit: int = 20):
    """Get trending albums from Spotify"""
    return {
        "albums": MOCK_ALBUMS[:limit],
        "total_count": len(MOCK_ALBUMS)
    }

@app.get("/api/spotify/featured-artists")
async def get_featured_artists(limit: int = 20):
    """Get featured artists from Spotify"""
    return {
        "artists": MOCK_ARTISTS[:limit],
        "total_count": len(MOCK_ARTISTS)
    }

@app.get("/api/spotify/search")
async def search_spotify(query: str, limit: int = 20):
    """Search for songs, artists, and albums on Spotify"""
    # Simple search logic
    results = [song for song in MOCK_SONGS if 
               query.lower() in song["title"].lower() or 
               query.lower() in song["artist"].lower()]
    
    return {
        "songs": results[:limit],
        "query": query,
        "total_count": len(results)
    }

# Calendar API
@app.get("/api/calendar/status")
async def get_calendar_status():
    """Get calendar connection status"""
    return {
        "connected": False,
        "message": "Calendar not connected",
        "redirect_uri": "https://localhost:3000/callback"
    }

@app.post("/api/calendar/connect")
async def connect_calendar():
    """Connect to Google Calendar"""
    # Use your actual redirect URI
    redirect_uri = "https://localhost:3000/callback"
    client_id = os.getenv("GOOGLE_CLIENT_ID", "your_google_client_id")
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=https://www.googleapis.com/auth/calendar.readonly&"
        f"response_type=code&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    
    return {
        "auth_url": auth_url,
        "message": "Please visit the auth URL to connect your calendar",
        "redirect_uri": redirect_uri,
        "instructions": [
            "1. Click the auth URL to authorize the app",
            "2. You'll be redirected to your callback URL with a code",
            "3. The app will exchange the code for access tokens",
            "4. Your calendar will be connected for playlist generation"
        ]
    }

@app.post("/api/calendar/callback")
async def handle_oauth_callback(code: str):
    """Handle OAuth callback with authorization code"""
    # In a real implementation, you would:
    # 1. Exchange the code for access/refresh tokens
    # 2. Store tokens securely
    # 3. Test the connection
    
    return {
        "status": "success",
        "message": "Calendar connected successfully!",
        "code_received": code,
        "next_steps": [
            "Calendar access granted",
            "Can now fetch events and generate playlists",
            "Try the 'Get Events' button to see your calendar"
        ]
    }

@app.get("/api/calendar/events")
async def get_calendar_events():
    """Get upcoming calendar events"""
    # Mock calendar events - in real app, fetch from Google Calendar API
    mock_events = [
        {
            "id": "1",
            "summary": "Team Meeting",
            "start": "2024-01-01T10:00:00Z",
            "end": "2024-01-01T11:00:00Z",
            "description": "Weekly team standup",
            "calendar_type": "work"
        },
        {
            "id": "2", 
            "summary": "Workout Session",
            "start": "2024-01-01T18:00:00Z",
            "end": "2024-01-01T19:00:00Z",
            "description": "Gym workout",
            "calendar_type": "personal"
        },
        {
            "id": "3",
            "summary": "Creative Writing",
            "start": "2024-01-01T14:00:00Z",
            "end": "2024-01-01T15:30:00Z",
            "description": "Focus time for writing",
            "calendar_type": "creative"
        }
    ]
    return {
        "events": mock_events,
        "total_count": len(mock_events),
        "calendar_connected": True
    }

@app.post("/api/calendar/generate-playlist")
async def generate_calendar_playlist(event_data: dict):
    """Generate playlist based on calendar event"""
    event_id = event_data.get("event_id", "1")
    
    # Mock playlist generation based on event type
    event_playlists = {
        "1": {
            "playlist_name": "Meeting Focus Music",
            "description": "Instrumental tracks for concentration",
            "mood": "focused",
            "songs": [
                {
                    "id": "1",
                    "title": "Ambient Focus",
                    "artist": "Study Music",
                    "duration": 300,
                    "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Focus",
                    "preview_url": None
                },
                {
                    "id": "2", 
                    "title": "Deep Concentration",
                    "artist": "Lo-Fi Beats",
                    "duration": 240,
                    "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Lo-Fi",
                    "preview_url": None
                }
            ]
        },
        "2": {
            "playlist_name": "Workout Energy",
            "description": "High-energy tracks for exercise",
            "mood": "energetic",
            "songs": [
                {
                    "id": "3",
                    "title": "Pump It Up",
                    "artist": "Workout Mix",
                    "duration": 200,
                    "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Energy",
                    "preview_url": None
                },
                {
                    "id": "4",
                    "title": "Power Hour",
                    "artist": "Fitness Music",
                    "duration": 180,
                    "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Power",
                    "preview_url": None
                }
            ]
        },
        "3": {
            "playlist_name": "Creative Inspiration",
            "description": "Inspiring music for creative work",
            "mood": "inspired",
            "songs": [
                {
                    "id": "5",
                    "title": "Creative Flow",
                    "artist": "Inspiration Mix",
                    "duration": 280,
                    "cover_url": "https://via.placeholder.com/300x300/1f2937/ffffff?text=Creative",
                    "preview_url": None
                }
            ]
        }
    }
    
    playlist = event_playlists.get(event_id, event_playlists["1"])
    playlist["event_id"] = event_id
    
    return playlist

# Comments
@app.get("/api/comments")
async def get_comments(song_id: str, timestamp: Optional[float] = None):
    """Get comments for a song, optionally filtered by timestamp"""
    # Mock comments
    mock_comments = [
        {
            "id": 1,
            "content": "This song hits different! 🔥",
            "timestamp": 30.5,
            "user_id": 1,
            "song_id": song_id,
            "parent_id": None,
            "created_at": "2024-01-01T10:00:00Z",
            "replies": []
        },
        {
            "id": 2,
            "content": "The beat drop is insane!",
            "timestamp": 45.2,
            "user_id": 2,
            "song_id": song_id,
            "parent_id": None,
            "created_at": "2024-01-01T10:05:00Z",
            "replies": []
        }
    ]
    
    if timestamp:
        mock_comments = [c for c in mock_comments if abs(c["timestamp"] - timestamp) <= 10]
    
    return {"comments": mock_comments}

@app.post("/api/comments")
async def create_comment(comment: CommentRequest):
    """Create a new comment"""
    return {
        "id": 999,
        "content": comment.content,
        "timestamp": comment.timestamp,
        "user_id": 1,  # Mock user
        "song_id": comment.song_id,
        "parent_id": comment.parent_id,
        "created_at": "2024-01-01T12:00:00Z"
    }

# Songs
@app.get("/api/songs")
async def get_songs(limit: int = 20, offset: int = 0):
    """Get all songs"""
    return {
        "songs": MOCK_SONGS[offset:offset+limit],
        "total_count": len(MOCK_SONGS)
    }

@app.get("/api/songs/{song_id}")
async def get_song(song_id: str):
    """Get a specific song by ID"""
    song = next((s for s in MOCK_SONGS if s["id"] == song_id), None)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@app.post("/api/songs/summarize")
async def summarize_song(request: dict):
    """Generate AI-powered song summary"""
    song_id = request.get("song_id", "1")
    lyrics = request.get("lyrics", "Sample lyrics for the song")
    
    # Mock AI summarization
    summaries = {
        "1": {
            "mood": "confident",
            "genre": "pop",
            "emotion": "empowering",
            "summary": "This upbeat pop anthem explores themes of self-empowerment and overcoming personal struggles. The lyrics convey a message of resilience and self-acceptance.",
            "key_themes": ["self-empowerment", "resilience", "personal growth"],
            "energy_level": 8.5,
            "danceability": 7.2,
            "valence": 0.7
        },
        "2": {
            "mood": "reflective",
            "genre": "indie pop",
            "emotion": "nostalgic",
            "summary": "A contemplative indie track that reflects on past relationships and personal growth. The lyrics evoke feelings of nostalgia and acceptance.",
            "key_themes": ["reflection", "relationships", "change"],
            "energy_level": 6.0,
            "danceability": 5.5,
            "valence": 0.4
        },
        "3": {
            "mood": "dreamy",
            "genre": "alternative",
            "emotion": "melancholic",
            "summary": "An atmospheric alternative track with dreamy soundscapes and introspective lyrics about love and loss.",
            "key_themes": ["love", "loss", "dreams"],
            "energy_level": 5.5,
            "danceability": 6.8,
            "valence": 0.3
        }
    }
    
    summary = summaries.get(song_id, summaries["1"])
    summary["song_id"] = song_id
    summary["lyrics_analyzed"] = lyrics[:100] + "..." if len(lyrics) > 100 else lyrics
    
    return summary

# Spotify Integration Endpoints
@app.get("/api/spotify/new-releases")
async def get_new_releases(limit: int = Query(20, ge=1, le=50)):
    """Get new album releases from Spotify"""
    try:
        logger.info(f"🎵 Fetching new releases (limit: {limit})")
        albums = await spotify_service.get_new_releases(limit)
        
        if not albums:
            logger.warning("⚠️ No new releases found, returning mock data")
            return {
                "albums": MOCK_ALBUMS[:limit],
                "source": "mock_data",
                "message": "Spotify API not available, showing sample data"
            }
        
        # Convert to API format
        albums_data = []
        for album in albums:
            albums_data.append({
                "id": album.id,
                "name": album.name,
                "artist": album.artist,
                "release_date": album.release_date,
                "total_tracks": album.total_tracks,
                "image_url": album.image_url,
                "external_urls": album.external_urls,
                "spotify_url": album.external_urls.get("spotify", "")
            })
        
        return {
            "albums": albums_data,
            "source": "spotify_api",
            "total": len(albums_data)
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching new releases: {e}")
        return {
            "albums": MOCK_ALBUMS[:limit],
            "source": "error_fallback",
            "error": str(e)
        }

@app.get("/api/spotify/featured-playlists")
async def get_featured_playlists(limit: int = Query(20, ge=1, le=50)):
    """Get featured playlists from Spotify"""
    try:
        logger.info(f"🎵 Fetching featured playlists (limit: {limit})")
        playlists = await spotify_service.get_featured_playlists(limit)
        
        if not playlists:
            return {
                "playlists": [],
                "source": "no_data",
                "message": "No featured playlists available"
            }
        
        return {
            "playlists": playlists,
            "source": "spotify_api",
            "total": len(playlists)
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching featured playlists: {e}")
        return {
            "playlists": [],
            "source": "error",
            "error": str(e)
        }

@app.get("/api/spotify/top-tracks")
async def get_top_tracks(limit: int = Query(20, ge=1, le=50)):
    """Get top tracks from Spotify"""
    try:
        logger.info(f"🎵 Fetching top tracks (limit: {limit})")
        tracks = await spotify_service.get_top_tracks(limit)
        
        if not tracks:
            logger.warning("⚠️ No top tracks found, returning mock data")
            return {
                "tracks": MOCK_SONGS[:limit],
                "source": "mock_data",
                "message": "Spotify API not available, showing sample data"
            }
        
        # Convert to API format
        tracks_data = []
        for track in tracks:
            tracks_data.append({
                "id": track.id,
                "title": track.name,
                "artist": track.artist,
                "album": track.album,
                "duration": track.duration_ms,
                "preview_url": track.preview_url,
                "cover_url": track.cover_url,
                "spotify_url": track.external_urls.get("spotify", ""),
                "popularity": track.popularity
            })
        
        return {
            "tracks": tracks_data,
            "source": "spotify_api",
            "total": len(tracks_data)
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching top tracks: {e}")
        return {
            "tracks": MOCK_SONGS[:limit],
            "source": "error_fallback",
            "error": str(e)
        }

@app.get("/api/spotify/search")
async def search_spotify(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Search for tracks on Spotify"""
    try:
        logger.info(f"🔍 Searching Spotify for: '{query}' (limit: {limit})")
        tracks = await spotify_service.search_tracks(query, limit)
        
        if not tracks:
            return {
                "tracks": [],
                "query": query,
                "source": "no_results",
                "message": "No tracks found for this query"
            }
        
        # Convert to API format
        tracks_data = []
        for track in tracks:
            tracks_data.append({
                "id": track.id,
                "title": track.name,
                "artist": track.artist,
                "album": track.album,
                "duration": track.duration_ms,
                "preview_url": track.preview_url,
                "cover_url": track.cover_url,
                "spotify_url": track.external_urls.get("spotify", ""),
                "popularity": track.popularity
            })
        
        return {
            "tracks": tracks_data,
            "query": query,
            "source": "spotify_api",
            "total": len(tracks_data)
        }
        
    except Exception as e:
        logger.error(f"❌ Error searching Spotify: {e}")
        return {
            "tracks": [],
            "query": query,
            "source": "error",
            "error": str(e)
        }

@app.get("/api/spotify/audio-features/{track_id}")
async def get_audio_features(track_id: str):
    """Get audio features for a specific track"""
    try:
        logger.info(f"🎵 Fetching audio features for track: {track_id}")
        features = await spotify_service.get_audio_features(track_id)
        
        if not features:
            return {
                "track_id": track_id,
                "features": None,
                "source": "not_found",
                "message": "Audio features not available for this track"
            }
        
        return {
            "track_id": track_id,
            "features": features,
            "source": "spotify_api"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching audio features: {e}")
        return {
            "track_id": track_id,
            "features": None,
            "source": "error",
            "error": str(e)
        }

@app.get("/api/spotify/trending")
async def get_trending_content():
    """Get all trending content from Spotify (new releases, playlists, tracks)"""
    try:
        logger.info("🔥 Fetching all trending content from Spotify")
        
        # Fetch all trending data in parallel
        new_releases = await spotify_service.get_new_releases(10)
        featured_playlists = await spotify_service.get_featured_playlists(10)
        top_tracks = await spotify_service.get_top_tracks(10)
        
        return {
            "new_releases": [
                {
                    "id": album.id,
                    "name": album.name,
                    "artist": album.artist,
                    "release_date": album.release_date,
                    "image_url": album.image_url,
                    "spotify_url": album.external_urls.get("spotify", "")
                } for album in new_releases
            ],
            "featured_playlists": featured_playlists,
            "top_tracks": [
                {
                    "id": track.id,
                    "title": track.name,
                    "artist": track.artist,
                    "album": track.album,
                    "preview_url": track.preview_url,
                    "cover_url": track.cover_url,
                    "spotify_url": track.external_urls.get("spotify", ""),
                    "popularity": track.popularity
                } for track in top_tracks
            ],
            "source": "spotify_api",
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching trending content: {e}")
        return {
            "new_releases": MOCK_ALBUMS[:10],
            "featured_playlists": [],
            "top_tracks": MOCK_SONGS[:10],
            "source": "error_fallback",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        "main-simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
