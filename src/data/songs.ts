
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
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:22",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["Synth-pop", "New Wave", "Dance"],
    audioSrc: "/audio/sample1.mp3"
  },
  {
    id: "s2",
    title: "bad guy",
    artist: "Billie Eilish",
    album: "When We All Fall Asleep, Where Do We Go?",
    duration: "3:14",
    cover: "https://images.unsplash.com/photo-1598387993241-dada59c16da1?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Electropop", "Trap", "Pop"],
    audioSrc: "/audio/sample2.mp3"
  },
  {
    id: "s3",
    title: "Don't Start Now",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:03",
    cover: "https://images.unsplash.com/photo-1616356607338-fd83b7e86a1b?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Disco", "Dance-pop", "Nu-disco"],
    audioSrc: "/audio/sample3.mp3"
  },
  {
    id: "s4",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    cover: "https://images.unsplash.com/photo-1616356607338-fd83b7e86a1b?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["Dance-pop", "Disco"],
    audioSrc: "/audio/sample4.mp3"
  },
  {
    id: "s5",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: "2:54",
    cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Pop Rock", "Funk", "Indie"],
    audioSrc: "/audio/sample5.mp3"
  },
  {
    id: "s6",
    title: "Circles",
    artist: "Post Malone",
    album: "Hollywood's Bleeding",
    duration: "3:35",
    cover: "https://images.unsplash.com/photo-1618609377864-68609b857e90?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Pop", "Alternative", "Hip-Hop"],
    audioSrc: "/audio/sample6.mp3"
  },
  {
    id: "s7",
    title: "Savage Love",
    artist: "Jawsh 685 & Jason Derulo",
    album: "Savage Love (Laxed - Siren Beat)",
    duration: "2:58",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["R&B", "Pop", "Reggae"],
    audioSrc: "/audio/sample7.mp3"
  },
  {
    id: "s8",
    title: "Dynamite",
    artist: "BTS",
    album: "BE",
    duration: "3:19",
    cover: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["Disco-pop", "K-pop"],
    audioSrc: "/audio/sample8.mp3"
  },
  {
    id: "s9",
    title: "Before You Go",
    artist: "Lewis Capaldi",
    album: "Divinely Uninspired to a Hellish Extent",
    duration: "3:35",
    cover: "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    genre: ["Pop", "Soul"],
    audioSrc: "/audio/sample9.mp3"
  },
  {
    id: "s10",
    title: "Mood",
    artist: "24kGoldn ft. iann dior",
    album: "El Dorado",
    duration: "2:21",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    genre: ["Hip Hop", "Alternative Rock", "Pop Rap"],
    audioSrc: "/audio/sample10.mp3"
  }
];
