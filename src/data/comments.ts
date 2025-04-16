
export interface CommentType {
  id: string;
  songId: string;
  userId: string;
  timestamp: string; // Format MM:SS
  text: string;
  createdAt: Date;
  likes: number;
}

// Initial sample comments
export const comments: Record<string, CommentType[]> = {
  "s1": [
    {
      id: "c1",
      songId: "s1",
      userId: "u1",
      timestamp: "0:45",
      text: "That synth drop is incredible!",
      createdAt: new Date("2023-10-15"),
      likes: 24
    },
    {
      id: "c2",
      songId: "s1",
      userId: "u2",
      timestamp: "2:18",
      text: "Love how the beat changes here",
      createdAt: new Date("2023-11-03"),
      likes: 16
    }
  ],
  "s2": [
    {
      id: "c3",
      songId: "s2",
      userId: "u3",
      timestamp: "1:05",
      text: "This part gives me chills every time",
      createdAt: new Date("2023-09-22"),
      likes: 31
    }
  ],
  "s3": [
    {
      id: "c4",
      songId: "s3",
      userId: "u1",
      timestamp: "0:30",
      text: "Perfect intro to the song",
      createdAt: new Date("2023-08-14"),
      likes: 19
    }
  ]
};
