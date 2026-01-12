import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import EmotionDetection from './pages/EmotionDetection'
import Recommendations from './pages/Recommendations'
import Social from './pages/Social'
import Profile from './pages/Profile'
import CalendarPage from './pages/CalendarPage'
import MusicLibrary from './components/local-music/MusicLibrary'

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <>
      {isLandingPage ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/emotion" element={<EmotionDetection />} />
            <Route path="/library" element={<MusicLibrary />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/social" element={<Social />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
        </Layout>
      )}
    </>
  )
}

export default App