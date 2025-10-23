from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    comments = relationship("Comment", back_populates="user")
    reactions = relationship("Reaction", back_populates="user")
    listening_history = relationship("ListeningHistory", back_populates="user")
    playlists = relationship("Playlist", back_populates="user")

class Song(Base):
    __tablename__ = "songs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    album = Column(String)
    duration = Column(Integer)  # in seconds
    genre = Column(String)
    mood = Column(String)
    energy_level = Column(Float)  # 0.0 to 1.0
    valence = Column(Float)  # 0.0 to 1.0
    danceability = Column(Float)  # 0.0 to 1.0
    acousticness = Column(Float)  # 0.0 to 1.0
    instrumentalness = Column(Float)  # 0.0 to 1.0
    tempo = Column(Float)
    key = Column(Integer)
    mode = Column(Integer)  # 0 = minor, 1 = major
    time_signature = Column(Integer)
    spotify_id = Column(String, unique=True)
    preview_url = Column(String)
    cover_url = Column(String)
    lyrics = Column(Text)
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    comments = relationship("Comment", back_populates="song")
    reactions = relationship("Reaction", back_populates="song")
    listening_history = relationship("ListeningHistory", back_populates="song")
    playlist_songs = relationship("PlaylistSong", back_populates="song")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(Float)  # in seconds
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"))  # for replies
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="comments")
    song = relationship("Song", back_populates="comments")
    reactions = relationship("Reaction", back_populates="comment")
    replies = relationship("Comment", remote_side=[id])

class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # like, love, laugh, etc.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"))
    comment_id = Column(Integer, ForeignKey("comments.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reactions")
    song = relationship("Song", back_populates="reactions")
    comment = relationship("Comment", back_populates="reactions")

class Playlist(Base):
    __tablename__ = "playlists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="playlists")
    songs = relationship("PlaylistSong", back_populates="playlist")

class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    
    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    position = Column(Integer, nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    playlist = relationship("Playlist", back_populates="songs")
    song = relationship("Song", back_populates="playlist_songs")

class ListeningHistory(Base):
    __tablename__ = "listening_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    listened_at = Column(DateTime(timezone=True), server_default=func.now())
    duration_listened = Column(Integer)  # in seconds
    completed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="listening_history")
    song = relationship("Song", back_populates="listening_history")

class EmotionDetection(Base):
    __tablename__ = "emotion_detections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emotion = Column(String, nullable=False)  # happy, sad, angry, etc.
    confidence = Column(Float, nullable=False)
    input_type = Column(String, nullable=False)  # voice, text, calendar
    context_data = Column(JSON)  # weather, time, location, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    recommendation_type = Column(String, nullable=False)  # emotion, context, calendar
    confidence_score = Column(Float, nullable=False)
    context_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    song = relationship("Song")
