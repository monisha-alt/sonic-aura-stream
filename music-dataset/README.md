# 🎵 Copyright-Free Music Dataset for Aura Music

## 📁 Dataset Structure

This dataset contains copyright-free music from trusted sources for use in the Aura Music AI-powered streaming application.

### Directory Structure:
```
music-dataset/
├── main-tracks/          # Primary playback songs (Pixabay Music)
├── background-tracks/    # Ambient sounds & UI effects (Bensound/Mixkit)
├── emotion-tracks/       # Emotion-based catalog (Free Music Archive)
├── metadata/            # JSON/CSV files with track information
└── download-scripts/    # Automated download scripts
```

---

## 🎼 Track Sources

### 1. **Pixabay Music** (Main Tracks)
- **Purpose:** Primary user playback, main catalog
- **License:** Free for commercial use, no attribution required
- **Quality:** High-quality, professional tracks
- **URL:** https://pixabay.com/music/

### 2. **Bensound / Mixkit** (Background Tracks)
- **Purpose:** Background ambience, app intros, UI sounds
- **License:** Free with attribution
- **Quality:** Professional background music
- **URLs:** 
  - https://www.bensound.com/
  - https://mixkit.co/free-stock-music/

### 3. **Free Music Archive (FMA)** (Emotion Tracks)
- **Purpose:** Emotion-based recommendations
- **License:** Various Creative Commons licenses
- **Quality:** Diverse, curated collection
- **URL:** https://freemusicarchive.org/

---

## 📊 Metadata Structure

Each track includes:
- **Track Name:** Song title
- **Artist:** Artist/composer name
- **Source:** Pixabay / Bensound / Mixkit / FMA
- **Genre:** Music genre
- **Emotion Tag:** happy, sad, calm, energetic, romantic, angry
- **Duration:** Track length in seconds
- **File Path:** Local path to audio file
- **Download URL:** Direct download link
- **License:** License type
- **Attribution:** Required attribution (if any)

---

## 🚀 Quick Start

1. **Download the dataset:**
   ```bash
   cd music-dataset/download-scripts
   python download_all_tracks.py
   ```

2. **Load metadata:**
   ```python
   import json
   with open('metadata/all_tracks.json', 'r') as f:
       tracks = json.load(f)
   ```

3. **Filter by emotion:**
   ```python
   happy_tracks = [t for t in tracks if 'happy' in t['emotion_tags']]
   ```

---

## 📝 License Compliance

- **Pixabay:** Free for commercial use, no attribution required
- **Bensound:** Attribution required ("Music by Bensound.com")
- **Mixkit:** Free with attribution
- **FMA:** Check individual track licenses (CC BY, CC BY-SA, CC0)

---

## 🎯 Integration with AI System

This dataset is designed to work with:
- Emotion detection algorithms
- AI recommendation systems
- Playlist generation
- Context-based music selection

**Note:** This system is independent and does not use Spotify API.

