
export interface RemixType {
  id: string;
  name: string;
  originalSongId: string;
  createdBy: string;
  createdAt: Date;
  effects: RemixEffect[];
  isPublic: boolean;
}

export interface RemixEffect {
  type: 'bass_boost' | 'tempo' | 'echo' | 'reverb' | 'filter';
  value: number; // 0-100 value representing intensity
  startTime?: string; // Optional timestamp to start effect (MM:SS)
  endTime?: string; // Optional timestamp to end effect (MM:SS)
}

// Sample remixes data
export const remixes: Record<string, RemixType[]> = {
  "s1": [
    {
      id: "r1",
      name: "Concert Hall Blinding Lights",
      originalSongId: "s1",
      createdBy: "u1",
      createdAt: new Date("2024-03-15"),
      effects: [
        { type: "reverb", value: 70 },
        { type: "bass_boost", value: 60, startTime: "0:45", endTime: "1:30" }
      ],
      isPublic: true
    }
  ],
  "s2": [
    {
      id: "r2",
      name: "DJ Remix - Bad Guy",
      originalSongId: "s2",
      createdBy: "u2",
      createdAt: new Date("2024-02-22"),
      effects: [
        { type: "tempo", value: 110 },
        { type: "echo", value: 40 }
      ],
      isPublic: true
    }
  ]
};
