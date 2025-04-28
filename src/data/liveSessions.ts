
export interface LiveSessionType {
  id: string;
  name: string;
  hostId: string;
  currentSongId: string;
  isPublic: boolean;
  listeners: string[];
  startedAt: string;
  createdAt: string;
}

export const liveSessions: LiveSessionType[] = [
  {
    id: "ls1",
    name: "Weekend Vibes",
    hostId: "u1",
    currentSongId: "s1",
    isPublic: true,
    listeners: ["u1", "u2"],
    startedAt: "2025-04-28T14:30:00Z",
    createdAt: "2025-04-28T14:30:00Z"
  },
  {
    id: "ls2",
    name: "K-pop Party",
    hostId: "u2",
    currentSongId: "s3",
    isPublic: true,
    listeners: ["u2"],
    startedAt: "2025-04-28T15:45:00Z",
    createdAt: "2025-04-28T15:45:00Z"
  },
  {
    id: "ls3",
    name: "Private Latin Mix",
    hostId: "u1",
    currentSongId: "s2",
    isPublic: false,
    listeners: ["u1"],
    startedAt: "2025-04-28T16:10:00Z",
    createdAt: "2025-04-28T16:10:00Z"
  }
];
