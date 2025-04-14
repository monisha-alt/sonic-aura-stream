
export interface UserType {
  id: string;
  name: string;
  avatar: string;
  email: string;
  favoriteArtists: string[];
  favoriteSongs: string[];
  playlists: string[];
  recentlyPlayed: string[];
  listeningHistory: {
    songId: string;
    timestamp: string;
  }[];
}

export const users: UserType[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    avatar: "https://placehold.co/200x200/6366F1/FFFFFF?text=Alex",
    email: "alex@example.com",
    favoriteArtists: ["a1", "a4"],
    favoriteSongs: ["s1", "s4", "s9"],
    playlists: ["p2", "p5"],
    recentlyPlayed: ["s4", "s1", "s10", "s3"],
    listeningHistory: [
      { songId: "s4", timestamp: "2025-04-13T18:30:00Z" },
      { songId: "s1", timestamp: "2025-04-13T17:45:00Z" },
      { songId: "s10", timestamp: "2025-04-13T14:20:00Z" },
      { songId: "s3", timestamp: "2025-04-12T21:15:00Z" }
    ]
  },
  {
    id: "u2",
    name: "Maya Patel",
    avatar: "https://placehold.co/200x200/8B5CF6/FFFFFF?text=Maya",
    email: "maya@example.com",
    favoriteArtists: ["a2", "a3", "a5"],
    favoriteSongs: ["s2", "s5", "s8"],
    playlists: ["p1", "p3"],
    recentlyPlayed: ["s2", "s6", "s5", "s7"],
    listeningHistory: [
      { songId: "s2", timestamp: "2025-04-14T09:10:00Z" },
      { songId: "s6", timestamp: "2025-04-14T08:30:00Z" },
      { songId: "s5", timestamp: "2025-04-13T22:40:00Z" },
      { songId: "s7", timestamp: "2025-04-13T19:15:00Z" }
    ]
  }
];
