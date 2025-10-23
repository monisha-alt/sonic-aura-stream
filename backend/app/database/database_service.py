"""
Database Service
Handles database operations for production deployment
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, Dict, Any, List
from contextlib import contextmanager

from .models_production import Base, User, Feedback, EmotionHistory, PlaylistHistory, PlaylistSong, UserPreferences, Analytics

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database connection"""
        try:
            database_url = os.getenv('DATABASE_URL')
            if not database_url:
                logger.warning("⚠️ DATABASE_URL not configured, using SQLite fallback")
                database_url = "sqlite:///./aura_music.db"
            
            self.engine = create_engine(
                database_url,
                echo=os.getenv('DEBUG', 'false').lower() == 'true',
                pool_pre_ping=True,
                pool_recycle=300
            )
            
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            
            # Create tables
            Base.metadata.create_all(bind=self.engine)
            
            logger.info("✅ Database service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    @contextmanager
    def get_db_session(self):
        """Get database session with automatic cleanup"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"❌ Database session error: {e}")
            raise
        finally:
            session.close()
    
    def create_user(self, spotify_id: str, spotify_username: str = None, 
                   display_name: str = None, email: str = None) -> Optional[User]:
        """Create a new user"""
        try:
            with self.get_db_session() as session:
                # Check if user already exists
                existing_user = session.query(User).filter(User.spotify_id == spotify_id).first()
                if existing_user:
                    logger.info(f"👤 User already exists: {spotify_id}")
                    return existing_user
                
                # Create new user
                user = User(
                    spotify_id=spotify_id,
                    spotify_username=spotify_username,
                    display_name=display_name,
                    email=email
                )
                
                session.add(user)
                session.flush()  # Get the ID
                
                # Create default preferences
                preferences = UserPreferences(
                    user_id=user.id,
                    auto_playlist_generation=True,
                    voice_emotion_enabled=True,
                    weather_integration=True
                )
                session.add(preferences)
                
                logger.info(f"✅ User created: {spotify_id}")
                return user
                
        except SQLAlchemyError as e:
            logger.error(f"❌ Error creating user: {e}")
            return None
    
    def update_user_tokens(self, spotify_id: str, access_token: str, 
                          refresh_token: str = None, expires_at: str = None) -> bool:
        """Update user's Spotify tokens"""
        try:
            with self.get_db_session() as session:
                user = session.query(User).filter(User.spotify_id == spotify_id).first()
                if not user:
                    logger.warning(f"⚠️ User not found: {spotify_id}")
                    return False
                
                user.access_token = access_token
                if refresh_token:
                    user.refresh_token = refresh_token
                if expires_at:
                    from datetime import datetime
                    user.token_expires_at = datetime.fromisoformat(expires_at)
                
                logger.info(f"✅ Tokens updated for user: {spotify_id}")
                return True
                
        except SQLAlchemyError as e:
            logger.error(f"❌ Error updating tokens: {e}")
            return False
    
    def get_user_by_spotify_id(self, spotify_id: str) -> Optional[User]:
        """Get user by Spotify ID"""
        try:
            with self.get_db_session() as session:
                return session.query(User).filter(User.spotify_id == spotify_id).first()
        except SQLAlchemyError as e:
            logger.error(f"❌ Error getting user: {e}")
            return None
    
    def add_emotion_history(self, user_id: str, emotion: str, confidence: float,
                           intensity: int = None, source: str = 'voice',
                           audio_file_path: str = None, transcription: str = None) -> bool:
        """Add emotion history entry"""
        try:
            with self.get_db_session() as session:
                emotion_entry = EmotionHistory(
                    user_id=user_id,
                    emotion=emotion,
                    confidence=confidence,
                    intensity=intensity,
                    source=source,
                    audio_file_path=audio_file_path,
                    transcription=transcription
                )
                
                session.add(emotion_entry)
                
                # Log analytics
                self._log_analytics(session, user_id, 'emotion_detected', {
                    'emotion': emotion,
                    'confidence': confidence,
                    'source': source
                })
                
                logger.info(f"✅ Emotion history added: {emotion} for user {user_id}")
                return True
                
        except SQLAlchemyError as e:
            logger.error(f"❌ Error adding emotion history: {e}")
            return False
    
    def add_feedback(self, user_id: str, song_id: str, song_name: str = None,
                    artist_name: str = None, emotion: str = None, intensity: int = None,
                    comment: str = None, rating: int = None) -> bool:
        """Add user feedback"""
        try:
            with self.get_db_session() as session:
                feedback = Feedback(
                    user_id=user_id,
                    song_id=song_id,
                    song_name=song_name,
                    artist_name=artist_name,
                    emotion=emotion,
                    intensity=intensity,
                    comment=comment,
                    rating=rating
                )
                
                session.add(feedback)
                
                # Log analytics
                self._log_analytics(session, user_id, 'feedback_submitted', {
                    'song_id': song_id,
                    'emotion': emotion,
                    'rating': rating
                })
                
                logger.info(f"✅ Feedback added for song {song_id}")
                return True
                
        except SQLAlchemyError as e:
            logger.error(f"❌ Error adding feedback: {e}")
            return False
    
    def get_user_emotion_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's emotion history"""
        try:
            with self.get_db_session() as session:
                emotions = session.query(EmotionHistory).filter(
                    EmotionHistory.user_id == user_id
                ).order_by(EmotionHistory.created_at.desc()).limit(limit).all()
                
                return [
                    {
                        'id': str(emotion.id),
                        'emotion': emotion.emotion,
                        'confidence': float(emotion.confidence) if emotion.confidence else None,
                        'intensity': emotion.intensity,
                        'source': emotion.source,
                        'created_at': emotion.created_at.isoformat()
                    }
                    for emotion in emotions
                ]
                
        except SQLAlchemyError as e:
            logger.error(f"❌ Error getting emotion history: {e}")
            return []
    
    def _log_analytics(self, session: Session, user_id: str, event_type: str, event_data: Dict[str, Any]):
        """Log analytics event"""
        try:
            analytics = Analytics(
                user_id=user_id,
                event_type=event_type,
                event_data=event_data
            )
            session.add(analytics)
        except Exception as e:
            logger.warning(f"⚠️ Analytics logging failed: {e}")

# Global database service instance
db_service = DatabaseService()
