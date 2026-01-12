#!/usr/bin/env python3
"""
Verify that all tracks in the dataset are present and valid
"""

import os
import json
from pathlib import Path
from collections import defaultdict

# Base directories
BASE_DIR = Path(__file__).parent.parent
METADATA_DIR = BASE_DIR / "metadata"


def load_all_metadata():
    """Load all metadata files"""
    all_tracks = []
    
    for metadata_file in ["main_tracks.json", "background_tracks.json", "emotion_tracks.json"]:
        filepath = METADATA_DIR / metadata_file
        with open(filepath, 'r') as f:
            tracks = json.load(f)
            all_tracks.extend(tracks)
    
    return all_tracks


def verify_files():
    """Verify that all files exist"""
    tracks = load_all_metadata()
    
    missing_files = []
    present_files = []
    
    for track in tracks:
        filepath = BASE_DIR / track['file_path']
        
        if filepath.exists():
            present_files.append(track)
        else:
            missing_files.append(track)
    
    return present_files, missing_files


def generate_statistics(tracks):
    """Generate dataset statistics"""
    stats = {
        'total_tracks': len(tracks),
        'by_source': defaultdict(int),
        'by_genre': defaultdict(int),
        'by_emotion': defaultdict(int),
        'total_duration': 0
    }
    
    for track in tracks:
        stats['by_source'][track['source']] += 1
        stats['by_genre'][track['genre']] += 1
        
        # Parse duration string (MM:SS) to seconds
        if isinstance(track['duration'], str) and ':' in track['duration']:
            parts = track['duration'].split(':')
            duration_seconds = int(parts[0]) * 60 + int(parts[1])
            stats['total_duration'] += duration_seconds
        
        if 'emotion_tags' in track:
            for emotion in track['emotion_tags']:
                stats['by_emotion'][emotion] += 1
    
    return stats


def main():
    """Main verification function"""
    print("=" * 60)
    print("Dataset Verification")
    print("=" * 60)
    
    present, missing = verify_files()
    
    print(f"\n[OK] Present: {len(present)} tracks")
    print(f"[!] Missing: {len(missing)} tracks")
    
    if missing:
        print("\n[!] Missing Files:")
        for track in missing:
            print(f"  - {track['track_name']} by {track['artist']}")
            print(f"    Expected at: {track['file_path']}")
    
    if present:
        print("\n[STATS] Dataset Statistics:")
        stats = generate_statistics(present)
        
        print(f"\nTotal Tracks: {stats['total_tracks']}")
        print(f"Total Duration: {stats['total_duration'] // 60} minutes")
        
        print("\nBy Source:")
        for source, count in stats['by_source'].items():
            print(f"  - {source}: {count} tracks")
        
        print("\nBy Genre:")
        for genre, count in sorted(stats['by_genre'].items()):
            print(f"  - {genre}: {count} tracks")
        
        print("\nBy Emotion:")
        for emotion, count in sorted(stats['by_emotion'].items()):
            print(f"  - {emotion}: {count} tracks")
    
    print("\n" + "=" * 60)
    
    if len(missing) == 0:
        print("[OK] All tracks present! Dataset is complete.")
    else:
        print(f"[!] {len(missing)} tracks missing. Please download them.")
    
    print("=" * 60)


if __name__ == "__main__":
    main()

