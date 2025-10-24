import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MusicPlayer from './pages/MusicPlayer'
import EmotionDetection from './pages/EmotionDetection'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/player" element={<MusicPlayer />} />
      <Route path="/emotion" element={<EmotionDetection />} />
    </Routes>
  )
}

export default App