import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import EmotionDetection from './pages/EmotionDetection'
import Recommendations from './pages/Recommendations'
import Social from './pages/Social'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/emotion" element={<EmotionDetection />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/social" element={<Social />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App