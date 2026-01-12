from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.services.recommendation_service import recommendation_service
from app.models import Recommendation, User, Song
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/emotion-based")
async def get_emotion_recommendations(
    emotion: str = Query(..., description="Detected emotion"),
    confidence: float = Query(0.5, ge=0.0, le=1.0, description="Confidence score"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get song recommendations based on detected emotion"""
    try:
        # Get recommendations from service
        recommendations_result = await recommendation_service.get_emotion_based_recommendations(
            emotion, confidence
        )
        
        # Store recommendations in database
        for rec in recommendations_result.get("recommendations", []):
            # Check if song exists in database
            existing_song = db.query(Song).filter(Song.spotify_id == rec["id"]).first()
            
            if existing_song:
                recommendation = Recommendation(
                    user_id=current_user.id,
                    song_id=existing_song.id,
                    recommendation_type="emotion",
                    confidence_score=confidence,
                    context_data={
                        "emotion": emotion,
                        "recommendation_service_data": recommendations_result
                    }
                )
                db.add(recommendation)
        
        db.commit()
        
        return {
            "recommendations": recommendations_result.get("recommendations", []),
            "context": recommendations_result.get("emotion_context", {}),
            "emotion": emotion,
            "confidence": confidence
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather-based")
async def get_weather_recommendations(
    location: str = Query(..., description="Location for weather data"),
    emotion: Optional[str] = Query(None, description="Additional emotion filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get song recommendations based on weather and location"""
    try:
        # Get recommendations from service
        recommendations_result = await recommendation_service.get_weather_based_recommendations(
            location, emotion
        )
        
        # Store recommendations in database
        for rec in recommendations_result.get("recommendations", []):
            existing_song = db.query(Song).filter(Song.spotify_id == rec["id"]).first()
            
            if existing_song:
                recommendation = Recommendation(
                    user_id=current_user.id,
                    song_id=existing_song.id,
                    recommendation_type="weather",
                    confidence_score=0.8,
                    context_data={
                        "location": location,
                        "weather_context": recommendations_result.get("weather_context", {}),
                        "recommendation_service_data": recommendations_result
                    }
                )
                db.add(recommendation)
        
        db.commit()
        
        return {
            "recommendations": recommendations_result.get("recommendations", []),
            "weather_context": recommendations_result.get("weather_context", {}),
            "location": location
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time-based")
async def get_time_recommendations(
    hour: int = Query(..., ge=0, le=23, description="Current hour (0-23)"),
    day_of_week: Optional[int] = Query(None, ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get song recommendations based on time of day"""
    try:
        # Get recommendations from service
        recommendations_result = await recommendation_service.get_time_based_recommendations(
            hour, day_of_week
        )
        
        # Store recommendations in database
        for rec in recommendations_result.get("recommendations", []):
            existing_song = db.query(Song).filter(Song.spotify_id == rec["id"]).first()
            
            if existing_song:
                recommendation = Recommendation(
                    user_id=current_user.id,
                    song_id=existing_song.id,
                    recommendation_type="time",
                    confidence_score=0.7,
                    context_data={
                        "hour": hour,
                        "day_of_week": day_of_week,
                        "time_context": recommendations_result.get("time_context", {}),
                        "recommendation_service_data": recommendations_result
                    }
                )
                db.add(recommendation)
        
        db.commit()
        
        return {
            "recommendations": recommendations_result.get("recommendations", []),
            "time_context": recommendations_result.get("time_context", {}),
            "hour": hour,
            "day_of_week": day_of_week
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calendar-based")
async def get_calendar_recommendations(
    calendar_events: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get song recommendations based on calendar events"""
    try:
        # Get recommendations from service
        recommendations_result = await recommendation_service.get_calendar_based_recommendations(
            calendar_events
        )
        
        # Store recommendations in database
        for rec in recommendations_result.get("recommendations", []):
            existing_song = db.query(Song).filter(Song.spotify_id == rec["id"]).first()
            
            if existing_song:
                recommendation = Recommendation(
                    user_id=current_user.id,
                    song_id=existing_song.id,
                    recommendation_type="calendar",
                    confidence_score=0.8,
                    context_data={
                        "events_count": len(calendar_events),
                        "calendar_context": recommendations_result.get("calendar_context", {}),
                        "recommendation_service_data": recommendations_result
                    }
                )
                db.add(recommendation)
        
        db.commit()
        
        return {
            "recommendations": recommendations_result.get("recommendations", []),
            "calendar_context": recommendations_result.get("calendar_context", {}),
            "events_count": len(calendar_events)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/personalized")
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=50)
):
    """Get personalized recommendations based on user history and preferences"""
    try:
        # Get user's recent recommendations
        recent_recommendations = db.query(Recommendation)\
            .filter(Recommendation.user_id == current_user.id)\
            .order_by(Recommendation.created_at.desc())\
            .limit(50)\
            .all()
        
        # Analyze user preferences
        user_preferences = _analyze_user_preferences(recent_recommendations)
        
        # Get recommendations based on preferences
        if user_preferences.get("preferred_emotions"):
            emotion = user_preferences["preferred_emotions"][0]
            recommendations_result = await recommendation_service.get_emotion_based_recommendations(
                emotion, 0.8
            )
        else:
            # Default to time-based recommendations
            from datetime import datetime
            current_hour = datetime.now().hour
            recommendations_result = await recommendation_service.get_time_based_recommendations(
                current_hour
            )
        
        # Filter and limit results
        recommendations = recommendations_result.get("recommendations", [])[:limit]
        
        return {
            "recommendations": recommendations,
            "user_preferences": user_preferences,
            "total_recommendations": len(recommendations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100)
):
    """Get user's recommendation history"""
    try:
        recommendations = db.query(Recommendation)\
            .filter(Recommendation.user_id == current_user.id)\
            .order_by(Recommendation.created_at.desc())\
            .limit(limit)\
            .all()
        
        return {
            "recommendations": [
                {
                    "id": rec.id,
                    "song_id": rec.song_id,
                    "recommendation_type": rec.recommendation_type,
                    "confidence_score": rec.confidence_score,
                    "context_data": rec.context_data,
                    "created_at": rec.created_at
                }
                for rec in recommendations
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _analyze_user_preferences(recommendations: List[Recommendation]) -> Dict[str, Any]:
    """Analyze user preferences from recommendation history"""
    if not recommendations:
        return {}
    
    # Count recommendation types
    type_counts = {}
    emotion_counts = {}
    
    for rec in recommendations:
        # Count types
        rec_type = rec.recommendation_type
        type_counts[rec_type] = type_counts.get(rec_type, 0) + 1
        
        # Count emotions from context
        if rec.context_data and "emotion" in rec.context_data:
            emotion = rec.context_data["emotion"]
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Get most common types and emotions
    preferred_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
    preferred_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "preferred_types": [t[0] for t in preferred_types],
        "preferred_emotions": [e[0] for e in preferred_emotions],
        "total_recommendations": len(recommendations),
        "type_distribution": type_counts,
        "emotion_distribution": emotion_counts
    }
