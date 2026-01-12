"""
Generate metadata JSON files from actual downloaded MP3 files (Simple version)
No external dependencies required
"""

import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
METADATA_DIR = BASE_DIR / "metadata"
MAIN_TRACKS_DIR = BASE_DIR / "main-tracks"
BACKGROUND_TRACKS_DIR = BASE_DIR / "background-tracks"
EMOTION_TRACKS_DIR = BASE_DIR / "emotion-tracks"

def clean_filename(filename):
    """Extract clean track name from filename"""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '')
    # Remove numbers and hyphens at start
    name = name.lstrip('0123456789-')
    # Replace hyphens and underscores with spaces
    name = name.replace('-', ' ').replace('_', ' ')
    # Capitalize words
    name = ' '.join(word.capitalize() for word in name.split())
    return name

def extract_artist_title(filename):
    """Try to extract artist and title from filename"""
    clean_name = filename.replace('.mp3', '')
    
    # Check for common separators
    if ' - ' in clean_name:
        parts = clean_name.split(' - ', 1)
        return parts[0].strip(), parts[1].strip()
    elif '_' in clean_name:
        parts = clean_name.split('_', 1)
        return parts[0].strip(), parts[1].strip()
    else:
        return "Unknown Artist", clean_filename(filename)

def generate_main_tracks_metadata():
    """Generate metadata for main tracks"""
    print("\n=== Generating Main Tracks Metadata ===")
    tracks = []
    
    if not MAIN_TRACKS_DIR.exists():
        print("[!] Main tracks directory not found")
        return tracks
    
    mp3_files = sorted(MAIN_TRACKS_DIR.glob("*.mp3"))
    
    for idx, filepath in enumerate(mp3_files):
        filename = filepath.name
        artist, title = extract_artist_title(filename)
        
        track = {
            "track_id": f"main_{idx+1:03d}",
            "track_name": title,
            "artist": artist,
            "album": "Aura Music Collection",
            "genre": "Ambient",
            "duration": "3:00",  # Default duration
            "file_name": filename,
            "file_path": str(filepath),
            "source": "Pixabay",
            "license": "Pixabay License",
            "download_url": "https://pixabay.com/music/",
            "tags": ["ambient", "background", "cinematic"]
        }
        tracks.append(track)
        print(f"[OK] {filename}")
        print(f"     -> {title} by {artist}")
    
    return tracks

def generate_background_tracks_metadata():
    """Generate metadata for background tracks"""
    print("\n=== Generating Background Tracks Metadata ===")
    tracks = []
    
    if not BACKGROUND_TRACKS_DIR.exists():
        print("[!] Background tracks directory not found")
        return tracks
    
    mp3_files = sorted(BACKGROUND_TRACKS_DIR.glob("*.mp3"))
    
    for idx, filepath in enumerate(mp3_files):
        filename = filepath.name
        
        # Detect source from filename
        if filename.startswith('mixkit-'):
            source = "Mixkit"
            artist = "Mixkit"
        else:
            source = "Bensound"
            artist = "Bensound"
        
        title = clean_filename(filename)
        
        track = {
            "track_id": f"bg_{idx+1:03d}",
            "track_name": title,
            "artist": artist,
            "album": "Background Music Collection",
            "genre": "Background",
            "duration": "2:30",  # Default duration
            "file_name": filename,
            "file_path": str(filepath),
            "source": source,
            "license": "Royalty Free",
            "download_url": f"https://{source.lower()}.com/",
            "attribution": f"Music by {artist}",
            "tags": ["background", "ambient", "chill"]
        }
        tracks.append(track)
        print(f"[OK] {filename}")
        print(f"     -> {title} by {artist}")
    
    return tracks

def generate_emotion_tracks_metadata():
    """Generate metadata for emotion tracks"""
    print("\n=== Generating Emotion Tracks Metadata ===")
    tracks = []
    
    if not EMOTION_TRACKS_DIR.exists():
        print("[!] Emotion tracks directory not found")
        return tracks
    
    emotions = ["happy", "sad", "calm", "energetic", "romantic", "angry"]
    
    for emotion in emotions:
        emotion_dir = EMOTION_TRACKS_DIR / emotion
        if not emotion_dir.exists():
            print(f"[!] {emotion} directory not found")
            continue
        
        print(f"\n{emotion.upper()} tracks:")
        mp3_files = sorted(emotion_dir.glob("*.mp3"))
        
        for idx, filepath in enumerate(mp3_files):
            filename = filepath.name
            artist, title = extract_artist_title(filename)
            
            track = {
                "track_id": f"{emotion}_{idx+1:03d}",
                "track_name": title,
                "artist": artist,
                "album": f"{emotion.capitalize()} Music Collection",
                "genre": emotion.capitalize(),
                "duration": "3:30",  # Default duration
                "file_name": filename,
                "file_path": str(filepath),
                "source": "Free Music Archive",
                "license": "CC BY",
                "download_url": "https://freemusicarchive.org/",
                "emotion_tags": [emotion],
                "tags": [emotion, "emotional", "mood"]
            }
            tracks.append(track)
            print(f"  [OK] {filename}")
            print(f"       -> {title} by {artist}")
    
    return tracks

def save_metadata(filename, data):
    """Save metadata to JSON file"""
    METADATA_DIR.mkdir(exist_ok=True)
    filepath = METADATA_DIR / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Saved {filename} ({len(data)} tracks)")

def generate_all_tracks_csv(main_tracks, background_tracks, emotion_tracks):
    """Generate CSV file with all tracks"""
    import csv
    
    csv_path = METADATA_DIR / "all_tracks.csv"
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['track_id', 'track_name', 'artist', 'album', 'genre', 'duration', 
                     'file_name', 'source', 'license', 'tags']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        
        for track in main_tracks + background_tracks + emotion_tracks:
            row = {k: v for k, v in track.items() if k in fieldnames}
            if 'tags' in row and isinstance(row['tags'], list):
                row['tags'] = ', '.join(row['tags'])
            if 'emotion_tags' in track:
                if 'tags' in row:
                    row['tags'] += ', ' + ', '.join(track['emotion_tags'])
            writer.writerow(row)
    
    print(f"[OK] Saved all_tracks.csv ({len(main_tracks) + len(background_tracks) + len(emotion_tracks)} tracks)")

def main():
    """Main function"""
    print("=" * 70)
    print("GENERATE METADATA FROM DOWNLOADED FILES".center(70))
    print("=" * 70)
    
    print("\nScanning your downloaded MP3 files...")
    
    # Generate metadata
    main_tracks = generate_main_tracks_metadata()
    background_tracks = generate_background_tracks_metadata()
    emotion_tracks = generate_emotion_tracks_metadata()
    
    # Save to JSON files
    print("\n" + "=" * 70)
    print("SAVING METADATA FILES".center(70))
    print("=" * 70)
    
    save_metadata("main_tracks.json", main_tracks)
    save_metadata("background_tracks.json", background_tracks)
    save_metadata("emotion_tracks.json", emotion_tracks)
    
    # Generate CSV
    generate_all_tracks_csv(main_tracks, background_tracks, emotion_tracks)
    
    print("\n" + "=" * 70)
    print("METADATA GENERATION COMPLETE!".center(70))
    print("=" * 70)
    print(f"\nTotal tracks: {len(main_tracks) + len(background_tracks) + len(emotion_tracks)}")
    print(f"  - Main tracks: {len(main_tracks)}")
    print(f"  - Background tracks: {len(background_tracks)}")
    print(f"  - Emotion tracks: {len(emotion_tracks)}")
    print("\nNext step: Run 'python verify_dataset.py' to verify!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()

