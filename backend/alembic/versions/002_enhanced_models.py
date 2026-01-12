"""Enhanced models migration

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    """Create enhanced tables."""
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=True),
        sa.Column('avatar_url', sa.String(length=255), nullable=True),
        sa.Column('spotify_user_id', sa.String(length=100), nullable=True),
        sa.Column('spotify_access_token', sa.Text(), nullable=True),
        sa.Column('spotify_refresh_token', sa.Text(), nullable=True),
        sa.Column('spotify_token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_premium', sa.Boolean(), nullable=True),
        sa.Column('google_calendar_connected', sa.Boolean(), nullable=True),
        sa.Column('google_refresh_token', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_spotify_user_id'), 'users', ['spotify_user_id'], unique=True)

    # Create songs table
    op.create_table('songs',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('artist', sa.String(length=200), nullable=False),
        sa.Column('album', sa.String(length=200), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('genre', sa.String(length=50), nullable=True),
        sa.Column('mood', sa.String(length=50), nullable=True),
        sa.Column('energy_level', sa.Float(), nullable=True),
        sa.Column('valence', sa.Float(), nullable=True),
        sa.Column('danceability', sa.Float(), nullable=True),
        sa.Column('tempo', sa.Float(), nullable=True),
        sa.Column('cover_url', sa.String(length=255), nullable=True),
        sa.Column('preview_url', sa.String(length=255), nullable=True),
        sa.Column('spotify_url', sa.String(length=255), nullable=True),
        sa.Column('spotify_id', sa.String(length=100), nullable=True),
        sa.Column('lyrics', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_songs_id'), 'songs', ['id'], unique=False)
    op.create_index(op.f('ix_songs_spotify_id'), 'songs', ['spotify_id'], unique=True)

    # Create user_song_history table
    op.create_table('user_song_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.String(length=50), nullable=False),
        sa.Column('listened_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('listened_duration', sa.Integer(), nullable=True),
        sa.Column('is_complete', sa.Boolean(), nullable=True),
        sa.Column('skip_count', sa.Integer(), nullable=True),
        sa.Column('like_status', sa.String(length=20), nullable=True),
        sa.Column('context', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_song_history_id'), 'user_song_history', ['id'], unique=False)

    # Create song_comments table
    op.create_table('song_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.Float(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('likes_count', sa.Integer(), nullable=True),
        sa.Column('replies_count', sa.Integer(), nullable=True),
        sa.Column('parent_comment_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['parent_comment_id'], ['song_comments.id'], ),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_song_comments_id'), 'song_comments', ['id'], unique=False)

    # Create song_summaries table
    op.create_table('song_summaries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.String(length=50), nullable=False),
        sa.Column('mood', sa.String(length=50), nullable=True),
        sa.Column('emotion', sa.String(length=50), nullable=True),
        sa.Column('genre', sa.String(length=50), nullable=True),
        sa.Column('energy_level', sa.Float(), nullable=True),
        sa.Column('valence', sa.Float(), nullable=True),
        sa.Column('danceability', sa.Float(), nullable=True),
        sa.Column('key_themes', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('summary_text', sa.Text(), nullable=True),
        sa.Column('lyrics_analysis', sa.Text(), nullable=True),
        sa.Column('ai_model_used', sa.String(length=100), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_song_summaries_id'), 'song_summaries', ['id'], unique=False)

    # Create playlists table
    op.create_table('playlists',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('is_ai_generated', sa.Boolean(), nullable=True),
        sa.Column('generation_context', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('mood', sa.String(length=50), nullable=True),
        sa.Column('genre', sa.String(length=50), nullable=True),
        sa.Column('energy_level', sa.Float(), nullable=True),
        sa.Column('track_count', sa.Integer(), nullable=True),
        sa.Column('total_duration', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_playlists_id'), 'playlists', ['id'], unique=False)

    # Create playlist_tracks table
    op.create_table('playlist_tracks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('playlist_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.String(length=50), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['playlist_id'], ['playlists.id'], ),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_playlist_tracks_id'), 'playlist_tracks', ['id'], unique=False)

    # Create calendar_context table
    op.create_table('calendar_context',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.String(length=100), nullable=False),
        sa.Column('event_summary', sa.String(length=200), nullable=True),
        sa.Column('event_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('event_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('event_type', sa.String(length=50), nullable=True),
        sa.Column('generated_playlist_id', sa.Integer(), nullable=True),
        sa.Column('context_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['generated_playlist_id'], ['playlists.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_calendar_context_id'), 'calendar_context', ['id'], unique=False)

    # Create emotion_detections table
    op.create_table('emotion_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('detected_emotion', sa.String(length=50), nullable=False),
        sa.Column('intensity', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('detection_method', sa.String(length=50), nullable=True),
        sa.Column('input_type', sa.String(length=20), nullable=True),
        sa.Column('transcription', sa.Text(), nullable=True),
        sa.Column('raw_llm_output', sa.Text(), nullable=True),
        sa.Column('recommended_songs', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emotion_detections_id'), 'emotion_detections', ['id'], unique=False)

    # Create user_preferences table
    op.create_table('user_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('preferred_genres', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('preferred_moods', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('energy_preference', sa.Float(), nullable=True),
        sa.Column('discovery_mode', sa.Boolean(), nullable=True),
        sa.Column('social_features', sa.Boolean(), nullable=True),
        sa.Column('calendar_integration', sa.Boolean(), nullable=True),
        sa.Column('auto_playlist_generation', sa.Boolean(), nullable=True),
        sa.Column('privacy_level', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_preferences_id'), 'user_preferences', ['id'], unique=False)


def downgrade():
    """Drop enhanced tables."""
    op.drop_index(op.f('ix_user_preferences_id'), table_name='user_preferences')
    op.drop_table('user_preferences')
    op.drop_index(op.f('ix_emotion_detections_id'), table_name='emotion_detections')
    op.drop_table('emotion_detections')
    op.drop_index(op.f('ix_calendar_context_id'), table_name='calendar_context')
    op.drop_table('calendar_context')
    op.drop_index(op.f('ix_playlist_tracks_id'), table_name='playlist_tracks')
    op.drop_table('playlist_tracks')
    op.drop_index(op.f('ix_playlists_id'), table_name='playlists')
    op.drop_table('playlists')
    op.drop_index(op.f('ix_song_summaries_id'), table_name='song_summaries')
    op.drop_table('song_summaries')
    op.drop_index(op.f('ix_song_comments_id'), table_name='song_comments')
    op.drop_table('song_comments')
    op.drop_index(op.f('ix_user_song_history_id'), table_name='user_song_history')
    op.drop_table('user_song_history')
    op.drop_index(op.f('ix_songs_spotify_id'), table_name='songs')
    op.drop_index(op.f('ix_songs_id'), table_name='songs')
    op.drop_table('songs')
    op.drop_index(op.f('ix_users_spotify_user_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
