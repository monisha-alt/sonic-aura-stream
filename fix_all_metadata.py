#!/usr/bin/env python
"""Fix all metadata files to use local paths"""
import json
import os
from pathlib import Path

base = Path("public/music-dataset")

def find_file(file_name):
    """Find MP3 file location"""
    dirs = [
        "emotion-tracks/happy", "emotion-tracks/sad", "emotion-tracks/calm",
        "emotion-tracks/angry", "emotion-tracks/energetic", "emotion-tracks/romantic",
        "main-tracks", "background-tracks"
    ]
    for d in dirs:
        path = base / d / file_name
        if path.exists():
            return f"/music-dataset/{d}/{file_name}"
    return None

files = [
    ("main_tracks.json", "main-tracks"),
    ("emotion_tracks.json", "emotion-tracks"),
    ("background_tracks.json", "background-tracks"),
]

for meta_file, category in files:
    path = base / "metadata" / meta_file
    print(f"\n📝 Processing {meta_file}...")
    
    with open(path, 'r', encoding='utf-8-sig') as f:
        tracks = json.load(f)
    
    updated = 0
    for track in tracks:
        file_name = track.get('file_name', '')
        if not file_name:
            continue
        
        # For emotion tracks, check emotion_tags
        if category == "emotion-tracks" and track.get('emotion_tags'):
            emotion = track['emotion_tags'][0]
            local_path = base / "emotion-tracks" / emotion / file_name
            if local_path.exists():
                track['file_path'] = f"/music-dataset/emotion-tracks/{emotion}/{file_name}"
                track['storage_type'] = 'local'
                updated += 1
        else:
            # For main/background tracks
            local_path = find_file(file_name)
            if local_path:
                track['file_path'] = local_path
                track['storage_type'] = 'local'
                updated += 1
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(tracks, f, indent=2, ensure_ascii=False)
    
    print(f"   ✅ Updated {updated}/{len(tracks)} tracks")

print("\n✅ All files fixed!")
print("💡 Restart dev server and refresh browser!")

