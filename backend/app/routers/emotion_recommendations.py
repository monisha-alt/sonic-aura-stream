"""
Emotion-Based Recommendation API Endpoints
Provides endpoints for emotion detection and music recommendations.
"""

import logging
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Query, Form, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime

from ..services.emotion_analyzer import emotion_analyzer
from ..services.spotify_emotion_matcher import spotify_emotion_matcher
from ..services.recommendation_engine import recommendation_engine, RecommendationContext
from ..services.mood_playlist_generator import mood_playlist_generator, PlaylistConfig

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/emotion", tags=["emotion-recommendations"])

# Request/Response Models
class EmotionAnalysisRequest(BaseModel):
    emotion: str
    intensity: float = 0.7
    confidence: float = 0.8
    context: Optional[str] = None

class RecommendationRequest(BaseModel):
    emotion: str
    intensity: float = 0.7
    confidence: float = 0.8
    time_of_day: Optional[str] = None
    activity: Optional[str] = None
    weather: Optional[str] = None
    limit: int = 20
    recommendation_type: str = "mixed"  # "tracks", "playlist", "mixed"

class PlaylistRequest(BaseModel):
    emotion: str
    intensity: float = 0.7
    confidence: float = 0.8
    track_count: int = 15
    duration_minutes: Optional[int] = None
    time_of_day: Optional[str] = None
    activity: Optional[str] = None
    weather: Optional[str] = None
    energy_curve: str = "steady"  # "steady", "building", "declining", "wave"
    include_previews: bool = True

class EmotionTransitionRequest(BaseModel):
    from_emotion: str
    to_emotion: str
    intensity: float = 0.7
    transition_duration_minutes: int = 30

class EmotionHistoryRequest(BaseModel):
    user_id: str
    limit: int = 50

# API Endpoints

@router.post("/analyze")
async def analyze_emotion(request: EmotionAnalysisRequest):
    """
    Analyze emotion and generate music preferences.
    
    Args:
        request: Emotion analysis request with emotion, intensity, confidence, and context
        
    Returns:
        Emotion profile with music preferences and recommendations
    """
    try:
        logger.info(f"🎭 Analyzing emotion: {request.emotion}")
        
        # Create emotion profile
        emotion_profile = emotion_analyzer.analyze_emotion_profile(
            emotion=request.emotion,
            intensity=request.intensity,
            confidence=request.confidence,
            context=request.context
        )
        
        # Generate music preferences
        music_prefs = emotion_analyzer.generate_music_preferences(emotion_profile)
        
        # Get quick recommendations
        recommendations = await spotify_emotion_matcher.get_recommendations_for_emotion(
            emotion=request.emotion,
            intensity=request.intensity,
            confidence=request.confidence,
            context=request.context,
            limit=5
        )
        
        return {
            "emotion_profile": {
                "primary_emotion": emotion_profile.primary_emotion.value,
                "intensity": emotion_profile.intensity,
                "confidence": emotion_profile.confidence,
                "secondary_emotions": [
                    {"emotion": emo.value, "weight": weight}
                    for emo, weight in emotion_profile.secondary_emotions
                ],
                "mood_context": emotion_profile.mood_context,
                "energy_level": emotion_profile.energy_level,
                "valence": emotion_profile.valence,
                "arousal": emotion_profile.arousal
            },
            "music_preferences": {
                "target_valence": music_prefs.target_valence,
                "target_energy": music_prefs.target_energy,
                "target_danceability": music_prefs.target_danceability,
                "target_acousticness": music_prefs.target_acousticness,
                "target_instrumentalness": music_prefs.target_instrumentalness,
                "target_liveness": music_prefs.target_liveness,
                "target_speechiness": music_prefs.target_speechiness,
                "target_tempo": music_prefs.target_tempo,
                "preferred_genres": music_prefs.preferred_genres,
                "mood_keywords": music_prefs.mood_keywords
            },
            "quick_recommendations": recommendations,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing emotion: {e}")
        raise HTTPException(status_code=500, detail=f"Emotion analysis failed: {str(e)}")

@router.post("/recommend")
async def get_emotion_recommendations(request: RecommendationRequest):
    """
    Get intelligent music recommendations based on emotion and context.
    
    Args:
        request: Recommendation request with emotion, context, and preferences
        
    Returns:
        Personalized music recommendations with reasoning
    """
    try:
        logger.info(f"🤖 Getting recommendations for emotion: {request.emotion}")
        
        # Create recommendation context
        context = RecommendationContext(
            current_emotion=emotion_analyzer.analyze_emotion_profile(
                request.emotion, request.intensity, request.confidence
            ),
            time_of_day=request.time_of_day,
            day_of_week=datetime.now().strftime("%A").lower(),
            weather=request.weather,
            activity=request.activity
        )
        
        # Generate recommendations
        result = await recommendation_engine.generate_recommendations(
            emotion=request.emotion,
            intensity=request.intensity,
            confidence=request.confidence,
            context=context,
            recommendation_type=request.recommendation_type,
            limit=request.limit
        )
        
        # Format response
        return {
            "emotion": request.emotion,
            "intensity": request.intensity,
            "confidence": result.confidence,
            "reasoning": result.reasoning,
            "context_factors": result.context_factors,
            "recommendations": [
                {
                    "track_id": rec.track_id,
                    "name": rec.track_name,
                    "artist": rec.artist_name,
                    "album": rec.album_name,
                    "match_score": rec.match_score,
                    "preview_url": rec.preview_url,
                    "spotify_url": rec.spotify_url,
                    "album_cover": rec.album_cover,
                    "duration_ms": rec.duration_ms,
                    "popularity": rec.popularity,
                    "emotion_fit": rec.emotion_fit
                }
                for rec in result.recommendations
            ],
            "playlist": {
                "emotion": result.playlist.emotion if result.playlist else request.emotion,
                "tracks": len(result.playlist.tracks) if result.playlist else 0,
                "total_duration_ms": result.playlist.total_duration_ms if result.playlist else 0,
                "avg_match_score": result.playlist.avg_match_score if result.playlist else 0,
                "mood_description": result.playlist.mood_description if result.playlist else "",
                "playlist_id": result.playlist.playlist_id if result.playlist else "",
                "cover_image": result.playlist.cover_image if result.playlist else ""
            } if result.playlist else None,
            "alternative_suggestions": result.alternative_suggestions,
            "created_at": result.created_at.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")

@router.post("/playlist")
async def generate_mood_playlist(request: PlaylistRequest):
    """
    Generate a comprehensive mood-based playlist.
    
    Args:
        request: Playlist generation request with emotion, context, and configuration
        
    Returns:
        Generated playlist with tracks and metadata
    """
    try:
        logger.info(f"🎧 Generating mood playlist for emotion: {request.emotion}")
        
        # Create playlist configuration
        config = PlaylistConfig(
            name=f"{request.emotion.title()} Vibes",
            description=f"Curated playlist for your {request.emotion} mood",
            track_count=request.track_count,
            duration_target_minutes=request.duration_minutes,
            energy_curve=request.energy_curve,
            include_previews=request.include_previews,
            mood_transitions=True
        )
        
        # Create recommendation context
        context = RecommendationContext(
            current_emotion=emotion_analyzer.analyze_emotion_profile(
                request.emotion, request.intensity, request.confidence
            ),
            time_of_day=request.time_of_day,
            day_of_week=datetime.now().strftime("%A").lower(),
            weather=request.weather,
            activity=request.activity
        )
        
        # Generate playlist
        playlist = await mood_playlist_generator.generate_mood_playlist(
            emotion=request.emotion,
            intensity=request.intensity,
            confidence=request.confidence,
            config=config,
            context=context
        )
        
        return {
            "playlist": {
                "playlist_id": playlist.playlist_id,
                "name": playlist.name,
                "description": playlist.description,
                "emotion": playlist.emotion,
                "intensity": playlist.intensity,
                "tracks": [
                    {
                        "track_id": track.track_id,
                        "name": track.track_name,
                        "artist": track.artist_name,
                        "album": track.album_name,
                        "match_score": track.match_score,
                        "preview_url": track.preview_url,
                        "spotify_url": track.spotify_url,
                        "album_cover": track.album_cover,
                        "duration_ms": track.duration_ms,
                        "popularity": track.popularity,
                        "emotion_fit": track.emotion_fit
                    }
                    for track in playlist.tracks
                ],
                "total_duration_ms": playlist.total_duration_ms,
                "avg_match_score": playlist.avg_match_score,
                "energy_curve": playlist.energy_curve,
                "mood_transitions": playlist.mood_transitions,
                "cover_image": playlist.cover_image,
                "created_at": playlist.created_at.isoformat(),
                "expires_at": playlist.expires_at.isoformat() if playlist.expires_at else None,
                "tags": playlist.tags
            },
            "metadata": {
                "track_count": len(playlist.tracks),
                "total_duration_minutes": playlist.total_duration_ms / 60000,
                "energy_pattern": request.energy_curve,
                "context": {
                    "time_of_day": request.time_of_day,
                    "activity": request.activity,
                    "weather": request.weather
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating mood playlist: {e}")
        raise HTTPException(status_code=500, detail=f"Playlist generation failed: {str(e)}")

@router.post("/playlist/contextual")
async def generate_contextual_playlist(request: PlaylistRequest):
    """
    Generate playlist based on context (time, activity, weather).
    
    Args:
        request: Contextual playlist request
        
    Returns:
        Context-aware playlist
    """
    try:
        logger.info(f"🎧 Generating contextual playlist for {request.emotion}")
        
        # Generate contextual playlist
        playlist = await mood_playlist_generator.generate_contextual_playlist(
            emotion=request.emotion,
            intensity=request.intensity,
            time_of_day=request.time_of_day,
            activity=request.activity,
            weather=request.weather,
            duration_minutes=request.duration_minutes
        )
        
        return {
            "playlist": {
                "playlist_id": playlist.playlist_id,
                "name": playlist.name,
                "description": playlist.description,
                "emotion": playlist.emotion,
                "intensity": playlist.intensity,
                "tracks": [
                    {
                        "track_id": track.track_id,
                        "name": track.track_name,
                        "artist": track.artist_name,
                        "album": track.album_name,
                        "match_score": track.match_score,
                        "preview_url": track.preview_url,
                        "spotify_url": track.spotify_url,
                        "album_cover": track.album_cover,
                        "duration_ms": track.duration_ms,
                        "popularity": track.popularity
                    }
                    for track in playlist.tracks
                ],
                "total_duration_ms": playlist.total_duration_ms,
                "avg_match_score": playlist.avg_match_score,
                "energy_curve": playlist.energy_curve,
                "mood_transitions": playlist.mood_transitions,
                "cover_image": playlist.cover_image,
                "created_at": playlist.created_at.isoformat(),
                "expires_at": playlist.expires_at.isoformat() if playlist.expires_at else None,
                "tags": playlist.tags
            },
            "context": {
                "time_of_day": request.time_of_day,
                "activity": request.activity,
                "weather": request.weather,
                "duration_minutes": request.duration_minutes
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating contextual playlist: {e}")
        raise HTTPException(status_code=500, detail=f"Contextual playlist generation failed: {str(e)}")

@router.post("/playlist/transition")
async def generate_emotion_transition_playlist(request: EmotionTransitionRequest):
    """
    Generate playlist that transitions from one emotion to another.
    
    Args:
        request: Emotion transition request
        
    Returns:
        Transition playlist
    """
    try:
        logger.info(f"🎭 Generating transition playlist: {request.from_emotion} → {request.to_emotion}")
        
        # Generate transition playlist
        playlist = await mood_playlist_generator.generate_emotion_transition_playlist(
            from_emotion=request.from_emotion,
            to_emotion=request.to_emotion,
            intensity=request.intensity,
            transition_duration_minutes=request.transition_duration_minutes
        )
        
        return {
            "playlist": {
                "playlist_id": playlist.playlist_id,
                "name": playlist.name,
                "description": playlist.description,
                "emotion": playlist.emotion,
                "intensity": playlist.intensity,
                "tracks": [
                    {
                        "track_id": track.track_id,
                        "name": track.track_name,
                        "artist": track.artist_name,
                        "album": track.album_name,
                        "match_score": track.match_score,
                        "preview_url": track.preview_url,
                        "spotify_url": track.spotify_url,
                        "album_cover": track.album_cover,
                        "duration_ms": track.duration_ms,
                        "popularity": track.popularity
                    }
                    for track in playlist.tracks
                ],
                "total_duration_ms": playlist.total_duration_ms,
                "avg_match_score": playlist.avg_match_score,
                "energy_curve": playlist.energy_curve,
                "mood_transitions": playlist.mood_transitions,
                "cover_image": playlist.cover_image,
                "created_at": playlist.created_at.isoformat(),
                "expires_at": playlist.expires_at.isoformat() if playlist.expires_at else None,
                "tags": playlist.tags
            },
            "transition": {
                "from_emotion": request.from_emotion,
                "to_emotion": request.to_emotion,
                "duration_minutes": request.transition_duration_minutes,
                "transition_type": "emotion_journey"
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating transition playlist: {e}")
        raise HTTPException(status_code=500, detail=f"Transition playlist generation failed: {str(e)}")

@router.get("/smart-recommendations")
async def get_smart_recommendations(
    emotion: str = Query(..., description="Detected emotion"),
    intensity: float = Query(0.7, ge=0.0, le=1.0, description="Emotion intensity"),
    confidence: float = Query(0.8, ge=0.0, le=1.0, description="Detection confidence"),
    time_of_day: Optional[str] = Query(None, description="Time of day context"),
    activity: Optional[str] = Query(None, description="Activity context"),
    limit: int = Query(15, ge=1, le=50, description="Number of recommendations")
):
    """
    Get smart recommendations with simplified parameters.
    
    Args:
        emotion: Detected emotion
        intensity: Emotion intensity (0.0 to 1.0)
        confidence: Detection confidence (0.0 to 1.0)
        time_of_day: Optional time context
        activity: Optional activity context
        limit: Number of recommendations
        
    Returns:
        Smart recommendations with context
    """
    try:
        logger.info(f"🤖 Getting smart recommendations for emotion: {emotion}")
        
        # Get smart recommendations
        result = await recommendation_engine.get_smart_recommendations(
            emotion=emotion,
            intensity=intensity,
            confidence=confidence,
            time_of_day=time_of_day,
            activity=activity,
            limit=limit
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting smart recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Smart recommendations failed: {str(e)}")

@router.get("/emotions")
async def get_supported_emotions():
    """
    Get list of supported emotions for recommendations.
    
    Returns:
        List of supported emotions with descriptions
    """
    emotions = [
        {"emotion": "happy", "description": "Joyful, upbeat, positive mood", "energy": "high", "valence": "positive"},
        {"emotion": "sad", "description": "Melancholic, reflective, emotional mood", "energy": "low", "valence": "negative"},
        {"emotion": "angry", "description": "Intense, cathartic, powerful mood", "energy": "high", "valence": "negative"},
        {"emotion": "calm", "description": "Peaceful, relaxing, serene mood", "energy": "low", "valence": "positive"},
        {"emotion": "energetic", "description": "Dynamic, motivating, high-energy mood", "energy": "high", "valence": "positive"},
        {"emotion": "romantic", "description": "Intimate, passionate, loving mood", "energy": "medium", "valence": "positive"},
        {"emotion": "nostalgic", "description": "Timeless, memory-evoking, reflective mood", "energy": "medium", "valence": "neutral"},
        {"emotion": "anxious", "description": "Contemplative, grounding, mindful mood", "energy": "medium", "valence": "neutral"},
        {"emotion": "focused", "description": "Concentrated, productive, attentive mood", "energy": "medium", "valence": "neutral"},
        {"emotion": "neutral", "description": "Balanced, versatile, steady mood", "energy": "medium", "valence": "neutral"}
    ]
    
    return {
        "supported_emotions": emotions,
        "total_count": len(emotions),
        "usage_notes": {
            "intensity": "Range from 0.0 (subtle) to 1.0 (intense)",
            "confidence": "Range from 0.0 (uncertain) to 1.0 (very confident)",
            "context": "Optional time_of_day, activity, and weather parameters enhance recommendations"
        }
    }

@router.get("/health")
async def emotion_recommendations_health():
    """
    Health check for emotion recommendation services.
    
    Returns:
        Service health status
    """
    try:
        # Test basic functionality
        test_profile = emotion_analyzer.analyze_emotion_profile("happy", 0.7, 0.8)
        
        return {
            "status": "healthy",
            "services": {
                "emotion_analyzer": "operational",
                "spotify_matcher": "operational",
                "recommendation_engine": "operational",
                "playlist_generator": "operational"
            },
            "test_emotion_profile": {
                "primary_emotion": test_profile.primary_emotion.value,
                "intensity": test_profile.intensity,
                "confidence": test_profile.confidence
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )
