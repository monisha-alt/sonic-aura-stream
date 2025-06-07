
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthPage from '@/pages/AuthPage';
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MusicLibraryPage />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <MusicLibraryPage />
            </ProtectedRoute>
          } />
          <Route path="/playlists" element={
            <ProtectedRoute>
              <PlaylistsPage />
            </ProtectedRoute>
          } />
          <Route path="/remix/:songId?" element={
            <ProtectedRoute>
              <RemixPage />
            </ProtectedRoute>
          } />
          <Route path="/contextual" element={
            <ProtectedRoute>
              <ContextualPage />
            </ProtectedRoute>
          } />
          <Route path="/albums" element={
            <ProtectedRoute>
              <AlbumsPage />
            </ProtectedRoute>
          } />
          <Route path="/albums/:albumId" element={
            <ProtectedRoute>
              <AlbumDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/artists" element={
            <ProtectedRoute>
              <ArtistsPage />
            </ProtectedRoute>
          } />
          <Route path="/artists/:artistId" element={
            <ProtectedRoute>
              <ArtistDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/live" element={
            <ProtectedRoute>
              <LiveSessionsPage />
            </ProtectedRoute>
          } />
          <Route path="/lyrics" element={
            <ProtectedRoute>
              <LyricsPage />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
