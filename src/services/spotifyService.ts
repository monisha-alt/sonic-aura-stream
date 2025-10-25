// Spotify API Integration Service
// For production, you'll need to register your app at https://developer.spotify.com/dashboard

const SPOTIFY_CLIENT_ID = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = (import.meta as any).env?.VITE_SPOTIFY_CLIENT_SECRET || '';

let accessToken: string = '';
let tokenExpiry: number = 0;

// Get Spotify Access Token (Client Credentials Flow)
export const getSpotifyToken = async (): Promise<string> => {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    accessToken = data.access_token || '';
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

// Search for tracks
export const searchTracks = async (query: string, limit: number = 20) => {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

// Get recommendations based on seed tracks
export const getRecommendations = async (seedTracks: string[], limit: number = 20) => {
  try {
    const token = await getSpotifyToken();
    const seedTracksParam = seedTracks.join(',');
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracksParam}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

// Get playlist tracks
export const getPlaylistTracks = async (playlistId: string) => {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    return data.items.map((item: any) => item.track);
  } catch (error) {
    console.error('Error getting playlist tracks:', error);
    return [];
  }
};

// Format track data for our app
export const formatTrack = (track: any) => {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    album: track.album.name,
    duration: formatDuration(track.duration_ms),
    albumArt: track.album.images[0]?.url || '/placeholder.svg',
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify,
    popularity: track.popularity
  };
};

// Format duration from ms to mm:ss
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

