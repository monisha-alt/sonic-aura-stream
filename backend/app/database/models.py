"""
Database models for Spotify data caching and user preferences
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class SpotifyArtist(Base):
    __tablename__ = "spotify_artists"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    genres = Column(JSON)  # List of genres
    popularity = Column(Integer)
    image_url = Column(String)
    external_urls = Column(JSON)
    spotify_url = Column(String)
    followers_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    albums = relationship("SpotifyAlbum", back_populates="artist")
    tracks = relationship("SpotifyTrack", back_populates="artist")

class SpotifyAlbum(Base):
    __tablename__ = "spotify_albums"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    artist_id = Column(String, ForeignKey("spotify_artists.id"))
    release_date = Column(String)
    total_tracks = Column(Integer)
    image_url = Column(String)
    external_urls = Column(JSON)
    spotify_url = Column(String)
    album_type = Column(String)  # album, single, compilation
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    artist = relationship("SpotifyArtist", back_populates="albums")
    tracks = relationship("SpotifyTrack", back_populates="album")

class SpotifyTrack(Base):
    __tablename__ = "spotify_tracks"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    artist_id = Column(String, ForeignKey("spotify_artists.id"))
    album_id = Column(String, ForeignKey("spotify_albums.id"))
    preview_url = Column(String)
    external_urls = Column(JSON)
    spotify_url = Column(String)
    duration_ms = Column(Integer)
    popularity = Column(Integer)
    explicit = Column(Boolean, default=False)
    
    # Audio features
    danceability = Column(Float)
    energy = Column(Float)
    valence = Column(Float)  # Musical positivity
    tempo = Column(Float)
    loudness = Column(Float)
    acousticness = Column(Float)
    instrumentalness = Column(Float)
    liveness = Column(Float)
    speechiness = Column(Float)
    key = Column(Integer)
    mode = Column(Integer)  # Major (1) or Minor (0)
    time_signature = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    artist = relationship("SpotifyArtist", back_populates="tracks")
    album = relationship("SpotifyAlbum", back_populates="tracks")

class SpotifyPlaylist(Base):
    __tablename__ = "spotify_playlists"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    image_url = Column(String)
    external_urls = Column(JSON)
    spotify_url = Column(String)
    tracks_total = Column(Integer)
    owner_id = Column(String)
    public = Column(Boolean, default=True)
    collaborative = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserEmotionHistory(Base):
    __tablename__ = "user_emotion_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    emotion = Column(String, nullable=False)
    confidence = Column(Float)
    intensity = Column(Float)
    method = Column(String)  # voice, text, manual
    context = Column(String)  # weather, time, activity
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Track recommendation tracking
    recommended_track_id = Column(String, ForeignKey("spotify_tracks.id"))
    user_rating = Column(Integer)  # 1-5 stars
    played = Column(Boolean, default=False)
    liked = Column(Boolean, default=False)

class UserListeningHistory(Base):
    __tablename__ = "user_listening_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    track_id = Column(String, ForeignKey("spotify_tracks.id"))
    played_at = Column(DateTime, default=datetime.utcnow)
    duration_played = Column(Integer)  # seconds
    completed = Column(Boolean, default=False)
    
    # Relationship
    track = relationship("SpotifyTrack")

class MoodPlaylist(Base):
    __tablename__ = "mood_playlists"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    mood = Column(String, nullable=False)
    weather_condition = Column(String)
    time_of_day = Column(String)  # morning, afternoon, evening, night
    playlist_name = Column(String, nullable=False)
    track_ids = Column(JSON)  # List of track IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AudioFeaturesCache(Base):
    __tablename__ = "audio_features_cache"
    
    track_id = Column(String, primary_key=True)
    features = Column(JSON)  # Full audio features object
    cached_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    track = relationship("SpotifyTrack")
