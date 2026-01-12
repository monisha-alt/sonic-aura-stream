"""
Enhanced database models for Aura Music.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model with enhanced fields."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100))
    avatar_url = Column(String(255))
    spotify_user_id = Column(String(100), unique=True, index=True)
    spotify_access_token = Column(Text)
    spotify_refresh_token = Column(Text)
    spotify_token_expires_at = Column(DateTime)
    is_premium = Column(Boolean, default=False)
    google_calendar_connected = Column(Boolean, default=False)
    google_refresh_token = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    song_history = relationship("UserSongHistory", back_populates="user")
    comments = relationship("SongComment", back_populates="user")
    playlists = relationship("Playlist", back_populates="user")

class Song(Base):
    """Song model with enhanced metadata."""
    __tablename__ = "songs"
    
    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    artist = Column(String(200), nullable=False)
    album = Column(String(200))
    duration = Column(Integer)  # Duration in seconds
    genre = Column(String(50))
    mood = Column(String(50))
    energy_level = Column(Float)
    valence = Column(Float)
    danceability = Column(Float)
    tempo = Column(Float)
    cover_url = Column(String(255))
    preview_url = Column(String(255))
    spotify_url = Column(String(255))
    spotify_id = Column(String(100), unique=True, index=True)
    lyrics = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    song_history = relationship("UserSongHistory", back_populates="song")
    comments = relationship("SongComment", back_populates="song")
    summaries = relationship("SongSummary", back_populates="song")

class UserSongHistory(Base):
    """Track user's listening history with unlistened key support."""
    __tablename__ = "user_song_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(String(50), ForeignKey("songs.id"), nullable=False)
    listened_at = Column(DateTime(timezone=True), server_default=func.now())
    listened_duration = Column(Integer, default=0)  # Seconds listened
    is_complete = Column(Boolean, default=False)  # Did user listen to full song
    skip_count = Column(Integer, default=0)  # How many times user skipped this song
    like_status = Column(String(20))  # 'liked', 'disliked', 'neutral'
    context = Column(String(50))  # 'discovery', 'recommendation', 'manual', etc.
    
    # Relationships
    user = relationship("User", back_populates="song_history")
    song = relationship("Song", back_populates="song_history")

class SongComment(Base):
    """Timestamp-based comments on songs."""
    __tablename__ = "song_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(String(50), ForeignKey("songs.id"), nullable=False)
    timestamp = Column(Float, nullable=False)  # Time in seconds
    content = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)
    likes_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    parent_comment_id = Column(Integer, ForeignKey("song_comments.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="comments")
    song = relationship("Song", back_populates="comments")
    replies = relationship("SongComment", backref="parent_comment")

class SongSummary(Base):
    """AI-generated song summaries and analysis."""
    __tablename__ = "song_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(String(50), ForeignKey("songs.id"), nullable=False)
    mood = Column(String(50))
    emotion = Column(String(50))
    genre = Column(String(50))
    energy_level = Column(Float)
    valence = Column(Float)
    danceability = Column(Float)
    key_themes = Column(JSON)  # List of themes
    summary_text = Column(Text)
    lyrics_analysis = Column(Text)
    ai_model_used = Column(String(100))
    confidence_score = Column(Float)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    song = relationship("Song", back_populates="summaries")

class Playlist(Base):
    """User playlists and generated playlists."""
    __tablename__ = "playlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    is_ai_generated = Column(Boolean, default=False)
    generation_context = Column(JSON)  # Context used for AI generation
    mood = Column(String(50))
    genre = Column(String(50))
    energy_level = Column(Float)
    track_count = Column(Integer, default=0)
    total_duration = Column(Integer, default=0)  # Total duration in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="playlists")
    tracks = relationship("PlaylistTrack", back_populates="playlist")

class PlaylistTrack(Base):
    """Tracks within playlists."""
    __tablename__ = "playlist_tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=False)
    song_id = Column(String(50), ForeignKey("songs.id"), nullable=False)
    position = Column(Integer, nullable=False)  # Track order in playlist
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    playlist = relationship("Playlist", back_populates="tracks")
    song = relationship("Song")

class CalendarContext(Base):
    """Calendar integration and context data."""
    __tablename__ = "calendar_context"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(String(100), nullable=False)
    event_summary = Column(String(200))
    event_start = Column(DateTime(timezone=True))
    event_end = Column(DateTime(timezone=True))
    event_type = Column(String(50))  # work, personal, creative, workout, etc.
    generated_playlist_id = Column(Integer, ForeignKey("playlists.id"))
    context_data = Column(JSON)  # Additional context information
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    playlist = relationship("Playlist")

class EmotionDetection(Base):
    """Track emotion detection results and recommendations."""
    __tablename__ = "emotion_detections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    detected_emotion = Column(String(50), nullable=False)
    intensity = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    detection_method = Column(String(50))  # 'llm', 'acoustic', 'combined'
    input_type = Column(String(20))  # 'voice', 'text'
    transcription = Column(Text)
    raw_llm_output = Column(Text)
    recommended_songs = Column(JSON)  # List of recommended song IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class UserPreferences(Base):
    """User preferences and settings."""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    preferred_genres = Column(JSON)  # List of preferred genres
    preferred_moods = Column(JSON)  # List of preferred moods
    energy_preference = Column(Float, default=0.5)  # Preferred energy level
    discovery_mode = Column(Boolean, default=True)  # Enable AI recommendations
    social_features = Column(Boolean, default=True)  # Enable comments and sharing
    calendar_integration = Column(Boolean, default=False)
    auto_playlist_generation = Column(Boolean, default=True)
    privacy_level = Column(String(20), default="public")  # public, friends, private
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
