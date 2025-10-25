import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import EmotionDetection from './pages/EmotionDetection'
import Recommendations from './pages/Recommendations'
import Social from './pages/Social'
import Profile from './pages/Profile'

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
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/social" element={<Social />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      )}
    </>
  )
}

export default App