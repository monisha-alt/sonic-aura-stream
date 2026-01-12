# 🎵 Aura Music App

An AI-powered music streaming application with emotion detection, contextual recommendations, and intelligent music discovery.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Cloud Storage](https://img.shields.io/badge/Storage-Cloudinary-blue)
![Deployment](https://img.shields.io/badge/Deploy-Vercel-black)

---

## ✨ Features

### 🎭 AI Voice Emotion Detection
- Real-time voice analysis
- Emotion-based music recommendations
- Support for 6 emotions: Happy, Sad, Calm, Angry, Energetic, Romantic

### 🎼 Smart Music Library
- 35+ copyright-free tracks
- Filter by genre, emotion, artist
- Advanced search functionality
- Cloud-powered streaming (Cloudinary CDN)

### 🌤️ Contextual Recommendations
- Time-of-day based playlists
- Weather-aware recommendations
- Calendar event integration
- Personalized discovery

### 🎚️ Full-Featured Music Player
- Play, pause, skip controls
- Progress bar with seek
- Volume control
- Playlist management
- Persistent playback state

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aura-music-app.git
cd aura-music-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

### Cloud Services
- **Cloudinary** - Music file hosting & CDN
- **Vercel** - Deployment & hosting

### AI/ML
- **Web Audio API** - Voice analysis
- **Custom emotion detection** - Mood analysis

---

## 🎯 Project Structure

```
aura/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React Context (Music Player)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── MusicLibrary.tsx
│   │   ├── EmotionDetection.tsx
│   │   └── Recommendations.tsx
│   └── types/             # TypeScript types
├── public/
│   └── music-dataset/
│       └── metadata/      # Music metadata (JSON)
├── scripts/
│   ├── upload-to-cloudinary.js
│   └── update-metadata-with-cloudinary.js
└── docs/                  # Documentation
```

---

## 🎵 Music Library

### Current Collection
- **Main Tracks:** 10 songs (ambient, cinematic, world music)
- **Background Tracks:** 8 songs (lo-fi, chill, coffeehouse)
- **Emotion Tracks:** 18 songs (categorized by emotion)

### Sources
All music is copyright-free from:
- Pixabay Music
- Mixkit
- Free Music Archive

### Licenses
- Pixabay License (free for commercial use)
- Creative Commons licenses
- Public domain

---

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Cloud Storage
```bash
npm run upload:cloudinary    # Upload MP3s to Cloudinary
npm run update:metadata      # Update metadata with cloud URLs
npm run deploy:cloud         # Upload + update (combined)
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

**See detailed guide:** [`DEPLOY_NOW.md`](DEPLOY_NOW.md)

---

## 📚 Documentation

- **[Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)** - Complete Vercel deployment instructions
- **[Cloud Integration](CLOUDINARY_INTEGRATION_COMPLETE.md)** - Cloudinary setup summary
- **[Quick Deploy](DEPLOY_NOW.md)** - 3-step deployment guide
- **[Cloud Storage Setup](CLOUD_STORAGE_SETUP.md)** - Cloudinary configuration

---

## 🎨 Features in Detail

### Emotion Detection
Uses Web Audio API to analyze voice input and detect emotions in real-time:
- Audio level monitoring
- Voice validation
- Emotion classification
- Instant music recommendations

### Music Player Context
Global state management for music playback:
- Persistent player across pages
- Playlist management
- Automatic next track
- Volume persistence

### Contextual Recommendations
AI-powered playlist generation based on:
- Current time of day
- Weather conditions
- Calendar events
- User preferences

---

## 🔐 Environment Variables

Create a `.env` file for Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note:** Only needed for running upload scripts locally.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- **Music Sources:** Pixabay, Mixkit, Free Music Archive
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Cloud Storage:** Cloudinary
- **Hosting:** Vercel

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 🌟 Star this repo!

If you find this project useful, please give it a ⭐️ on GitHub!

---

**Built with ❤️ using React, TypeScript, and AI**

*Last Updated: October 26, 2025*

