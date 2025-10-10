import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import AlbumsPage from './pages/AlbumsPage'
import ArtistsPage from './pages/ArtistsPage'
import ArtistDetailPage from './pages/ArtistDetailPage'
import AlbumDetailPage from './pages/AlbumDetailPage'
import LyricsPage from './pages/LyricsPage'
import RemixPage from './pages/RemixPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/albums" element={<AlbumsPage />} />
      <Route path="/artists" element={<ArtistsPage />} />
      <Route path="/artists/:id" element={<ArtistDetailPage />} />
      <Route path="/albums/:id" element={<AlbumDetailPage />} />
      <Route path="/lyrics/:id" element={<LyricsPage />} />
      <Route path="/remix/:id" element={<RemixPage />} />
    </Routes>
  )
}

export default App