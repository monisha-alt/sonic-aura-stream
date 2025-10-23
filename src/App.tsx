import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Index from './pages/Index'
import EmotionRecommendations from './pages/EmotionRecommendations'
import Trending from './pages/Trending'

function App() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/" element={<Index />} />
      <Route path="/emotion" element={<EmotionRecommendations />} />
      <Route path="/recommendations" element={<EmotionRecommendations />} />
      <Route path="/trending" element={<Trending />} />
    </Routes>
  )
}

export default App