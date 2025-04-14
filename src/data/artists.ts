
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
    name: "Neural Waves",
    image: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Neural+Waves",
    bio: "A pioneering electronic music group known for their innovative use of AI in music production.",
    genres: ["Electronic", "Ambient", "AI", "Blues"],
    popularSongs: ["s1", "s6"],
    albums: ["Digital Dreamscape"]
  },
  {
    id: "a2",
    name: "The Algorithms",
    image: "https://placehold.co/400x400/6366F1/FFFFFF?text=The+Algorithms",
    bio: "Known for their energetic live performances and cutting-edge sound design.",
    genres: ["EDM", "Synthwave", "Techno", "House"],
    popularSongs: ["s2", "s7"],
    albums: ["Binary Beats"]
  },
  {
    id: "a3",
    name: "Binary Beats",
    image: "https://placehold.co/400x400/A855F7/FFFFFF?text=Binary+Beats",
    bio: "A duo that combines classical training with modern electronic production techniques.",
    genres: ["Techno", "Experimental", "Drum & Bass"],
    popularSongs: ["s3", "s8"],
    albums: ["Machine Learning"]
  },
  {
    id: "a4",
    name: "AI Collective",
    image: "https://placehold.co/400x400/EC4899/FFFFFF?text=AI+Collective",
    bio: "A collective of producers and artists exploring the boundaries of AI-generated music.",
    genres: ["Ambient", "Downtempo", "Pop", "Electronic"],
    popularSongs: ["s4", "s9"],
    albums: ["Future Sounds"]
  },
  {
    id: "a5",
    name: "Deep Learning",
    image: "https://placehold.co/400x400/F43F5E/FFFFFF?text=Deep+Learning",
    bio: "A mysterious producer known for emotional electronic compositions that blend genres.",
    genres: ["Electronic", "Soul", "Chillwave", "Ambient"],
    popularSongs: ["s5", "s10"],
    albums: ["Artificial Emotions"]
  }
];
