"""
Enhanced emotion detection router with voice recording support.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import logging

from app.services.enhanced_emotion_detection import enhanced_emotion_service, EmotionResult
from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/detect-voice", response_model=Dict[str, Any])
async def detect_emotion_from_voice(
    audio_file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
):
    """
    Detect emotion from voice recording with full pipeline.
    Supports WebM, WAV, and other audio formats.
    """
    try:
        logger.info(f"🎤 Received voice emotion detection request from user {user_id}")
        
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
        
        # Process with enhanced emotion detection
        result = await enhanced_emotion_service.detect_emotion_from_voice(
            audio_data, 
            audio_file.filename or "audio.webm",
            user_id
        )
        
        # Return structured response
        response_data = {
            "emotion": result.emotion,
            "intensity": result.intensity,
            "confidence": result.confidence,
            "method": result.method,
            "transcription": result.transcription,
            "metadata": {
                "file_size": len(audio_data),
                "content_type": audio_file.content_type,
                "filename": audio_file.filename,
                "user_id": user_id
            }
        }
        
        logger.info(f"✅ Emotion detection completed: {result.emotion} (confidence: {result.confidence:.2f})")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in voice emotion detection: {e}")
        raise HTTPException(status_code=500, detail=f"Emotion detection failed: {str(e)}")

@router.post("/detect-text", response_model=Dict[str, Any])
async def detect_emotion_from_text(
    text: str = Form(...),
    user_id: Optional[str] = Form(None)
):
    """
    Detect emotion from text input using LLM analysis.
    """
    try:
        logger.info(f"📝 Received text emotion detection request: '{text[:50]}...'")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Analyze emotion using LLM
        llm_result = await enhanced_emotion_service._analyze_emotion_with_llm(text)
        
        # Parse LLM result
        result = enhanced_emotion_service._parse_llm_emotion_result(llm_result, text)
        
        response_data = {
            "emotion": result.emotion,
            "intensity": result.intensity,
            "confidence": result.confidence,
            "method": result.method,
            "text": text,
            "metadata": {
                "user_id": user_id,
                "text_length": len(text)
            }
        }
        
        logger.info(f"✅ Text emotion detection completed: {result.emotion} (confidence: {result.confidence:.2f})")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in text emotion detection: {e}")
        raise HTTPException(status_code=500, detail=f"Emotion detection failed: {str(e)}")

@router.get("/health")
async def emotion_service_health():
    """Check emotion detection service health."""
    try:
        # Check if Whisper model is loaded
        whisper_status = enhanced_emotion_service.whisper_model is not None
        
        # Check OpenAI API key
        openai_status = bool(enhanced_emotion_service.openai_client.api_key)
        
        return {
            "status": "healthy" if whisper_status and openai_status else "degraded",
            "whisper_model_loaded": whisper_status,
            "openai_configured": openai_status,
            "supported_emotions": list(enhanced_emotion_service.valid_emotions),
            "supported_formats": ["webm", "wav", "mp3", "m4a", "ogg"]
        }
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
