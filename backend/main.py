from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os

from app.database import engine, get_db
from app.models import Base
from app.routers import auth, songs, recommendations, comments, emotions, calendar, spotify
from app.core.config import settings

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Aura Music Streaming API",
    description="AI-powered music streaming platform with emotion detection and smart recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(songs.router, prefix="/api/songs", tags=["songs"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])
app.include_router(emotions.router, prefix="/api/emotions", tags=["emotions"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(spotify.router, prefix="/api/spotify", tags=["spotify"])

@app.get("/")
async def root():
    return {"message": "Aura Music Streaming API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
