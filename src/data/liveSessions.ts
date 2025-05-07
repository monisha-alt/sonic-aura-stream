
export interface LiveSessionType {
  id: string;
  name: string;
  hostId: string;
  currentSongId: string;
  isPublic: boolean;
  listeners: string[];
  startedAt: string;
  createdAt: string;
  genre?: string;
  description?: string;
  imageUrl?: string;
}

export const liveSessions: LiveSessionType[] = [
  {
    id: "ls1",
    name: "Weekend Vibes",
    hostId: "u1",
    currentSongId: "s1",
    isPublic: true,
    listeners: ["u1", "u2", "u3", "u4", "u5"],
    startedAt: "2025-05-07T14:30:00Z",
    createdAt: "2025-05-07T14:30:00Z",
    genre: "Electronic",
    description: "Upbeat electronic tracks to kick off your weekend",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls2",
    name: "K-pop Party",
    hostId: "u2",
    currentSongId: "s3",
    isPublic: true,
    listeners: ["u2", "u7", "u9", "u12"],
    startedAt: "2025-05-07T15:45:00Z",
    createdAt: "2025-05-07T15:45:00Z",
    genre: "K-pop",
    description: "Non-stop K-pop hits all day long",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls3",
    name: "Private Latin Mix",
    hostId: "u1",
    currentSongId: "s2",
    isPublic: false,
    listeners: ["u1", "u3"],
    startedAt: "2025-05-07T16:10:00Z",
    createdAt: "2025-05-07T16:10:00Z",
    genre: "Latin",
    description: "Private session with the best Latin songs",
    imageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls4",
    name: "Jazz & Chill",
    hostId: "u3",
    currentSongId: "s4",
    isPublic: true,
    listeners: ["u3", "u5", "u8"],
    startedAt: "2025-05-07T17:20:00Z",
    createdAt: "2025-05-07T17:20:00Z",
    genre: "Jazz",
    description: "Smooth jazz classics for relaxation",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls5",
    name: "Global Folk Treasures",
    hostId: "u2",
    currentSongId: "s5",
    isPublic: true,
    listeners: ["u2", "u4", "u6", "u10"],
    startedAt: "2025-05-07T18:00:00Z",
    createdAt: "2025-05-07T18:00:00Z",
    genre: "Folk",
    description: "Discover traditional folk music from around the world",
    imageUrl: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls6",
    name: "EDM Workout Mix",
    hostId: "u4",
    currentSongId: "s1",
    isPublic: true,
    listeners: ["u4", "u7", "u11", "u13", "u14", "u15"],
    startedAt: "2025-05-07T19:15:00Z",
    createdAt: "2025-05-07T19:15:00Z",
    genre: "EDM",
    description: "High energy electronic dance music to power your workout",
    imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls7",
    name: "French Classics",
    hostId: "u5",
    currentSongId: "s4",
    isPublic: false,
    listeners: ["u5", "u9"],
    startedAt: "2025-05-07T20:30:00Z",
    createdAt: "2025-05-07T20:30:00Z",
    genre: "French Pop",
    description: "Classic French songs and contemporary hits",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&h=400&auto=format&fit=crop"
  },
  {
    id: "ls8",
    name: "Hip-Hop Essentials",
    hostId: "u6",
    currentSongId: "s1",
    isPublic: true,
    listeners: ["u6", "u8", "u10", "u12", "u15"],
    startedAt: "2025-05-07T21:45:00Z",
    createdAt: "2025-05-07T21:45:00Z",
    genre: "Hip-Hop",
    description: "The best hip-hop tracks from past and present",
    imageUrl: "https://images.unsplash.com/photo-1621153359446-75218a80796a?q=80&w=400&h=400&auto=format&fit=crop"
  }
];
