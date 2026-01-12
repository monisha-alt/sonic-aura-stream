from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict, Any
import json

from app.database import get_db
from app.services.emotion_detection import emotion_service
from app.models import EmotionDetection, User
from app.core.auth import get_current_user

router = APIRouter()

@router.post("/detect-voice")
async def detect_emotion_from_voice(
    audio_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detect emotion from voice input"""
    try:
        # Validate file type
        if not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an audio file"
            )
        
        # Read audio file
        audio_data = await audio_file.read()
        
        # Detect emotion
        emotion_result = await emotion_service.detect_emotion_from_audio(audio_data)
        
        # Store detection in database
        detection = EmotionDetection(
            user_id=current_user.id,
            emotion=emotion_result["emotion"],
            confidence=emotion_result["confidence"],
            input_type="voice",
            context_data=emotion_result
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)
        
        return {
            "emotion": emotion_result["emotion"],
            "confidence": emotion_result["confidence"],
            "detection_id": detection.id,
            "context": emotion_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-text")
async def detect_emotion_from_text(
    text: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detect emotion from text input"""
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Detect emotion
        emotion_result = await emotion_service.detect_emotion_from_text(text)
        
        # Store detection in database
        detection = EmotionDetection(
            user_id=current_user.id,
            emotion=emotion_result["emotion"],
            confidence=emotion_result["confidence"],
            input_type="text",
            context_data=emotion_result
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)
        
        return {
            "emotion": emotion_result["emotion"],
            "confidence": emotion_result["confidence"],
            "detection_id": detection.id,
            "context": emotion_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_emotion_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get user's emotion detection history"""
    try:
        detections = db.query(EmotionDetection)\
            .filter(EmotionDetection.user_id == current_user.id)\
            .order_by(EmotionDetection.created_at.desc())\
            .limit(limit)\
            .all()
        
        return {
            "detections": [
                {
                    "id": detection.id,
                    "emotion": detection.emotion,
                    "confidence": detection.confidence,
                    "input_type": detection.input_type,
                    "context_data": detection.context_data,
                    "created_at": detection.created_at
                }
                for detection in detections
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_emotion_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's emotion statistics"""
    try:
        detections = db.query(EmotionDetection)\
            .filter(EmotionDetection.user_id == current_user.id)\
            .all()
        
        if not detections:
            return {"stats": {}}
        
        # Calculate emotion frequency
        emotion_counts = {}
        total_confidence = 0
        
        for detection in detections:
            emotion = detection.emotion
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            total_confidence += detection.confidence
        
        # Find most common emotion
        most_common_emotion = max(emotion_counts, key=emotion_counts.get)
        avg_confidence = total_confidence / len(detections)
        
        return {
            "stats": {
                "total_detections": len(detections),
                "most_common_emotion": most_common_emotion,
                "emotion_distribution": emotion_counts,
                "average_confidence": round(avg_confidence, 3),
                "emotions_detected": list(emotion_counts.keys())
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
