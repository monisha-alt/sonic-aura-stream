"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create songs table
    op.create_table('songs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('artist', sa.String(), nullable=False),
        sa.Column('album', sa.String(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('genre', sa.String(), nullable=True),
        sa.Column('mood', sa.String(), nullable=True),
        sa.Column('energy_level', sa.Float(), nullable=True),
        sa.Column('valence', sa.Float(), nullable=True),
        sa.Column('danceability', sa.Float(), nullable=True),
        sa.Column('acousticness', sa.Float(), nullable=True),
        sa.Column('instrumentalness', sa.Float(), nullable=True),
        sa.Column('tempo', sa.Float(), nullable=True),
        sa.Column('key', sa.Integer(), nullable=True),
        sa.Column('mode', sa.Integer(), nullable=True),
        sa.Column('time_signature', sa.Integer(), nullable=True),
        sa.Column('spotify_id', sa.String(), nullable=True),
        sa.Column('preview_url', sa.String(), nullable=True),
        sa.Column('cover_url', sa.String(), nullable=True),
        sa.Column('lyrics', sa.Text(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_songs_id'), 'songs', ['id'], unique=False)
    op.create_index(op.f('ix_songs_spotify_id'), 'songs', ['spotify_id'], unique=True)

    # Create comments table
    op.create_table('comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.Float(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.Integer(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['comments.id'], ),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comments_id'), 'comments', ['id'], unique=False)

    # Create reactions table
    op.create_table('reactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.Integer(), nullable=True),
        sa.Column('comment_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['comment_id'], ['comments.id'], ),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reactions_id'), 'reactions', ['id'], unique=False)

    # Create playlists table
    op.create_table('playlists',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_playlists_id'), 'playlists', ['id'], unique=False)

    # Create playlist_songs table
    op.create_table('playlist_songs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('playlist_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.Integer(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['playlist_id'], ['playlists.id'], ),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_playlist_songs_id'), 'playlist_songs', ['id'], unique=False)

    # Create listening_history table
    op.create_table('listening_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.Integer(), nullable=False),
        sa.Column('listened_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('duration_listened', sa.Integer(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_listening_history_id'), 'listening_history', ['id'], unique=False)

    # Create emotion_detections table
    op.create_table('emotion_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('emotion', sa.String(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('input_type', sa.String(), nullable=False),
        sa.Column('context_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emotion_detections_id'), 'emotion_detections', ['id'], unique=False)

    # Create recommendations table
    op.create_table('recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('song_id', sa.Integer(), nullable=False),
        sa.Column('recommendation_type', sa.String(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('context_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['song_id'], ['songs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendations_id'), 'recommendations', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_recommendations_id'), table_name='recommendations')
    op.drop_table('recommendations')
    op.drop_index(op.f('ix_emotion_detections_id'), table_name='emotion_detections')
    op.drop_table('emotion_detections')
    op.drop_index(op.f('ix_listening_history_id'), table_name='listening_history')
    op.drop_table('listening_history')
    op.drop_index(op.f('ix_playlist_songs_id'), table_name='playlist_songs')
    op.drop_table('playlist_songs')
    op.drop_index(op.f('ix_playlists_id'), table_name='playlists')
    op.drop_table('playlists')
    op.drop_index(op.f('ix_reactions_id'), table_name='reactions')
    op.drop_table('reactions')
    op.drop_index(op.f('ix_comments_id'), table_name='comments')
    op.drop_table('comments')
    op.drop_index(op.f('ix_songs_spotify_id'), table_name='songs')
    op.drop_index(op.f('ix_songs_id'), table_name='songs')
    op.drop_table('songs')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
