// Real-world songs data - curated popular tracks across different moods and genres
// These are actual songs from Spotify that users can discover

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  albumArt: string;
  genre: string;
  mood: string;
  spotifyId?: string;
  previewUrl?: string;
}

// Happy/Upbeat Songs
export const happySongs: Song[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "happy",
    spotifyId: "0VjIjW4GlUZAMYd2vXMi3b"
  },
  {
    id: "2",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "happy",
    spotifyId: "39LLxExYz6ewLAcYrzQQyP"
  },
  {
    id: "3",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    duration: "2:58",
    albumArt: "/placeholder.svg",
    genre: "Pop Rock",
    mood: "happy",
    spotifyId: "4ZtFanR9U6ndgddUvNcjcG"
  },
  {
    id: "4",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    album: "Uptown Special",
    duration: "4:30",
    albumArt: "/placeholder.svg",
    genre: "Funk",
    mood: "happy",
    spotifyId: "32OlwWuMpZ6b0aN2RZOeMS"
  },
  {
    id: "5",
    title: "Don't Stop Me Now",
    artist: "Queen",
    album: "Jazz",
    duration: "3:29",
    albumArt: "/placeholder.svg",
    genre: "Rock",
    mood: "happy",
    spotifyId: "7hQJA50XrCWABAu5v6QZ4i"
  }
];

// Sad/Melancholic Songs
export const sadSongs: Song[] = [
  {
    id: "6",
    title: "Someone Like You",
    artist: "Adele",
    album: "21",
    duration: "4:45",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "sad",
    spotifyId: "1zwMYTA5nlNjZxYrvBB2pV"
  },
  {
    id: "7",
    title: "The Night We Met",
    artist: "Lord Huron",
    album: "Strange Trails",
    duration: "3:28",
    albumArt: "/placeholder.svg",
    genre: "Indie Folk",
    mood: "sad",
    spotifyId: "0NdTUS4UiNYCNn5FgVqKQY"
  },
  {
    id: "8",
    title: "Skinny Love",
    artist: "Bon Iver",
    album: "For Emma, Forever Ago",
    duration: "3:58",
    albumArt: "/placeholder.svg",
    genre: "Indie Folk",
    mood: "sad",
    spotifyId: "01oSZZKuf6a1KVhBYZbPqv"
  },
  {
    id: "9",
    title: "Hurt",
    artist: "Johnny Cash",
    album: "American IV: The Man Comes Around",
    duration: "3:38",
    albumArt: "/placeholder.svg",
    genre: "Country",
    mood: "sad",
    spotifyId: "1gK3FgCrJWzVW0pbmzJCj2"
  },
  {
    id: "10",
    title: "Fix You",
    artist: "Coldplay",
    album: "X&Y",
    duration: "4:54",
    albumArt: "/placeholder.svg",
    genre: "Alternative Rock",
    mood: "sad",
    spotifyId: "7LVHVU3tWfcxj5aiPFEW4Q"
  }
];

// Calm/Relaxing Songs
export const calmSongs: Song[] = [
  {
    id: "11",
    title: "Weightless",
    artist: "Marconi Union",
    album: "Weightless",
    duration: "8:09",
    albumArt: "/placeholder.svg",
    genre: "Ambient",
    mood: "calm",
    spotifyId: "2WfaOiMkCvy7F5fcp2zZ8L"
  },
  {
    id: "12",
    title: "Clair de Lune",
    artist: "Claude Debussy",
    album: "Suite Bergamasque",
    duration: "5:24",
    albumArt: "/placeholder.svg",
    genre: "Classical",
    mood: "calm",
    spotifyId: "1prBHLRgRca5HwKYhLKMPh"
  },
  {
    id: "13",
    title: "Holocene",
    artist: "Bon Iver",
    album: "Bon Iver",
    duration: "5:36",
    albumArt: "/placeholder.svg",
    genre: "Indie Folk",
    mood: "calm",
    spotifyId: "6g0Orsxv6glTJCt4cHsRsQ"
  },
  {
    id: "14",
    title: "River Flows in You",
    artist: "Yiruma",
    album: "First Love",
    duration: "3:38",
    albumArt: "/placeholder.svg",
    genre: "Classical",
    mood: "calm",
    spotifyId: "4Ajg9J8M7N1JNW2Nh8LHZB"
  },
  {
    id: "15",
    title: "Breathe Me",
    artist: "Sia",
    album: "Colour the Small One",
    duration: "4:33",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "calm",
    spotifyId: "6pZNbGw5YxRt9cCsAWKHT0"
  }
];

// Energetic/Workout Songs
export const energeticSongs: Song[] = [
  {
    id: "16",
    title: "Eye of the Tiger",
    artist: "Survivor",
    album: "Eye of the Tiger",
    duration: "4:04",
    albumArt: "/placeholder.svg",
    genre: "Rock",
    mood: "energetic",
    spotifyId: "2KH16WveTQWT6KOG9Rg6e2"
  },
  {
    id: "17",
    title: "Thunderstruck",
    artist: "AC/DC",
    album: "The Razors Edge",
    duration: "4:52",
    albumArt: "/placeholder.svg",
    genre: "Rock",
    mood: "energetic",
    spotifyId: "57bgtoPSgt236HzfBOd8kj"
  },
  {
    id: "18",
    title: "Till I Collapse",
    artist: "Eminem ft. Nate Dogg",
    album: "The Eminem Show",
    duration: "4:57",
    albumArt: "/placeholder.svg",
    genre: "Hip Hop",
    mood: "energetic",
    spotifyId: "4xkOaSrkexMciUUogZKVTS"
  },
  {
    id: "19",
    title: "Lose Yourself",
    artist: "Eminem",
    album: "8 Mile Soundtrack",
    duration: "5:26",
    albumArt: "/placeholder.svg",
    genre: "Hip Hop",
    mood: "energetic",
    spotifyId: "5Z01UMMf7V1o0MzF86s6WJ"
  },
  {
    id: "20",
    title: "Stronger",
    artist: "Kanye West",
    album: "Graduation",
    duration: "5:11",
    albumArt: "/placeholder.svg",
    genre: "Hip Hop",
    mood: "energetic",
    spotifyId: "0j2T0R9dR9qdJYsB7ciXhf"
  }
];

// Romantic Songs
export const romanticSongs: Song[] = [
  {
    id: "21",
    title: "Perfect",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "4:23",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "romantic",
    spotifyId: "0tgVpDi06FyKpA1z0VMD4v"
  },
  {
    id: "22",
    title: "Thinking Out Loud",
    artist: "Ed Sheeran",
    album: "x (Multiply)",
    duration: "4:41",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "romantic",
    spotifyId: "3SdTKo2uVsxFblQjpScoHy"
  },
  {
    id: "23",
    title: "All of Me",
    artist: "John Legend",
    album: "Love in the Future",
    duration: "4:29",
    albumArt: "/placeholder.svg",
    genre: "R&B",
    mood: "romantic",
    spotifyId: "3U4isOIWM3VvDubwSI3y7a"
  },
  {
    id: "24",
    title: "Make You Feel My Love",
    artist: "Adele",
    album: "19",
    duration: "3:32",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "romantic",
    spotifyId: "37P2CqjY8JU6WPq2VRsqbm"
  },
  {
    id: "25",
    title: "A Thousand Years",
    artist: "Christina Perri",
    album: "The Twilight Saga: Breaking Dawn",
    duration: "4:45",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "romantic",
    spotifyId: "6Gg1gjkQVaRcFvt7jCKfKk"
  }
];

// Trending/Popular Songs
export const trendingSongs: Song[] = [
  {
    id: "26",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    duration: "3:20",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "happy",
    spotifyId: "0V3wPSX9ygBnCm8psDIegu"
  },
  {
    id: "27",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    duration: "2:47",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "happy",
    spotifyId: "4Dvkj6JhhA12EX05fT7y2e"
  },
  {
    id: "28",
    title: "Flowers",
    artist: "Miley Cyrus",
    album: "Endless Summer Vacation",
    duration: "3:20",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "happy",
    spotifyId: "0yLdNVWF3Srea0uzk55zFn"
  },
  {
    id: "29",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    album: "Lover",
    duration: "2:58",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "happy",
    spotifyId: "1BxfuPKGuaTgP7aM0Bbdwr"
  },
  {
    id: "30",
    title: "Vampire",
    artist: "Olivia Rodrigo",
    album: "GUTS",
    duration: "3:39",
    albumArt: "/placeholder.svg",
    genre: "Pop",
    mood: "sad",
    spotifyId: "1kuGVB7EU95pJObxwvfwKS"
  }
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

