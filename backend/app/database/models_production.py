"""
Production Database Models
SQLAlchemy models for PostgreSQL database
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, DECIMAL, ARRAY, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    spotify_id = Column(String(255), unique=True, nullable=False)
    spotify_username = Column(String(255))
    display_name = Column(String(255))
    email = Column(String(255))
    refresh_token = Column(Text)
    access_token = Column(Text)
    token_expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    emotion_history = relationship("EmotionHistory", back_populates="user", cascade="all, delete-orphan")
    playlist_history = relationship("PlaylistHistory", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="user")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(String(255), nullable=False)
    song_name = Column(String(500))
    artist_name = Column(String(500))
    emotion = Column(String(50))
    intensity = Column(Integer)
    comment = Column(Text)
    rating = Column(Integer)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="feedback")
    
    # Constraints
    __table_args__ = (
        Index('idx_feedback_user_id', 'user_id'),
        Index('idx_feedback_song_id', 'song_id'),
    )

class EmotionHistory(Base):
    __tablename__ = "emotion_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emotion = Column(String(50), nullable=False)
    confidence = Column(DECIMAL(3, 2))
    intensity = Column(Integer)
    source = Column(String(50), default='voice')
    audio_file_path = Column(Text)
    transcription = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="emotion_history")
    
    # Constraints
    __table_args__ = (
        Index('idx_emotion_history_user_id', 'user_id'),
        Index('idx_emotion_history_created_at', 'created_at'),
    )

class PlaylistHistory(Base):
    __tablename__ = "playlist_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    playlist_name = Column(String(255), nullable=False)
    playlist_type = Column(String(50), default='emotion')
    emotion = Column(String(50))
    mood = Column(String(50))
    context = Column(String(100))
    song_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="playlist_history")
    songs = relationship("PlaylistSong", back_populates="playlist", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        Index('idx_playlist_history_user_id', 'user_id'),
    )

class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlist_history.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(String(255), nullable=False)
    song_name = Column(String(500))
    artist_name = Column(String(500))
    position = Column(Integer)
    added_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    playlist = relationship("PlaylistHistory", back_populates="songs")
    
    # Constraints
    __table_args__ = (
        Index('idx_playlist_songs_playlist_id', 'playlist_id'),
    )

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_genres = Column(ARRAY(String))
    preferred_artists = Column(ARRAY(String))
    energy_level = Column(Integer)
    mood_sensitivity = Column(DECIMAL(3, 2))
    auto_playlist_generation = Column(Boolean, default=True)
    voice_emotion_enabled = Column(Boolean, default=True)
    calendar_integration = Column(Boolean, default=False)
    weather_integration = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="preferences")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    event_type = Column(String(100), nullable=False)
    event_data = Column(JSON)
    session_id = Column(String(255))
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="analytics")
    
    # Constraints
    __table_args__ = (
        Index('idx_analytics_user_id', 'user_id'),
        Index('idx_analytics_event_type', 'event_type'),
        Index('idx_analytics_created_at', 'created_at'),
    )
