"""
Voice Upload and Processing Router
Handles audio file uploads and processing for voice emotion detection
"""

import os
import logging
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import subprocess
from app.services.voice_analysis import voice_analysis_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["Voice Upload"])

# Create upload directory if it doesn't exist
UPLOAD_DIR = Path("backend/tmp_uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def check_ffmpeg_available() -> bool:
    """Check if ffmpeg is available on the system"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def convert_audio_with_ffmpeg(input_path: str, output_path: str) -> Dict[str, Any]:
    """Convert audio file to 16kHz mono WAV using ffmpeg"""
    try:
        # FFmpeg command to convert to 16kHz mono WAV
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-ar', '16000',  # Sample rate: 16kHz
            '-ac', '1',      # Mono
            '-acodec', 'pcm_s16le',  # 16-bit PCM
            '-y',            # Overwrite output file
            output_path
        ]
        
        logger.info(f"🔄 Converting audio with ffmpeg: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f"✅ Audio conversion successful: {output_path}")
            return {
                "success": True,
                "output_path": output_path,
                "message": "Audio converted to 16kHz mono WAV"
            }
        else:
            logger.error(f"❌ FFmpeg conversion failed: {result.stderr}")
            return {
                "success": False,
                "error": result.stderr,
                "message": "FFmpeg conversion failed"
            }
            
    except Exception as e:
        logger.error(f"❌ Exception during ffmpeg conversion: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "FFmpeg conversion exception"
        }

@router.post("/upload")
async def upload_voice_file(audio: UploadFile = File(...)):
    """Upload and process voice audio file"""
    request_id = str(uuid.uuid4())
    logger.info(f"🎤 [{request_id}] Processing voice upload: {audio.filename}")
    
    # Validate file type
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        logger.warning(f"⚠️ [{request_id}] Invalid file type: {audio.content_type}")
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        # Generate unique filename
        file_extension = Path(audio.filename or "audio").suffix or ".wav"
        unique_filename = f"{request_id}_{uuid.uuid4().hex[:8]}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        file_size = file_path.stat().st_size
        logger.info(f"📁 [{request_id}] File saved: {file_path} (size: {file_size} bytes)")
        
        # Check if ffmpeg is available
        ffmpeg_available = check_ffmpeg_available()
        
        response_data = {
            "request_id": request_id,
            "original_filename": audio.filename,
            "saved_path": str(file_path),
            "file_size": file_size,
            "content_type": audio.content_type,
            "ffmpeg_available": ffmpeg_available
        }
        
        # Convert audio if ffmpeg is available
        if ffmpeg_available:
            converted_filename = f"{request_id}_converted_{uuid.uuid4().hex[:8]}.wav"
            converted_path = UPLOAD_DIR / converted_filename
            
            conversion_result = convert_audio_with_ffmpeg(str(file_path), str(converted_path))
            
            response_data.update({
                "converted": conversion_result["success"],
                "converted_path": str(converted_path) if conversion_result["success"] else None,
                "conversion_message": conversion_result["message"]
            })
            
            if not conversion_result["success"]:
                response_data["conversion_warning"] = conversion_result["error"]
        else:
            response_data.update({
                "converted": False,
                "conversion_warning": "FFmpeg not available. Audio file saved without conversion."
            })
        
        logger.info(f"✅ [{request_id}] Voice upload processing completed")
        
        return JSONResponse(content=response_data)
    except Exception as e:
        logger.error(f"❌ [{request_id}] Error processing voice upload: {e}")
        
        # Clean up file if it was created
        try:
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
        except Exception:
            pass
        
        raise HTTPException(status_code=500, detail=f"Voice upload processing failed: {str(e)}")

@router.post("/analyze")
async def analyze_voice_emotion(audio: UploadFile = File(...)):
    """Upload and analyze voice emotion using enhanced AI pipeline"""
    request_id = str(uuid.uuid4())
    logger.info(f"🧠 [{request_id}] Starting enhanced voice emotion analysis: {audio.filename}")
    
    # Validate file type
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        # Generate unique filename
        file_extension = Path(audio.filename or "audio").suffix or ".wav"
        unique_filename = f"{request_id}_{uuid.uuid4().hex[:8]}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        file_size = file_path.stat().st_size
        logger.info(f"📁 [{request_id}] File saved: {file_path} (size: {file_size} bytes)")
        
        # Perform enhanced voice analysis
        analysis_result = await voice_analysis_service.analyze_voice_file(str(file_path))
        
        # Clean up file
        try:
            file_path.unlink()
            logger.info(f"🧹 [{request_id}] Cleaned up file: {file_path}")
        except Exception as cleanup_error:
            logger.warning(f"⚠️ [{request_id}] Failed to clean up file: {cleanup_error}")
        
        # Add file metadata to result
        analysis_result.update({
            "original_filename": audio.filename,
            "file_size": file_size,
            "content_type": audio.content_type
        })
        
        logger.info(f"✅ [{request_id}] Enhanced voice analysis completed")
        return JSONResponse(content=analysis_result)
        
    except Exception as e:
        logger.error(f"❌ [{request_id}] Enhanced voice analysis failed: {e}")
        
        # Clean up file if it was created
        try:
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")

@router.get("/upload/test")
async def test_voice_upload():
    """Test endpoint to verify voice upload functionality"""
    return {
        "message": "Voice upload endpoint is working",
        "upload_directory": str(UPLOAD_DIR),
        "directory_exists": UPLOAD_DIR.exists(),
        "ffmpeg_available": check_ffmpeg_available(),
        "supported_formats": ["wav", "mp3", "m4a", "ogg", "flac"]
    }

@router.delete("/upload/cleanup")
async def cleanup_uploaded_files():
    """Clean up old uploaded files (development endpoint)"""
    try:
        deleted_count = 0
        total_size = 0
        
        for file_path in UPLOAD_DIR.iterdir():
            if file_path.is_file():
                file_size = file_path.stat().st_size
                file_path.unlink()
                deleted_count += 1
                total_size += file_size
        
        logger.info(f"🧹 Cleaned up {deleted_count} files, freed {total_size} bytes")
        
        return {
            "message": f"Cleaned up {deleted_count} files",
            "files_deleted": deleted_count,
            "bytes_freed": total_size
        }
        
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")
