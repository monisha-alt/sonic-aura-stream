
export interface AlbumType {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseYear: number;
  tracks: string[];
  genre: string[];
  language: string;
  mood: string[];
}

export const albums: AlbumType[] = [
  {
    id: "al1",
    title: "After Hours",
    artist: "The Weeknd",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    tracks: ["s1"],
    genre: ["Synth-pop", "New Wave", "Dance"],
    language: "English",
    mood: ["Dark", "Energetic"]
  },
  {
    id: "al2",
    title: "Vida",
    artist: "Luis Fonsi",
    cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2017,
    tracks: ["s2"],
    genre: ["Latin Pop", "Reggaeton"],
    language: "Spanish",
    mood: ["Upbeat", "Summer"]
  },
  {
    id: "al3",
    title: "BE",
    artist: "BTS",
    cover: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    tracks: ["s3"],
    genre: ["K-pop", "Disco-pop"],
    language: "Korean",
    mood: ["Happy", "Energetic"]
  },
  {
    id: "al4",
    title: "Paris",
    artist: "Zaz",
    cover: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2014,
    tracks: ["s4"],
    genre: ["French Pop", "Jazz"],
    language: "French",
    mood: ["Romantic", "Relaxed"]
  },
  {
    id: "al5",
    title: "Italian Classics",
    artist: "Il Professore",
    cover: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2018,
    tracks: ["s5"],
    genre: ["Folk", "Traditional"],
    language: "Italian",
    mood: ["Traditional", "Energetic"]
  }
];
