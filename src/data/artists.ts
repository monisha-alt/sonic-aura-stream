
export interface ArtistType {
  id: string;
  name: string;
  image: string;
  bio: string;
  genres: string[];
  popularSongs: string[];
  albums: string[];
  languages: string[];
  country: string;
}

export const artists: ArtistType[] = [
  {
    id: "a1",
    name: "The Weeknd",
    image: "https://images.unsplash.com/photo-1621153359446-75218a80796a?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer, songwriter, and record producer.",
    genres: ["R&B", "Pop", "Synth-pop"],
    popularSongs: ["s1"],
    albums: ["After Hours"],
    languages: ["English"],
    country: "Canada"
  },
  {
    id: "a2",
    name: "Luis Fonsi",
    image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Luis Alfonso Rodríguez López-Cepero, known professionally as Luis Fonsi, is a Puerto Rican singer and songwriter.",
    genres: ["Latin Pop", "Reggaeton"],
    popularSongs: ["s2"],
    albums: ["Vida"],
    languages: ["Spanish", "English"],
    country: "Puerto Rico"
  },
  {
    id: "a3",
    name: "BTS",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "BTS is a South Korean boy band formed by Big Hit Entertainment. The band consists of seven members.",
    genres: ["K-pop", "Hip Hop", "R&B"],
    popularSongs: ["s3"],
    albums: ["BE"],
    languages: ["Korean", "English", "Japanese"],
    country: "South Korea"
  },
  {
    id: "a4",
    name: "Zaz",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Isabelle Geffroy, better known by the stage name Zaz, is a French singer-songwriter who mixes jazz with soul and acoustic music.",
    genres: ["French Pop", "Jazz", "Soul"],
    popularSongs: ["s4"],
    albums: ["Paris"],
    languages: ["French"],
    country: "France"
  },
  {
    id: "a5",
    name: "Il Professore",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Traditional Italian folk music performer known for contemporary interpretations of classic Italian songs.",
    genres: ["Folk", "Traditional"],
    popularSongs: ["s5"],
    albums: ["Italian Classics"],
    languages: ["Italian"],
    country: "Italy"
  }
];
