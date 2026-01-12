-- Aura Music Database Schema
-- PostgreSQL database schema for production deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for Spotify OAuth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spotify_id VARCHAR(255) UNIQUE NOT NULL,
    spotify_username VARCHAR(255),
    display_name VARCHAR(255),
    email VARCHAR(255),
    refresh_token TEXT,
    access_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Feedback table for user song reactions
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    song_id VARCHAR(255) NOT NULL,
    song_name VARCHAR(500),
    artist_name VARCHAR(500),
    emotion VARCHAR(50),
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
    comment TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emotion history table
CREATE TABLE IF NOT EXISTS emotion_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
    source VARCHAR(50) DEFAULT 'voice', -- 'voice', 'text', 'manual'
    audio_file_path TEXT,
    transcription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist history table
CREATE TABLE IF NOT EXISTS playlist_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    playlist_name VARCHAR(255) NOT NULL,
    playlist_type VARCHAR(50) DEFAULT 'emotion', -- 'emotion', 'mood', 'contextual'
    emotion VARCHAR(50),
    mood VARCHAR(50),
    context VARCHAR(100), -- 'weather', 'time', 'calendar'
    song_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlist_history(id) ON DELETE CASCADE,
    song_id VARCHAR(255) NOT NULL,
    song_name VARCHAR(500),
    artist_name VARCHAR(500),
    position INTEGER,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_genres TEXT[], -- Array of genre strings
    preferred_artists TEXT[], -- Array of artist names
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    mood_sensitivity DECIMAL(3,2) CHECK (mood_sensitivity >= 0 AND mood_sensitivity <= 1),
    auto_playlist_generation BOOLEAN DEFAULT TRUE,
    voice_emotion_enabled BOOLEAN DEFAULT TRUE,
    calendar_integration BOOLEAN DEFAULT FALSE,
    weather_integration BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table for usage tracking
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'login', 'emotion_detected', 'playlist_created', 'song_played'
    event_data JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_spotify_id ON users(spotify_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_song_id ON feedback(song_id);
CREATE INDEX IF NOT EXISTS idx_emotion_history_user_id ON emotion_history(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_history_created_at ON emotion_history(created_at);
CREATE INDEX IF NOT EXISTS idx_playlist_history_user_id ON playlist_history(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
