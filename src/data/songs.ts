
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
  listens?: number;
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
    audioSrc: "/audio/sample1.mp3",
    listens: 2458904
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
    audioSrc: "/audio/sample2.mp3",
    listens: 7890345
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
    audioSrc: "/audio/sample3.mp3",
    listens: 5674321
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
    audioSrc: "/audio/sample4.mp3",
    listens: 1245678
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
    audioSrc: "/audio/sample5.mp3",
    listens: 3456789
  },
  {
    id: "s6",
    title: "Dance Monkey",
    artist: "Tones and I",
    album: "The Kids Are Coming",
    duration: "3:29",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Pop", "Electropop"],
    language: "English",
    mood: ["Energetic", "Quirky"],
    audioSrc: "/audio/sample6.mp3",
    listens: 6543210
  },
  {
    id: "s7",
    title: "Bad Guy",
    artist: "Billie Eilish",
    album: "When We All Fall Asleep",
    duration: "3:14",
    cover: "https://images.unsplash.com/photo-1593697972646-2f348871bd56?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Electropop", "Pop"],
    language: "English",
    mood: ["Dark", "Mischievous"],
    audioSrc: "/audio/sample7.mp3",
    listens: 5432109
  },
  {
    id: "s8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "3:54",
    cover: "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2017,
    genre: ["Pop", "R&B"],
    language: "English",
    mood: ["Romantic", "Upbeat"],
    audioSrc: "/audio/sample8.mp3",
    listens: 9876543
  },
  {
    id: "s9",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["Dance-pop", "Disco"],
    language: "English",
    mood: ["Upbeat", "Energetic"],
    audioSrc: "/audio/sample9.mp3",
    listens: 4321098
  },
  {
    id: "s10",
    title: "Butter",
    artist: "BTS",
    album: "Single",
    duration: "2:59",
    cover: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2021,
    genre: ["K-pop", "Dance-pop"],
    language: "English",
    mood: ["Happy", "Smooth"],
    audioSrc: "/audio/sample10.mp3",
    listens: 7654321
  }
];
