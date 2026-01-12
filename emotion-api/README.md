---
title: Aura Emotion Detection API
emoji: 🎤
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# 🎤 Aura Emotion Detection API

Real-time emotion detection from audio using Wav2Vec2 model from Hugging Face.

## 🚀 Features

- **Real-time Emotion Detection**: Uses `superb/wav2vec2-base-superb-er` model
- **Multiple Audio Formats**: Supports WAV, MP3, WebM, and more
- **Fast Processing**: Optimized for real-time analysis
- **REST API**: Easy integration with any frontend

## 📖 API Endpoints

### Health Check
```
GET /health
```

### Predict Emotion
```
POST /predict
Content-Type: multipart/form-data
Body: audio file (WAV, MP3, WebM, etc.)
```

**Response:**
```json
{
  "emotion": "happy",
  "confidence": 0.85,
  "model": "Wav2Vec2 (Hugging Face)"
}
```

## 🎯 Supported Emotions

- `happy` - Joyful, cheerful
- `sad` - Sad, melancholic
- `angry` - Angry, frustrated
- `calm` - Calm, relaxed
- `excited` - Excited, energetic
- `neutral` - Neutral, no strong emotion

## 🛠️ Technology Stack

- **Framework**: FastAPI
- **Model**: Wav2Vec2 (superb/wav2vec2-base-superb-er)
- **Audio Processing**: librosa, soundfile, pydub
- **ML Framework**: PyTorch, Hugging Face Transformers

## 📝 Usage Example

```python
import requests

# Upload audio file
with open('audio.wav', 'rb') as f:
    files = {'audio': f}
    response = requests.post(
        'https://your-username-aura-emotion-api.hf.space/predict',
        files=files
    )
    
result = response.json()
print(f"Detected emotion: {result['emotion']}")
```

## 🌐 Frontend Integration

The frontend is deployed on Vercel and connects to this API for real-time emotion detection from microphone input.

## 📝 License

MIT License
