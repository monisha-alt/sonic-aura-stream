
export interface AlbumType {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseYear: number;
  tracks: string[];
  genre: string[];
}

export const albums: AlbumType[] = [
  {
    id: "al1",
    title: "Digital Dreamscape",
    artist: "Neural Waves",
    cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Digital+Dreamscape",
    releaseYear: 2023,
    tracks: ["s1", "s6"],
    genre: ["Electronic", "Ambient", "AI"]
  },
  {
    id: "al2",
    title: "Binary Beats",
    artist: "The Algorithms",
    cover: "https://placehold.co/400x400/6366F1/FFFFFF?text=Binary+Beats",
    releaseYear: 2024,
    tracks: ["s2", "s7"],
    genre: ["EDM", "Synthwave", "Techno", "House"]
  },
  {
    id: "al3",
    title: "Machine Learning",
    artist: "Binary Beats",
    cover: "https://placehold.co/400x400/A855F7/FFFFFF?text=Machine+Learning",
    releaseYear: 2023,
    tracks: ["s3", "s8"],
    genre: ["Techno", "Experimental", "Drum & Bass"]
  },
  {
    id: "al4",
    title: "Future Sounds",
    artist: "AI Collective",
    cover: "https://placehold.co/400x400/EC4899/FFFFFF?text=Future+Sounds",
    releaseYear: 2024,
    tracks: ["s4", "s9"],
    genre: ["Ambient", "Downtempo", "Pop"]
  },
  {
    id: "al5",
    title: "Artificial Emotions",
    artist: "Deep Learning",
    cover: "https://placehold.co/400x400/F43F5E/FFFFFF?text=Artificial+Emotions",
    releaseYear: 2023,
    tracks: ["s5", "s10"],
    genre: ["Electronic", "Soul", "Chillwave"]
  }
];
