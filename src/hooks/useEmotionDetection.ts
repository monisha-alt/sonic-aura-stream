
import { useState } from "react";
import { useSongs } from "./useSongs";

export type EmotionType = "happy" | "sad" | "energetic" | "calm" | "angry" | "romantic" | "nostalgic";

export const useEmotionDetection = () => {
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType | null>(null);
  const { data: songs = [] } = useSongs();

  const detectEmotionFromText = (text: string): EmotionType | null => {
    const lowerText = text.toLowerCase();
    
    // Enhanced emotion detection patterns
    const emotionPatterns: { [key in EmotionType]: string[] } = {
      happy: ["happy", "joy", "excited", "cheerful", "upbeat", "positive", "great", "amazing", "wonderful", "fantastic"],
      sad: ["sad", "depressed", "down", "melancholy", "blue", "tearful", "crying", "heartbroken", "lonely", "empty"],
      energetic: ["energy", "pump", "workout", "gym", "run", "dance", "party", "hype", "intense", "powerful"],
      calm: ["calm", "relax", "peaceful", "chill", "zen", "meditate", "quiet", "serene", "tranquil", "soothing"],
      angry: ["angry", "mad", "frustrated", "rage", "furious", "annoyed", "pissed", "irritated", "livid"],
      romantic: ["love", "romance", "heart", "kiss", "valentine", "date", "crush", "passion", "tender", "sweet"],
      nostalgic: ["memory", "past", "nostalgia", "remember", "childhood", "old", "vintage", "classic", "throwback"]
    };

    for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        return emotion as EmotionType;
      }
    }

    return null;
  };

  const getSongRecommendationsForEmotion = (emotion: EmotionType | null) => {
    if (!emotion || songs.length === 0) return [];

    // Map emotions to song moods
    const emotionToMoodMap: { [key in EmotionType]: string[] } = {
      happy: ["Happy", "Upbeat", "Energetic", "Feel-good"],
      sad: ["Sad", "Melancholy", "Emotional", "Dark"],
      energetic: ["Energetic", "Dance", "Upbeat", "High-energy"],
      calm: ["Relaxed", "Chill", "Peaceful", "Ambient"],
      angry: ["Intense", "Dark", "Aggressive", "Heavy"],
      romantic: ["Romantic", "Love", "Tender", "Sweet"],
      nostalgic: ["Nostalgic", "Classic", "Vintage", "Retro"]
    };

    const targetMoods = emotionToMoodMap[emotion];
    
    // Filter songs by matching moods
    const matchingSongs = songs.filter(song => 
      song.mood && song.mood.some(mood => 
        targetMoods.some(targetMood => 
          mood.toLowerCase().includes(targetMood.toLowerCase())
        )
      )
    );

    // Return up to 3 recommendations
    return matchingSongs.slice(0, 3).map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      cover: song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'
    }));
  };

  return {
    detectedEmotion,
    setDetectedEmotion,
    detectEmotionFromText,
    getSongRecommendationsForEmotion
  };
};
