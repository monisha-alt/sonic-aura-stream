
export interface SongType {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  releaseYear: number;
  genre: string[];
  language: string;
  mood: string[];
  audioSrc?: string;
}

export const songs: SongType[] = [
  {
    id: "s1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:22",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["Synth-pop", "New Wave", "Dance"],
    language: "English",
    mood: ["Energetic", "Upbeat"],
    audioSrc: "/audio/sample1.mp3"
  },
  {
    id: "s2",
    title: "Despacito",
    artist: "Luis Fonsi",
    album: "Vida",
    duration: "3:48",
    cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2017,
    genre: ["Latin Pop", "Reggaeton"],
    language: "Spanish",
    mood: ["Dance", "Summer"],
    audioSrc: "/audio/sample2.mp3"
  },
  {
    id: "s3",
    title: "Dynamite",
    artist: "BTS",
    album: "BE",
    duration: "3:19",
    cover: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["K-pop", "Disco-pop"],
    language: "Korean",
    mood: ["Happy", "Energetic"],
    audioSrc: "/audio/sample3.mp3"
  },
  {
    id: "s4",
    title: "Mon Amour",
    artist: "Zaz",
    album: "Paris",
    duration: "3:34",
    cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2014,
    genre: ["French Pop", "Jazz"],
    language: "French",
    mood: ["Romantic", "Relaxed"],
    audioSrc: "/audio/sample4.mp3"
  },
  {
    id: "s5",
    title: "Bella Ciao",
    artist: "Il Professore",
    album: "Italian Classics",
    duration: "2:45",
    cover: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2018,
    genre: ["Folk", "Traditional"],
    language: "Italian",
    mood: ["Revolutionary", "Energetic"],
    audioSrc: "/audio/sample5.mp3"
  }
];
