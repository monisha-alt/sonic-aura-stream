"""
Feedback Router
Handles user feedback and analytics
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.database.database_service import db_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["Feedback"])

class FeedbackRequest(BaseModel):
    user_id: str
    song_id: str
    song_name: Optional[str] = None
    artist_name: Optional[str] = None
    emotion: Optional[str] = None
    intensity: Optional[int] = None
    comment: Optional[str] = None
    rating: Optional[int] = None

class EmotionHistoryRequest(BaseModel):
    user_id: str
    emotion: str
    confidence: float
    intensity: Optional[int] = None
    source: str = 'voice'
    audio_file_path: Optional[str] = None
    transcription: Optional[str] = None

@router.post("/submit")
async def submit_feedback(feedback: FeedbackRequest):
    """Submit user feedback for a song"""
    try:
        success = db_service.add_feedback(
            user_id=feedback.user_id,
            song_id=feedback.song_id,
            song_name=feedback.song_name,
            artist_name=feedback.artist_name,
            emotion=feedback.emotion,
            intensity=feedback.intensity,
            comment=feedback.comment,
            rating=feedback.rating
        )
        
        if success:
            return {
                "message": "Feedback submitted successfully",
                "timestamp": datetime.now().isoformat(),
                "success": True
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to submit feedback")
            
    except Exception as e:
        logger.error(f"❌ Feedback submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/emotion")
async def log_emotion(emotion_data: EmotionHistoryRequest):
    """Log emotion detection event"""
    try:
        success = db_service.add_emotion_history(
            user_id=emotion_data.user_id,
            emotion=emotion_data.emotion,
            confidence=emotion_data.confidence,
            intensity=emotion_data.intensity,
            source=emotion_data.source,
            audio_file_path=emotion_data.audio_file_path,
            transcription=emotion_data.transcription
        )
        
        if success:
            return {
                "message": "Emotion logged successfully",
                "timestamp": datetime.now().isoformat(),
                "success": True
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to log emotion")
            
    except Exception as e:
        logger.error(f"❌ Emotion logging error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/emotion-history/{user_id}")
async def get_emotion_history(user_id: str, limit: int = 50):
    """Get user's emotion history"""
    try:
        emotions = db_service.get_user_emotion_history(user_id, limit)
        
        return {
            "user_id": user_id,
            "emotions": emotions,
            "total": len(emotions),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting emotion history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get user statistics and insights"""
    try:
        emotions = db_service.get_user_emotion_history(user_id, 100)
        
        if not emotions:
            return {
                "user_id": user_id,
                "message": "No data available",
                "stats": {}
            }
        
        # Calculate statistics
        emotion_counts = {}
        total_confidence = 0
        total_intensity = 0
        intensity_count = 0
        
        for emotion in emotions:
            # Count emotions
            emotion_name = emotion['emotion']
            emotion_counts[emotion_name] = emotion_counts.get(emotion_name, 0) + 1
            
            # Calculate averages
            if emotion['confidence']:
                total_confidence += emotion['confidence']
            if emotion['intensity']:
                total_intensity += emotion['intensity']
                intensity_count += 1
        
        # Find most common emotion
        most_common_emotion = max(emotion_counts.items(), key=lambda x: x[1]) if emotion_counts else ("neutral", 0)
        
        stats = {
            "total_emotions": len(emotions),
            "emotion_distribution": emotion_counts,
            "most_common_emotion": {
                "emotion": most_common_emotion[0],
                "count": most_common_emotion[1]
            },
            "average_confidence": total_confidence / len(emotions) if emotions else 0,
            "average_intensity": total_intensity / intensity_count if intensity_count > 0 else 0,
            "recent_emotions": emotions[:10]  # Last 10 emotions
        }
        
        return {
            "user_id": user_id,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def feedback_health():
    """Health check for feedback service"""
    return {
        "service": "feedback",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
