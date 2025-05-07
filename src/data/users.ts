
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
      { songId: "s4", timestamp: "2025-05-06T18:30:00Z" },
      { songId: "s1", timestamp: "2025-05-06T17:45:00Z" },
      { songId: "s10", timestamp: "2025-05-06T14:20:00Z" },
      { songId: "s3", timestamp: "2025-05-05T21:15:00Z" }
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
      { songId: "s2", timestamp: "2025-05-07T09:10:00Z" },
      { songId: "s6", timestamp: "2025-05-07T08:30:00Z" },
      { songId: "s5", timestamp: "2025-05-06T22:40:00Z" },
      { songId: "s7", timestamp: "2025-05-06T19:15:00Z" }
    ]
  },
  {
    id: "u3",
    name: "James Wilson",
    avatar: "https://placehold.co/200x200/EC4899/FFFFFF?text=James",
    email: "james@example.com",
    favoriteArtists: ["a1", "a4"],
    favoriteSongs: ["s4", "s1"],
    playlists: ["p5"],
    recentlyPlayed: ["s4", "s1", "s3"],
    listeningHistory: [
      { songId: "s4", timestamp: "2025-05-07T12:30:00Z" },
      { songId: "s1", timestamp: "2025-05-07T10:15:00Z" },
      { songId: "s3", timestamp: "2025-05-06T18:45:00Z" }
    ]
  },
  {
    id: "u4",
    name: "Sarah Kim",
    avatar: "https://placehold.co/200x200/F43F5E/FFFFFF?text=Sarah",
    email: "sarah@example.com",
    favoriteArtists: ["a3", "a5"],
    favoriteSongs: ["s3", "s5"],
    playlists: ["p1", "p4"],
    recentlyPlayed: ["s3", "s5", "s7"],
    listeningHistory: [
      { songId: "s3", timestamp: "2025-05-07T14:20:00Z" },
      { songId: "s5", timestamp: "2025-05-07T11:05:00Z" },
      { songId: "s7", timestamp: "2025-05-06T21:30:00Z" }
    ]
  },
  {
    id: "u5",
    name: "David Chen",
    avatar: "https://placehold.co/200x200/10B981/FFFFFF?text=David",
    email: "david@example.com",
    favoriteArtists: ["a2", "a4"],
    favoriteSongs: ["s2", "s4"],
    playlists: ["p3", "p5"],
    recentlyPlayed: ["s2", "s4", "s6"],
    listeningHistory: [
      { songId: "s2", timestamp: "2025-05-07T15:40:00Z" },
      { songId: "s4", timestamp: "2025-05-07T13:25:00Z" },
      { songId: "s6", timestamp: "2025-05-06T20:10:00Z" }
    ]
  },
  // Additional users without extensive details
  {
    id: "u6",
    name: "Emma Rodriguez",
    avatar: "https://placehold.co/200x200/14B8A6/FFFFFF?text=Emma",
    email: "emma@example.com",
    favoriteArtists: ["a1", "a3"],
    favoriteSongs: ["s1", "s3"],
    playlists: ["p2", "p4"],
    recentlyPlayed: ["s1", "s3"],
    listeningHistory: []
  },
  {
    id: "u7",
    name: "Michael Lee",
    avatar: "https://placehold.co/200x200/3B82F6/FFFFFF?text=Michael",
    email: "michael@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u8",
    name: "Olivia Smith",
    avatar: "https://placehold.co/200x200/A855F7/FFFFFF?text=Olivia",
    email: "olivia@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u9",
    name: "Noah Garcia",
    avatar: "https://placehold.co/200x200/6366F1/FFFFFF?text=Noah",
    email: "noah@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u10",
    name: "Sophia Martinez",
    avatar: "https://placehold.co/200x200/8B5CF6/FFFFFF?text=Sophia",
    email: "sophia@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u11",
    name: "Liam Brown",
    avatar: "https://placehold.co/200x200/EC4899/FFFFFF?text=Liam",
    email: "liam@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u12",
    name: "Ava Taylor",
    avatar: "https://placehold.co/200x200/F43F5E/FFFFFF?text=Ava",
    email: "ava@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u13",
    name: "Ethan Wilson",
    avatar: "https://placehold.co/200x200/10B981/FFFFFF?text=Ethan",
    email: "ethan@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u14",
    name: "Isabella Clark",
    avatar: "https://placehold.co/200x200/14B8A6/FFFFFF?text=Isabella",
    email: "isabella@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  },
  {
    id: "u15",
    name: "Lucas Anderson",
    avatar: "https://placehold.co/200x200/3B82F6/FFFFFF?text=Lucas",
    email: "lucas@example.com",
    favoriteArtists: [],
    favoriteSongs: [],
    playlists: [],
    recentlyPlayed: [],
    listeningHistory: []
  }
];
