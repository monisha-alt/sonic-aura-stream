import openai
from typing import Dict, Any, Optional
from app.core.config import settings
import json
import re

class SongSummarizationService:
    def __init__(self):
        self.openai_client = None
        self._initialize_openai()
    
    def _initialize_openai(self):
        """Initialize OpenAI client"""
        try:
            if settings.OPENAI_API_KEY:
                openai.api_key = settings.OPENAI_API_KEY
                self.openai_client = openai
                print("OpenAI client initialized successfully")
            else:
                print("OpenAI API key not found")
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")
    
    async def generate_song_summary(
        self, 
        lyrics: str, 
        title: str, 
        artist: str,
        audio_features: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive song summary including mood, emotion, genre analysis
        """
        try:
            # Analyze lyrics for themes and emotions
            lyrics_analysis = await self._analyze_lyrics(lyrics, title, artist)
            
            # Analyze audio features if available
            audio_analysis = await self._analyze_audio_features(audio_features) if audio_features else {}
            
            # Generate overall summary
            overall_summary = await self._generate_overall_summary(
                lyrics_analysis, audio_analysis, title, artist
            )
            
            return {
                "summary": overall_summary,
                "lyrics_analysis": lyrics_analysis,
                "audio_analysis": audio_analysis,
                "mood": lyrics_analysis.get("primary_mood", "neutral"),
                "emotions": lyrics_analysis.get("emotions", []),
                "themes": lyrics_analysis.get("themes", []),
                "genre_suggestions": lyrics_analysis.get("genre_suggestions", []),
                "key_lyrics": lyrics_analysis.get("key_lyrics", []),
                "sentiment_score": lyrics_analysis.get("sentiment_score", 0.5)
            }
            
        except Exception as e:
            print(f"Error generating song summary: {e}")
            return {
                "summary": f"Analysis unavailable for {title} by {artist}",
                "error": str(e)
            }
    
    async def _analyze_lyrics(self, lyrics: str, title: str, artist: str) -> Dict[str, Any]:
        """Analyze lyrics for themes, emotions, and mood"""
        try:
            if not self.openai_client:
                return self._fallback_lyrics_analysis(lyrics)
            
            prompt = f"""
            Analyze the following song lyrics and provide a comprehensive analysis:
            
            Song: "{title}" by {artist}
            
            Lyrics:
            {lyrics}
            
            Please provide:
            1. Primary mood (happy, sad, angry, calm, energetic, romantic, etc.)
            2. List of emotions detected (with confidence scores)
            3. Main themes and topics
            4. Genre suggestions based on content
            5. Key impactful lyrics (2-3 lines)
            6. Overall sentiment score (0-1, where 0 is very negative, 1 is very positive)
            
            Format as JSON with these keys: primary_mood, emotions, themes, genre_suggestions, key_lyrics, sentiment_score
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7
            )
            
            analysis_text = response.choices[0].message.content
            
            # Try to parse JSON response
            try:
                return json.loads(analysis_text)
            except json.JSONDecodeError:
                # Fallback to text parsing
                return self._parse_text_analysis(analysis_text)
                
        except Exception as e:
            print(f"Error in lyrics analysis: {e}")
            return self._fallback_lyrics_analysis(lyrics)
    
    async def _analyze_audio_features(self, audio_features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze audio features to determine musical characteristics"""
        try:
            if not self.openai_client:
                return self._fallback_audio_analysis(audio_features)
            
            prompt = f"""
            Analyze these audio features and provide insights:
            
            Audio Features:
            - Valence: {audio_features.get('valence', 'N/A')} (0=negative, 1=positive)
            - Energy: {audio_features.get('energy', 'N/A')} (0=low, 1=high)
            - Danceability: {audio_features.get('danceability', 'N/A')} (0=not danceable, 1=very danceable)
            - Acousticness: {audio_features.get('acousticness', 'N/A')} (0=electronic, 1=acoustic)
            - Instrumentalness: {audio_features.get('instrumentalness', 'N/A')} (0=vocals, 1=instrumental)
            - Tempo: {audio_features.get('tempo', 'N/A')} BPM
            - Key: {audio_features.get('key', 'N/A')}
            - Mode: {audio_features.get('mode', 'N/A')} (0=minor, 1=major)
            
            Provide:
            1. Musical mood interpretation
            2. Genre characteristics
            3. Listening context suggestions
            4. Energy level description
            
            Format as JSON with keys: musical_mood, genre_characteristics, listening_context, energy_description
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.7
            )
            
            analysis_text = response.choices[0].message.content
            
            try:
                return json.loads(analysis_text)
            except json.JSONDecodeError:
                return self._parse_text_analysis(analysis_text)
                
        except Exception as e:
            print(f"Error in audio analysis: {e}")
            return self._fallback_audio_analysis(audio_features)
    
    async def _generate_overall_summary(
        self, 
        lyrics_analysis: Dict[str, Any], 
        audio_analysis: Dict[str, Any], 
        title: str, 
        artist: str
    ) -> str:
        """Generate an overall summary combining lyrics and audio analysis"""
        try:
            if not self.openai_client:
                return self._fallback_summary(lyrics_analysis, audio_analysis, title, artist)
            
            prompt = f"""
            Create a concise, engaging summary of the song "{title}" by {artist} based on this analysis:
            
            Lyrics Analysis:
            {json.dumps(lyrics_analysis, indent=2)}
            
            Audio Analysis:
            {json.dumps(audio_analysis, indent=2)}
            
            Write a 2-3 sentence summary that:
            1. Captures the essence and mood of the song
            2. Mentions key themes or emotions
            3. Suggests when/where to listen
            4. Is engaging and informative
            
            Keep it under 150 words and make it sound natural and appealing.
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.8
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating overall summary: {e}")
            return self._fallback_summary(lyrics_analysis, audio_analysis, title, artist)
    
    def _fallback_lyrics_analysis(self, lyrics: str) -> Dict[str, Any]:
        """Fallback lyrics analysis without AI"""
        # Simple keyword-based analysis
        positive_words = ["love", "happy", "joy", "beautiful", "amazing", "wonderful"]
        negative_words = ["sad", "pain", "hurt", "cry", "lonely", "dark"]
        energetic_words = ["fire", "energy", "power", "strong", "fight", "rise"]
        
        lyrics_lower = lyrics.lower()
        
        positive_score = sum(1 for word in positive_words if word in lyrics_lower)
        negative_score = sum(1 for word in negative_words if word in lyrics_lower)
        energetic_score = sum(1 for word in energetic_words if word in lyrics_lower)
        
        if positive_score > negative_score and positive_score > energetic_score:
            mood = "happy"
            sentiment = 0.7
        elif negative_score > positive_score and negative_score > energetic_score:
            mood = "sad"
            sentiment = 0.3
        elif energetic_score > 0:
            mood = "energetic"
            sentiment = 0.6
        else:
            mood = "neutral"
            sentiment = 0.5
        
        return {
            "primary_mood": mood,
            "emotions": [mood],
            "themes": ["general"],
            "genre_suggestions": ["pop"],
            "key_lyrics": lyrics.split('\n')[:2] if lyrics else [],
            "sentiment_score": sentiment
        }
    
    def _fallback_audio_analysis(self, audio_features: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback audio analysis without AI"""
        valence = audio_features.get('valence', 0.5)
        energy = audio_features.get('energy', 0.5)
        tempo = audio_features.get('tempo', 120)
        
        if valence > 0.7:
            musical_mood = "uplifting"
        elif valence < 0.3:
            musical_mood = "melancholic"
        else:
            musical_mood = "balanced"
        
        if energy > 0.7:
            energy_desc = "high energy"
        elif energy < 0.3:
            energy_desc = "low energy"
        else:
            energy_desc = "moderate energy"
        
        return {
            "musical_mood": musical_mood,
            "genre_characteristics": ["contemporary"],
            "listening_context": ["general"],
            "energy_description": energy_desc
        }
    
    def _fallback_summary(
        self, 
        lyrics_analysis: Dict[str, Any], 
        audio_analysis: Dict[str, Any], 
        title: str, 
        artist: str
    ) -> str:
        """Fallback summary without AI"""
        mood = lyrics_analysis.get('primary_mood', 'neutral')
        energy = audio_analysis.get('energy_description', 'moderate energy')
        
        return f"'{title}' by {artist} is a {mood} song with {energy}. The track combines thoughtful lyrics with engaging musical elements, making it suitable for various listening moments."
    
    def _parse_text_analysis(self, text: str) -> Dict[str, Any]:
        """Parse text analysis into structured format"""
        # Simple parsing of text analysis
        return {
            "primary_mood": "neutral",
            "emotions": ["neutral"],
            "themes": ["general"],
            "genre_suggestions": ["pop"],
            "key_lyrics": [],
            "sentiment_score": 0.5,
            "raw_analysis": text
        }

# Global instance
song_summarization_service = SongSummarizationService()
