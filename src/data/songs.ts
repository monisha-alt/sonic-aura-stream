
export interface SongType {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  releaseYear: number;
  genre: string[];
  audioSrc?: string;
}

export const songs: SongType[] = [
  {
    id: "s1",
    title: "Cosmic Harmony",
    artist: "Neural Waves",
    album: "Digital Dreamscape",
    duration: "3:45",
    cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Cosmic+Harmony",
    releaseYear: 2023,
    genre: ["Electronic", "Ambient", "AI"],
    audioSrc: "/audio/sample1.mp3"
  },
  {
    id: "s2",
    title: "Digital Dreams",
    artist: "The Algorithms",
    album: "Binary Beats",
    duration: "4:12",
    cover: "https://placehold.co/400x400/6366F1/FFFFFF?text=Digital+Dreams",
    releaseYear: 2024,
    genre: ["EDM", "Synthwave"],
    audioSrc: "/audio/sample2.mp3"
  },
  {
    id: "s3",
    title: "Neural Network",
    artist: "Binary Beats",
    album: "Machine Learning",
    duration: "3:28",
    cover: "https://placehold.co/400x400/A855F7/FFFFFF?text=Neural+Network",
    releaseYear: 2023,
    genre: ["Techno", "Experimental"],
    audioSrc: "/audio/sample3.mp3"
  },
  {
    id: "s4",
    title: "Quantum Waves",
    artist: "AI Collective",
    album: "Future Sounds",
    duration: "5:01",
    cover: "https://placehold.co/400x400/EC4899/FFFFFF?text=Quantum+Waves",
    releaseYear: 2024,
    genre: ["Ambient", "Downtempo"],
    audioSrc: "/audio/sample4.mp3"
  },
  {
    id: "s5",
    title: "Synthetic Soul",
    artist: "Deep Learning",
    album: "Artificial Emotions",
    duration: "3:56",
    cover: "https://placehold.co/400x400/F43F5E/FFFFFF?text=Synthetic+Soul",
    releaseYear: 2023,
    genre: ["Electronic", "Soul"],
    audioSrc: "/audio/sample5.mp3"
  },
  {
    id: "s6",
    title: "Algorithm Blues",
    artist: "Neural Waves",
    album: "Digital Dreamscape",
    duration: "4:22",
    cover: "https://placehold.co/400x400/3B82F6/FFFFFF?text=Algorithm+Blues",
    releaseYear: 2023,
    genre: ["Blues", "Electronic"],
    audioSrc: "/audio/sample6.mp3"
  },
  {
    id: "s7",
    title: "Silicon Valley",
    artist: "The Algorithms",
    album: "Binary Beats",
    duration: "3:15",
    cover: "https://placehold.co/400x400/10B981/FFFFFF?text=Silicon+Valley",
    releaseYear: 2024,
    genre: ["Techno", "House"],
    audioSrc: "/audio/sample7.mp3"
  },
  {
    id: "s8",
    title: "Data Stream",
    artist: "Binary Beats",
    album: "Machine Learning",
    duration: "4:45",
    cover: "https://placehold.co/400x400/6366F1/FFFFFF?text=Data+Stream",
    releaseYear: 2023,
    genre: ["Drum & Bass", "Electronic"],
    audioSrc: "/audio/sample8.mp3"
  },
  {
    id: "s9",
    title: "Virtual Reality",
    artist: "AI Collective",
    album: "Future Sounds",
    duration: "3:33",
    cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Virtual+Reality",
    releaseYear: 2024,
    genre: ["Pop", "Electronic"],
    audioSrc: "/audio/sample9.mp3"
  },
  {
    id: "s10",
    title: "Electric Dreams",
    artist: "Deep Learning",
    album: "Artificial Emotions",
    duration: "5:12",
    cover: "https://placehold.co/400x400/EC4899/FFFFFF?text=Electric+Dreams",
    releaseYear: 2023,
    genre: ["Chillwave", "Ambient"],
    audioSrc: "/audio/sample10.mp3"
  }
];
