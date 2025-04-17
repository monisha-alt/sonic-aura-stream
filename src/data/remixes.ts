
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
  type: 'bass_boost' | 'tempo' | 'echo' | 'reverb' | 'filter' | 'distortion' | 'lowpass' | 'highpass' | 'bitcrush';
  value: number; // 0-100 value representing intensity
  startTime?: string; // Optional timestamp to start effect (MM:SS)
  endTime?: string; // Optional timestamp to end effect (MM:SS)
}

export interface RemixPreset {
  name: string;
  description: string;
  effects: RemixEffect[];
}

// Remix presets for quick application
export const remixPresets: Record<string, RemixPreset> = {
  concert: {
    name: "Live Concert",
    description: "Creates a live concert atmosphere with reverb and crowd noise",
    effects: [
      { type: "reverb", value: 65 },
      { type: "bass_boost", value: 50 },
      { type: "distortion", value: 20 }
    ]
  },
  lofi: {
    name: "Lo-Fi",
    description: "Warm, relaxed lo-fi beats with vinyl crackle effect",
    effects: [
      { type: "lowpass", value: 60 },
      { type: "bitcrush", value: 25 },
      { type: "echo", value: 30 }
    ]
  },
  club: {
    name: "Club Mix",
    description: "High energy club remix with enhanced bass",
    effects: [
      { type: "bass_boost", value: 80 },
      { type: "tempo", value: 110 },
      { type: "echo", value: 20 }
    ]
  }
};

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
    },
    {
      id: "r3",
      name: "Lo-Fi Bad Guy",
      originalSongId: "s2",
      createdBy: "u1",
      createdAt: new Date("2024-04-05"),
      effects: [
        { type: "lowpass", value: 65 },
        { type: "bitcrush", value: 30 },
        { type: "tempo", value: 85 }
      ],
      isPublic: true
    }
  ]
};
