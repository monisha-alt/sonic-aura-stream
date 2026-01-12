#!/usr/bin/env python3
"""
Copyright-Free Music Dataset Downloader
Downloads tracks from Pixabay, Bensound, Mixkit, and Free Music Archive
"""

import os
import json
import requests
from pathlib import Path
import time

# Base directories
BASE_DIR = Path(__file__).parent.parent
MAIN_TRACKS_DIR = BASE_DIR / "main-tracks"
BACKGROUND_TRACKS_DIR = BASE_DIR / "background-tracks"
EMOTION_TRACKS_DIR = BASE_DIR / "emotion-tracks"
METADATA_DIR = BASE_DIR / "metadata"

# Create directories
MAIN_TRACKS_DIR.mkdir(exist_ok=True)
BACKGROUND_TRACKS_DIR.mkdir(exist_ok=True)
(EMOTION_TRACKS_DIR / "happy").mkdir(parents=True, exist_ok=True)
(EMOTION_TRACKS_DIR / "sad").mkdir(parents=True, exist_ok=True)
(EMOTION_TRACKS_DIR / "calm").mkdir(parents=True, exist_ok=True)
(EMOTION_TRACKS_DIR / "energetic").mkdir(parents=True, exist_ok=True)
(EMOTION_TRACKS_DIR / "romantic").mkdir(parents=True, exist_ok=True)
(EMOTION_TRACKS_DIR / "angry").mkdir(parents=True, exist_ok=True)


def download_file(url, filepath):
    """Download a file from URL to filepath"""
    try:
        print(f"Downloading: {filepath.name}")
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"[OK] Downloaded: {filepath.name}")
        return True
    except Exception as e:
        print(f"[ERROR] Error downloading {filepath.name}: {e}")
        return False


def load_metadata(filename):
    """Load metadata from JSON file"""
    filepath = METADATA_DIR / filename
    with open(filepath, 'r') as f:
        return json.load(f)


def download_main_tracks():
    """Download main tracks from Pixabay"""
    print("\n=== Downloading Main Tracks (Pixabay) ===")
    tracks = load_metadata("main_tracks.json")
    
    for track in tracks:
        filepath = BASE_DIR / track['file_path']
        
        # Note: Pixabay requires manual download or API key
        print(f"\nTrack: {track['track_name']}")
        print(f"  Artist: {track['artist']}")
        print(f"  Download URL: {track['download_url']}")
        print(f"  Save to: {filepath}")
        print("  → Please download manually from Pixabay.com")
        
        time.sleep(0.5)


def download_background_tracks():
    """Download background tracks from Bensound/Mixkit"""
    print("\n=== Downloading Background Tracks (Bensound/Mixkit) ===")
    tracks = load_metadata("background_tracks.json")
    
    for track in tracks:
        filepath = BASE_DIR / track['file_path']
        
        print(f"\nTrack: {track['track_name']}")
        print(f"  Artist: {track['artist']}")
        print(f"  Source: {track['source']}")
        print(f"  Download URL: {track['download_url']}")
        print(f"  Save to: {filepath}")
        print(f"  Attribution: {track['attribution_text']}")
        print("  → Please download manually from source website")
        
        time.sleep(0.5)


def download_emotion_tracks():
    """Download emotion-based tracks from FMA"""
    print("\n=== Downloading Emotion Tracks (Free Music Archive) ===")
    tracks = load_metadata("emotion_tracks.json")
    
    for track in tracks:
        filepath = BASE_DIR / track['file_path']
        
        print(f"\nTrack: {track['track_name']}")
        print(f"  Artist: {track['artist']}")
        print(f"  Emotions: {', '.join(track['emotion_tags'])}")
        print(f"  Download URL: {track['download_url']}")
        print(f"  Save to: {filepath}")
        print(f"  License: {track['license']}")
        if track['attribution_required']:
            print(f"  Attribution: {track['attribution_text']}")
        print("  → Please download manually from FMA")
        
        time.sleep(0.5)


def generate_download_instructions():
    """Generate detailed download instructions"""
    instructions = """
# DOWNLOAD INSTRUCTIONS

## Manual Download Required

Due to licensing and API restrictions, tracks must be downloaded manually from their respective sources.

## Step-by-Step Guide:

### 1. Pixabay Music (Main Tracks)
1. Visit: https://pixabay.com/music/
2. Search for the track name (e.g., "Inspiring Cinematic Ambient")
3. Click "Free Download"
4. Save to: `music-dataset/main-tracks/`
5. Rename file to match `file_path` in metadata

### 2. Bensound (Background Tracks)
1. Visit: https://www.bensound.com/royalty-free-music
2. Find the track (e.g., "Ukulele")
3. Click "Download"
4. Save to: `music-dataset/background-tracks/`
5. Remember to add attribution in your app!

### 3. Mixkit (Background Tracks)
1. Visit: https://mixkit.co/free-stock-music/
2. Browse categories
3. Download tracks
4. Save to: `music-dataset/background-tracks/`

### 4. Free Music Archive (Emotion Tracks)
1. Visit: https://freemusicarchive.org/
2. Search for artist name
3. Download track
4. Save to appropriate emotion folder:
   - `emotion-tracks/happy/`
   - `emotion-tracks/sad/`
   - `emotion-tracks/calm/`
   - `emotion-tracks/energetic/`
   - `emotion-tracks/romantic/`
   - `emotion-tracks/angry/`

## Automated Download (Advanced)

For Pixabay and FMA, you can use their APIs:
- Pixabay API: https://pixabay.com/api/docs/
- FMA API: https://freemusicarchive.org/api

## Verification

After downloading, run:
```bash
python verify_dataset.py
```

This will check if all files are present and match the metadata.
"""
    
    with open(BASE_DIR / "DOWNLOAD_INSTRUCTIONS.md", 'w', encoding='utf-8') as f:
        f.write(instructions)
    
    print("\n[OK] Generated DOWNLOAD_INSTRUCTIONS.md")


def main():
    """Main download function"""
    print("=" * 60)
    print("Copyright-Free Music Dataset Downloader")
    print("=" * 60)
    
    print("\n[!] IMPORTANT:")
    print("Most tracks require manual download due to licensing.")
    print("This script will show you what to download and where to save it.")
    
    input("\nPress Enter to continue...")
    
    # Download tracks (shows instructions)
    download_main_tracks()
    download_background_tracks()
    download_emotion_tracks()
    
    # Generate instructions file
    generate_download_instructions()
    
    print("\n" + "=" * 60)
    print("[OK] Download instructions generated!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Read DOWNLOAD_INSTRUCTIONS.md")
    print("2. Download tracks manually from sources")
    print("3. Run: python verify_dataset.py")
    print("\n")


if __name__ == "__main__":
    main()

