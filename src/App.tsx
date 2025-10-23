import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Index from './pages/Index'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/index" element={<Index />} />
    </Routes>
  )
}

export default App