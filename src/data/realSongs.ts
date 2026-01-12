// Real-world songs data - curated popular tracks across different moods and genres
// Local music library for the application

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  albumArt: string;
  genre: string;
  mood: string;
  previewUrl?: string;
}

// Happy/Upbeat Songs
export const happySongs: Song[] = [
  {
    id: "1",
    title: "I'm Feeling Good (Medium Version)",
    artist: "BoDleasons",
    album: "Happy Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Happy",
    mood: "happy"
  },
  {
    id: "2",
    title: "Abchied Bruder (Happy Little Auld Lang Syne)",
    artist: "Bros II",
    album: "Happy Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Happy",
    mood: "happy"
  },
  {
    id: "3",
    title: "Sunny Day - Happy Inspirational Guitar Music (Free Download MP3)",
    artist: "TolsetMusic",
    album: "Happy Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Happy",
    mood: "happy"
  },
];

// Sad/Melancholic Songs
export const sadSongs: Song[] = [
  {
    id: "4",
    title: "Sad Tension",
    artist: "AudioCoffee",
    album: "Sad Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Sad",
    mood: "sad"
  },
  {
    id: "5",
    title: "Warm Abstraction",
    artist: "AudioCoffee",
    album: "Sad Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Sad",
    mood: "sad"
  },
  {
    id: "6",
    title: "Sad is the Aeroplane",
    artist: "Colonel Trip & Captain Future",
    album: "Sad Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Sad",
    mood: "sad"
  },
];

// Calm/Relaxing Songs
export const calmSongs: Song[] = [
  {
    id: "7",
    title: "Slow Calm Documentary",
    artist: "ArcSound",
    album: "Calm Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Calm",
    mood: "calm"
  },
  {
    id: "8",
    title: "Oceanic Calm",
    artist: "Audiorezout",
    album: "Calm Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Calm",
    mood: "calm"
  },
  {
    id: "9",
    title: "Calm Lofi",
    artist: "Lowtone Music",
    album: "Calm Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Calm",
    mood: "calm"
  },
];

// Energetic/Workout Songs
export const energeticSongs: Song[] = [
  {
    id: "10",
    title: "Sport Victory Energetic Rock",
    artist: "BlackTrendMusic",
    album: "Energetic Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Energetic",
    mood: "energetic"
  },
  {
    id: "11",
    title: "Tropical Music Short - Happy Pop",
    artist: "Lowtone Music",
    album: "Energetic Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Energetic",
    mood: "energetic"
  },
  {
    id: "12",
    title: "Energetic Upbeat Funky Pop",
    artist: "SoundForYou",
    album: "Energetic Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Energetic",
    mood: "energetic"
  },
];

// Romantic Songs
export const romanticSongs: Song[] = [
  {
    id: "13",
    title: "Emotional Educational Romantic Piano _ Walking Home (short 2)",
    artist: "Alex-Productions",
    album: "Romantic Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Romantic",
    mood: "romantic"
  },
  {
    id: "14",
    title: "Delicate",
    artist: "Lite Saturation",
    album: "Romantic Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Romantic",
    mood: "romantic"
  },
  {
    id: "15",
    title: "Lingering Touch (Romantic Beautiful Piano Music)",
    artist: "Lite Saturation",
    album: "Romantic Music Collection",
    duration: "3:30",
    albumArt: "/placeholder.svg",
    genre: "Romantic",
    mood: "romantic"
  },
];

// Trending/Popular Songs (Main Tracks)
export const trendingSongs: Song[] = [
  {
    id: "19",
    title: "Amalgam 217007",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "20",
    title: "Ballad Of The Forsaken Emotional Song No Copyright No Copyright 324308",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "21",
    title: "Epic Music Loop Inspirational Cinematic 385472",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "22",
    title: "Hopeful Cinematic Ambient 349815",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "23",
    title: "Indian Bollywood Diwali Music 306679",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "24",
    title: "Indian Hindu Diwali Music 419361",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "25",
    title: "Indian Summer Part I 109078",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "26",
    title: "Sapne Bade 305719",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "27",
    title: "The Indian 399825",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
  {
    id: "28",
    title: "Uplifting Upbeat Acoustic Guitar 237893",
    artist: "Unknown Artist",
    album: "Aura Music Collection",
    duration: "3:00",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "unknown"
  },
];

// All songs combined
export const allSongs: Song[] = [
  ...happySongs,
  ...sadSongs,
  ...calmSongs,
  ...energeticSongs,
  ...romanticSongs,
  ...trendingSongs
];

// Get songs by mood
export const getSongsByMood = (mood: string): Song[] => {
  const moodMap: { [key: string]: Song[] } = {
    happy: happySongs,
    sad: sadSongs,
    calm: calmSongs,
    energetic: energeticSongs,
    excited: energeticSongs,
    romantic: romanticSongs,
    angry: energeticSongs
  };
  
  return moodMap[mood.toLowerCase()] || allSongs.slice(0, 10);
};

// Get songs by genre
export const getSongsByGenre = (genre: string): Song[] => {
  return allSongs.filter(song => 
    song.genre.toLowerCase().includes(genre.toLowerCase())
  );
};

// Get random songs
export const getRandomSongs = (count: number = 10): Song[] => {
  const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
