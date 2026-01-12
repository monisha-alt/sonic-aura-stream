#!/usr/bin/env python
"""Properly fix all metadata files"""
import json
import os
from pathlib import Path

base = Path("public/music-dataset")

def find_mp3(file_name):
    """Find MP3 file and return web path"""
    dirs = [
        ("emotion-tracks/happy", "happy"),
        ("emotion-tracks/sad", "sad"),
        ("emotion-tracks/calm", "calm"),
        ("emotion-tracks/angry", "angry"),
        ("emotion-tracks/energetic", "energetic"),
        ("emotion-tracks/romantic", "romantic"),
        ("main-tracks", None),
        ("background-tracks", None),
    ]
    for dir_path, emotion in dirs:
        full_path = base / dir_path / file_name
        if full_path.exists():
            return f"/music-dataset/{dir_path}/{file_name}", emotion
    return None, None

files = [
    "main_tracks.json",
    "emotion_tracks.json", 
    "background_tracks.json",
]

for meta_file in files:
    path = base / "metadata" / meta_file
    print(f"\n📝 Processing {meta_file}...")
    
    try:
        with open(path, 'r', encoding='utf-8-sig') as f:
            tracks = json.load(f)
    except Exception as e:
        print(f"   ❌ Error reading: {e}")
        continue
    
    updated = 0
    for track in tracks:
        file_name = track.get('file_name', '')
        if not file_name:
            continue
        
        web_path, emotion = find_mp3(file_name)
        if web_path:
            track['file_path'] = web_path
            track['storage_type'] = 'local'
            updated += 1
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(tracks, f, indent=2, ensure_ascii=False)
    
    print(f"   ✅ Updated {updated}/{len(tracks)} tracks")

print("\n✅ All files fixed!")
print("💡 Restart dev server: npm run dev")
print("💡 Hard refresh browser: Ctrl+F5")

