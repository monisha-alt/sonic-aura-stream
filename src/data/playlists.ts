
export interface PlaylistType {
  id: string;
  name: string;
  cover: string;
  description: string;
  tracks: string[];
  createdBy: string;
  mood?: string;
  isPublic: boolean;
}

export const playlists: PlaylistType[] = [
  {
    id: "p1",
    name: "Electronic Essentials",
    cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Electronic+Essentials",
    description: "The best electronic tracks to get you in the zone",
    tracks: ["s1", "s3", "s5", "s7", "s9"],
    createdBy: "system",
    isPublic: true
  },
  {
    id: "p2",
    name: "Ambient Focus",
    cover: "https://placehold.co/400x400/6366F1/FFFFFF?text=Ambient+Focus",
    description: "Perfect background music for deep work and concentration",
    tracks: ["s1", "s4", "s10"],
    createdBy: "system",
    mood: "Focused",
    isPublic: true
  },
  {
    id: "p3",
    name: "AI-Generated Hits",
    cover: "https://placehold.co/400x400/A855F7/FFFFFF?text=AI-Generated+Hits",
    description: "Top tracks created with the help of artificial intelligence",
    tracks: ["s2", "s4", "s6", "s8", "s10"],
    createdBy: "system",
    isPublic: true
  },
  {
    id: "p4",
    name: "Upbeat Energy",
    cover: "https://placehold.co/400x400/EC4899/FFFFFF?text=Upbeat+Energy",
    description: "High-energy tracks to boost your mood",
    tracks: ["s2", "s7", "s9"],
    createdBy: "system",
    mood: "Energetic",
    isPublic: true
  },
  {
    id: "p5",
    name: "Chill Evening",
    cover: "https://placehold.co/400x400/F43F5E/FFFFFF?text=Chill+Evening",
    description: "Relaxing tracks to wind down after a long day",
    tracks: ["s3", "s5", "s10"],
    createdBy: "system",
    mood: "Relaxed",
    isPublic: true
  }
];
