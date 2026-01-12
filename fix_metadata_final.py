#!/usr/bin/env python
import json
import os
from pathlib import Path

base_dir = Path("public/music-dataset")

def find_file_path(file_name):
    """Find the actual location of MP3 file"""
    search_dirs = [
        base_dir / "emotion-tracks" / "happy",
        base_dir / "emotion-tracks" / "sad",
        base_dir / "emotion-tracks" / "calm",
        base_dir / "emotion-tracks" / "angry",
        base_dir / "emotion-tracks" / "energetic",
        base_dir / "emotion-tracks" / "romantic",
        base_dir / "main-tracks",
        base_dir / "background-tracks",
    ]
    
    for search_dir in search_dirs:
        file_path = search_dir / file_name
        if file_path.exists():
            # Convert to web path
            rel_path = file_path.relative_to(Path("public"))
            return f"/{str(rel_path).replace(chr(92), '/')}"
    return None

metadata_files = [
    ("main_tracks.json", "main-tracks"),
    ("emotion_tracks.json", "emotion-tracks"),
    ("background_tracks.json", "background-tracks"),
]

for meta_file, category in metadata_files:
    file_path = base_dir / "metadata" / meta_file
    print(f"\n📝 Processing {meta_file}...")
    
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        tracks = json.load(f)
    
    updated = 0
    for track in tracks:
        file_name = track.get('file_name', '')
        if file_name:
            local_path = find_file_path(file_name)
            if local_path:
                track['file_path'] = local_path
                track['storage_type'] = 'local'
                updated += 1
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(tracks, f, indent=2, ensure_ascii=False)
    
    print(f"   ✅ Updated {updated} tracks")

print("\n✅ All metadata files fixed!")
print("💡 Restart your dev server and refresh browser!")

