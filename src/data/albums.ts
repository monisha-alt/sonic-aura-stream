
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
    title: "After Hours",
    artist: "The Weeknd",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    tracks: ["s1"],
    genre: ["Synth-pop", "New Wave", "Dance"]
  },
  {
    id: "al2",
    title: "When We All Fall Asleep, Where Do We Go?",
    artist: "Billie Eilish",
    cover: "https://images.unsplash.com/photo-1598387993241-dada59c16da1?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    tracks: ["s2"],
    genre: ["Electropop", "Trap", "Pop"]
  },
  {
    id: "al3",
    title: "Future Nostalgia",
    artist: "Dua Lipa",
    cover: "https://images.unsplash.com/photo-1616356607338-fd83b7e86a1b?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2020,
    tracks: ["s3", "s4"],
    genre: ["Disco", "Dance-pop", "Nu-disco"]
  },
  {
    id: "al4",
    title: "Fine Line",
    artist: "Harry Styles",
    cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    tracks: ["s5"],
    genre: ["Pop Rock", "Funk", "Indie"]
  },
  {
    id: "al5",
    title: "Hollywood's Bleeding",
    artist: "Post Malone",
    cover: "https://images.unsplash.com/photo-1618609377864-68609b857e90?q=80&w=400&h=400&auto=format&fit=crop",
    releaseYear: 2019,
    tracks: ["s6"],
    genre: ["Pop", "Alternative", "Hip-Hop"]
  }
];
