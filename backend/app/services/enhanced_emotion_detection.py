"""
Enhanced emotion detection service with Whisper + LLM + fallback.
Handles voice recording, transcription, and robust emotion analysis.
"""
import os
import io
import json
import logging
import re
import tempfile
from typing import Dict, Any, Optional, Tuple
from pathlib import Path

import openai
import whisper
import ffmpeg
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class EmotionResult(BaseModel):
    """Structured emotion detection result."""
    emotion: str = Field(..., description="Detected emotion")
    intensity: float = Field(..., ge=0.0, le=1.0, description="Emotion intensity")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence")
    method: str = Field(..., description="Detection method used")
    transcription: Optional[str] = Field(None, description="Transcribed text")
    raw_llm_output: Optional[str] = Field(None, description="Raw LLM response")

class EnhancedEmotionDetectionService:
    """Enhanced emotion detection with multiple fallback methods."""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.whisper_model = None
        self._load_whisper_model()
        
        # Emotion categories for validation
        self.valid_emotions = {
            "happy", "sad", "angry", "calm", "energetic", 
            "romantic", "nostalgic", "anxious", "neutral"
        }
        
        # LLM prompt for emotion detection
        self.emotion_prompt = """
You are an expert emotion detection AI. Analyze the transcribed text and determine the speaker's emotional state.

Return ONLY a valid JSON object with this exact structure:
{
    "emotion": "<one of: happy,sad,angry,calm,energetic,romantic,nostalgic,anxious,neutral>",
    "intensity": <float between 0.0 and 1.0>,
    "confidence": <float between 0.0 and 1.0>
}

Guidelines:
- emotion: Choose the most prominent emotion from the valid list
- intensity: How strong the emotion is (0.0 = barely present, 1.0 = very strong)
- confidence: How confident you are in this assessment (0.0 = uncertain, 1.0 = very confident)

Text to analyze: "{text}"

JSON Response:"""

    def _load_whisper_model(self):
        """Load Whisper model for transcription."""
        try:
            logger.info("Loading Whisper model...")
            self.whisper_model = whisper.load_model("base")
            logger.info("✅ Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load Whisper model: {e}")
            self.whisper_model = None

    async def detect_emotion_from_voice(
        self, 
        audio_file: bytes, 
        filename: str,
        user_id: Optional[int] = None
    ) -> EmotionResult:
        """
        Detect emotion from voice recording with full pipeline.
        
        Args:
            audio_file: Raw audio file bytes
            filename: Original filename with extension
            user_id: Optional user ID for logging
            
        Returns:
            EmotionResult with detected emotion and metadata
        """
        logger.info(f"🎤 Processing voice emotion detection for user {user_id}")
        
        try:
            # Step 1: Convert audio to WAV if needed
            wav_data = await self._convert_audio_to_wav(audio_file, filename)
            
            # Step 2: Transcribe using Whisper
            transcription = await self._transcribe_audio(wav_data)
            logger.info(f"📝 Transcription: {transcription[:100]}...")
            
            if not transcription.strip():
                logger.warning("⚠️  Empty transcription, falling back to acoustic analysis")
                return await self._fallback_acoustic_analysis(wav_data, user_id)
            
            # Step 3: Analyze emotion using LLM
            llm_result = await self._analyze_emotion_with_llm(transcription)
            
            # Step 4: Validate and parse LLM output
            parsed_result = self._parse_llm_emotion_result(llm_result, transcription)
            
            # Step 5: Apply fallback if confidence is low
            if parsed_result.confidence < 0.6:
                logger.info(f"🔄 Low LLM confidence ({parsed_result.confidence}), applying acoustic fallback")
                acoustic_result = await self._fallback_acoustic_analysis(wav_data, user_id)
                
                # Combine results with weighted average
                final_result = self._combine_results(parsed_result, acoustic_result)
                logger.info(f"🎯 Final emotion: {final_result.emotion} (confidence: {final_result.confidence:.2f})")
                return final_result
            
            logger.info(f"✅ Emotion detected: {parsed_result.emotion} (confidence: {parsed_result.confidence:.2f})")
            return parsed_result
            
        except Exception as e:
            logger.error(f"❌ Error in emotion detection pipeline: {e}")
            # Return neutral emotion as fallback
            return EmotionResult(
                emotion="neutral",
                intensity=0.5,
                confidence=0.3,
                method="error_fallback",
                transcription="",
                raw_llm_output=f"Error: {str(e)}"
            )

    async def _convert_audio_to_wav(self, audio_data: bytes, filename: str) -> bytes:
        """Convert audio file to WAV format using ffmpeg."""
        logger.info(f"🔄 Converting audio file: {filename}")
        
        # Check if already WAV
        if filename.lower().endswith('.wav'):
            logger.info("✅ Audio is already in WAV format")
            return audio_data
        
        try:
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix=Path(filename).suffix, delete=False) as input_file:
                input_file.write(audio_data)
                input_path = input_file.name
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as output_file:
                output_path = output_file.name
            
            # Convert using ffmpeg
            (
                ffmpeg
                .input(input_path)
                .output(output_path, acodec='pcm_s16le', ar=16000, ac=1)
                .overwrite_output()
                .run(quiet=True)
            )
            
            # Read converted audio
            with open(output_path, 'rb') as f:
                wav_data = f.read()
            
            # Cleanup
            os.unlink(input_path)
            os.unlink(output_path)
            
            logger.info("✅ Audio converted to WAV successfully")
            return wav_data
            
        except Exception as e:
            logger.error(f"❌ Audio conversion failed: {e}")
            # Try to use original audio data
            return audio_data

    async def _transcribe_audio(self, wav_data: bytes) -> str:
        """Transcribe audio using Whisper."""
        if not self.whisper_model:
            raise Exception("Whisper model not loaded")
        
        try:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(wav_data)
                temp_path = temp_file.name
            
            # Transcribe
            result = self.whisper_model.transcribe(temp_path)
            transcription = result["text"].strip()
            
            # Cleanup
            os.unlink(temp_path)
            
            return transcription
            
        except Exception as e:
            logger.error(f"❌ Transcription failed: {e}")
            return ""

    async def _analyze_emotion_with_llm(self, text: str) -> str:
        """Analyze emotion using OpenAI LLM with structured output."""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert emotion detection AI. Always respond with valid JSON only."},
                    {"role": "user", "content": self.emotion_prompt.format(text=text)}
                ],
                temperature=0.3,
                max_tokens=150
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"❌ LLM emotion analysis failed: {e}")
            return ""

    def _parse_llm_emotion_result(self, llm_output: str, transcription: str) -> EmotionResult:
        """Parse and validate LLM emotion detection result."""
        logger.info(f"🔍 Parsing LLM output: {llm_output[:100]}...")
        
        try:
            # Try direct JSON parsing first
            try:
                data = json.loads(llm_output)
            except json.JSONDecodeError:
                # Try to extract JSON using regex
                json_match = re.search(r'\{[^}]*\}', llm_output)
                if json_match:
                    data = json.loads(json_match.group())
                else:
                    raise ValueError("No valid JSON found in LLM output")
            
            # Validate emotion
            emotion = data.get("emotion", "").lower()
            if emotion not in self.valid_emotions:
                logger.warning(f"⚠️  Invalid emotion '{emotion}', defaulting to 'neutral'")
                emotion = "neutral"
            
            # Validate and clamp values
            intensity = max(0.0, min(1.0, float(data.get("intensity", 0.5))))
            confidence = max(0.0, min(1.0, float(data.get("confidence", 0.5))))
            
            return EmotionResult(
                emotion=emotion,
                intensity=intensity,
                confidence=confidence,
                method="llm_analysis",
                transcription=transcription,
                raw_llm_output=llm_output
            )
            
        except Exception as e:
            logger.error(f"❌ Failed to parse LLM result: {e}")
            # Return neutral fallback
            return EmotionResult(
                emotion="neutral",
                intensity=0.5,
                confidence=0.3,
                method="llm_parse_error",
                transcription=transcription,
                raw_llm_output=llm_output
            )

    async def _fallback_acoustic_analysis(self, wav_data: bytes, user_id: Optional[int] = None) -> EmotionResult:
        """Fallback acoustic emotion analysis (placeholder for wav2vec2 implementation)."""
        logger.info(f"🎵 Running acoustic emotion analysis fallback")
        
        # Placeholder implementation - in production, this would use wav2vec2
        # For now, return a neutral result with moderate confidence
        return EmotionResult(
            emotion="neutral",
            intensity=0.5,
            confidence=0.4,
            method="acoustic_fallback",
            transcription="",
            raw_llm_output="Acoustic analysis placeholder"
        )

    def _combine_results(self, llm_result: EmotionResult, acoustic_result: EmotionResult) -> EmotionResult:
        """Combine LLM and acoustic analysis results with weighted average."""
        # Weight LLM more heavily if it has higher confidence
        llm_weight = llm_result.confidence
        acoustic_weight = acoustic_result.confidence * 0.7  # Slightly reduce acoustic weight
        
        total_weight = llm_weight + acoustic_weight
        
        if total_weight == 0:
            # Both failed, return neutral
            return EmotionResult(
                emotion="neutral",
                intensity=0.5,
                confidence=0.3,
                method="combined_fallback",
                transcription=llm_result.transcription,
                raw_llm_output=f"Combined: LLM({llm_result.raw_llm_output}) + Acoustic"
            )
        
        # Weighted average of intensities
        combined_intensity = (
            (llm_result.intensity * llm_weight + acoustic_result.intensity * acoustic_weight) 
            / total_weight
        )
        
        # Use LLM emotion if it has higher confidence, otherwise acoustic
        if llm_weight >= acoustic_weight:
            combined_emotion = llm_result.emotion
        else:
            combined_emotion = acoustic_result.emotion
        
        # Combined confidence (slightly lower than max to reflect uncertainty)
        combined_confidence = min(0.9, (llm_weight + acoustic_weight) / 2)
        
        return EmotionResult(
            emotion=combined_emotion,
            intensity=combined_intensity,
            confidence=combined_confidence,
            method="combined_analysis",
            transcription=llm_result.transcription,
            raw_llm_output=f"Combined: LLM({llm_result.raw_llm_output}) + Acoustic"
        )

# Global instance
enhanced_emotion_service = EnhancedEmotionDetectionService()
