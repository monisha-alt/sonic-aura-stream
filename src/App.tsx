
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import MusicLibraryPage from './pages/MusicLibraryPage';
import PlaylistsPage from './pages/PlaylistsPage';
import RemixPage from './pages/RemixPage';
import ContextualPage from './pages/ContextualPage';
import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import LiveSessionsPage from './pages/LiveSessionsPage';
import LyricsPage from './pages/LyricsPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MusicLibraryPage />} />
        <Route path="/library" element={<MusicLibraryPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/remix/:songId?" element={<RemixPage />} />
        <Route path="/contextual" element={<ContextualPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/albums/:albumId" element={<AlbumDetailPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:artistId" element={<ArtistDetailPage />} />
        <Route path="/live" element={<LiveSessionsPage />} />
        <Route path="/lyrics" element={<LyricsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
