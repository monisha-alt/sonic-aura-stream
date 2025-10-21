from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import Song, User
from app.core.auth import get_current_user
from app.services.song_summarization import song_summarization_service

router = APIRouter()

class SongResponse(BaseModel):
    id: int
    title: str
    artist: str
    album: Optional[str]
    duration: Optional[int]
    genre: Optional[str]
    mood: Optional[str]
    energy_level: Optional[float]
    valence: Optional[float]
    danceability: Optional[float]
    acousticness: Optional[float]
    instrumentalness: Optional[float]
    tempo: Optional[float]
    key: Optional[int]
    mode: Optional[int]
    time_signature: Optional[int]
    spotify_id: Optional[str]
    preview_url: Optional[str]
    cover_url: Optional[str]
    lyrics: Optional[str]
    summary: Optional[str]

class SummarizeRequest(BaseModel):
    song_id: int
    lyrics: Optional[str] = None
    audio_features: Optional[dict] = None

@router.get("/", response_model=List[SongResponse])
async def get_songs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get songs with optional filtering"""
    query = db.query(Song)
    
    if genre:
        query = query.filter(Song.genre.ilike(f"%{genre}%"))
    
    if mood:
        query = query.filter(Song.mood.ilike(f"%{mood}%"))
    
    songs = query.offset(skip).limit(limit).all()
    return songs

@router.get("/{song_id}", response_model=SongResponse)
async def get_song(song_id: int, db: Session = Depends(get_db)):
    """Get a specific song by ID"""
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.post("/summarize")
async def summarize_song(
    request: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI summary for a song"""
    song = db.query(Song).filter(Song.id == request.song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Use provided lyrics or get from database
    lyrics = request.lyrics or song.lyrics
    if not lyrics:
        raise HTTPException(status_code=400, detail="No lyrics available for summarization")
    
    # Use provided audio features or get from database
    audio_features = request.audio_features or {
        "valence": song.valence,
        "energy": song.energy_level,
        "danceability": song.danceability,
        "acousticness": song.acousticness,
        "instrumentalness": song.instrumentalness,
        "tempo": song.tempo,
        "key": song.key,
        "mode": song.mode,
        "time_signature": song.time_signature
    }
    
    # Generate summary
    summary_result = await song_summarization_service.generate_song_summary(
        lyrics=lyrics,
        title=song.title,
        artist=song.artist,
        audio_features=audio_features
    )
    
    # Update song with summary if it doesn't exist
    if not song.summary:
        song.summary = summary_result.get("summary", "")
        db.commit()
    
    return summary_result

@router.get("/search/")
async def search_songs(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search songs by title, artist, or album"""
    query = db.query(Song).filter(
        Song.title.ilike(f"%{q}%") |
        Song.artist.ilike(f"%{q}%") |
        Song.album.ilike(f"%{q}%")
    )
    
    songs = query.limit(limit).all()
    return songs

@router.get("/featured/random")
async def get_random_featured_songs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get random featured songs"""
    from sqlalchemy import func
    
    songs = db.query(Song).order_by(func.random()).limit(limit).all()
    return songs

@router.get("/by-genre/{genre}")
async def get_songs_by_genre(
    genre: str,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get songs by specific genre"""
    songs = db.query(Song).filter(Song.genre.ilike(f"%{genre}%")).limit(limit).all()
    return songs

@router.get("/by-mood/{mood}")
async def get_songs_by_mood(
    mood: str,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get songs by specific mood"""
    songs = db.query(Song).filter(Song.mood.ilike(f"%{mood}%")).limit(limit).all()
    return songs
