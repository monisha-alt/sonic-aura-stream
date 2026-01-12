#!/usr/bin/env python3
"""
Simple script to show download list without interaction
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
METADATA_DIR = BASE_DIR / "metadata"

def load_metadata(filename):
    """Load metadata from JSON file"""
    filepath = METADATA_DIR / filename
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    print("=" * 70)
    print("COPYRIGHT-FREE MUSIC DATASET - DOWNLOAD LIST")
    print("=" * 70)
    
    # Main tracks
    print("\n=== MAIN TRACKS (Pixabay) - 10 tracks ===")
    print("Visit: https://pixabay.com/music/")
    print("\nTracks to download:")
    
    main_tracks = load_metadata("main_tracks.json")
    for i, track in enumerate(main_tracks, 1):
        print(f"\n{i}. {track['track_name']} by {track['artist']}")
        print(f"   Genre: {track['genre']} | Duration: {track['duration']//60}:{track['duration']%60:02d}")
        print(f"   Save as: {track['file_path']}")
    
    # Background tracks
    print("\n\n=== BACKGROUND TRACKS (Bensound/Mixkit) - 8 tracks ===")
    
    bg_tracks = load_metadata("background_tracks.json")
    
    bensound = [t for t in bg_tracks if t['source'] == 'Bensound']
    mixkit = [t for t in bg_tracks if t['source'] == 'Mixkit']
    
    print("\nBensound tracks (https://www.bensound.com/):")
    for i, track in enumerate(bensound, 1):
        print(f"\n{i}. {track['track_name']}")
        print(f"   URL: {track['download_url']}")
        print(f"   Save as: {track['file_path']}")
        print(f"   Attribution: {track['attribution_text']}")
    
    print("\n\nMixkit tracks (https://mixkit.co/free-stock-music/):")
    for i, track in enumerate(mixkit, 1):
        print(f"\n{i}. {track['track_name']}")
        print(f"   URL: {track['download_url']}")
        print(f"   Save as: {track['file_path']}")
        print(f"   Attribution: {track['attribution_text']}")
    
    # Emotion tracks
    print("\n\n=== EMOTION TRACKS (Free Music Archive) - 17 tracks ===")
    print("Visit: https://freemusicarchive.org/")
    
    emotion_tracks = load_metadata("emotion_tracks.json")
    
    emotions = {}
    for track in emotion_tracks:
        emotion = track['emotion_tags'][0]
        if emotion not in emotions:
            emotions[emotion] = []
        emotions[emotion].append(track)
    
    for emotion, tracks in emotions.items():
        print(f"\n{emotion.upper()} tracks:")
        for i, track in enumerate(tracks, 1):
            print(f"\n  {i}. {track['track_name']} by {track['artist']}")
            print(f"     URL: {track['download_url']}")
            print(f"     Save as: {track['file_path']}")
            print(f"     License: {track['license']}")
            if track['attribution_required']:
                print(f"     Attribution: {track['attribution_text']}")
    
    print("\n" + "=" * 70)
    print("TOTAL: 35 tracks to download")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Visit each website")
    print("2. Search for track names")
    print("3. Download and save to specified paths")
    print("4. Run: python verify_dataset.py")
    print("\n")

if __name__ == "__main__":
    main()

