
export interface ArtistType {
  id: string;
  name: string;
  image: string;
  bio: string;
  genres: string[];
  popularSongs: string[];
  albums: string[];
}

export const artists: ArtistType[] = [
  {
    id: "a1",
    name: "The Weeknd",
    image: "https://images.unsplash.com/photo-1621153359446-75218a80796a?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer, songwriter, and record producer known for his sonic versatility and dark lyricism.",
    genres: ["R&B", "Pop", "Synth-pop", "New Wave"],
    popularSongs: ["s1"],
    albums: ["After Hours"]
  },
  {
    id: "a2",
    name: "Billie Eilish",
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Billie Eilish Pirate Baird O'Connell is an American singer-songwriter. She first gained public attention in 2015 with her debut single 'Ocean Eyes'.",
    genres: ["Electropop", "Pop", "Alternative"],
    popularSongs: ["s2"],
    albums: ["When We All Fall Asleep, Where Do We Go?"]
  },
  {
    id: "a3",
    name: "Dua Lipa",
    image: "https://images.unsplash.com/photo-1616356607338-fd83b7e86a1b?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Dua Lipa is an English and Albanian singer and songwriter. Her musical style is dance-pop, incorporating elements from various genres.",
    genres: ["Pop", "Dance", "Disco", "R&B"],
    popularSongs: ["s3", "s4"],
    albums: ["Future Nostalgia"]
  },
  {
    id: "a4",
    name: "Harry Styles",
    image: "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Harry Edward Styles is an English singer, songwriter and actor. His musical career began as a contestant on the British music competition series The X Factor.",
    genres: ["Pop Rock", "Soft Rock", "Britpop", "Indie"],
    popularSongs: ["s5"],
    albums: ["Fine Line"]
  },
  {
    id: "a5",
    name: "Post Malone",
    image: "https://images.unsplash.com/photo-1618609377864-68609b857e90?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Austin Richard Post, known professionally as Post Malone, is an American rapper, singer, songwriter, and record producer known for his introspective songwriting and laconic vocal style.",
    genres: ["Hip Hop", "Pop", "R&B", "Trap"],
    popularSongs: ["s6"],
    albums: ["Hollywood's Bleeding"]
  }
];
