
import { useState } from 'react';
import { songs } from "@/data";

export type EmotionType = "Happy" | "Sad" | "Energetic" | "Relaxed" | "Focused" | null;

export const useEmotionDetection = () => {
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType>(null);

  const detectEmotionFromText = (text: string): EmotionType => {
    const text_lower = text.toLowerCase();
    
    const happyKeywords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'awesome', 'love'];
    const sadKeywords = ['sad', 'depressed', 'unhappy', 'down', 'blue', 'terrible', 'miss'];
    const energeticKeywords = ['energetic', 'pumped', 'workout', 'run', 'active', 'party', 'dance'];
    const relaxedKeywords = ['relax', 'calm', 'peaceful', 'sleep', 'rest', 'chill', 'unwind'];
    const focusedKeywords = ['focus', 'concentrate', 'study', 'work', 'productivity', 'attention'];
    
    // Check for matches
    if (happyKeywords.some(keyword => text_lower.includes(keyword))) return "Happy";
    if (sadKeywords.some(keyword => text_lower.includes(keyword))) return "Sad";
    if (energeticKeywords.some(keyword => text_lower.includes(keyword))) return "Energetic";
    if (relaxedKeywords.some(keyword => text_lower.includes(keyword))) return "Relaxed";
    if (focusedKeywords.some(keyword => text_lower.includes(keyword))) return "Focused";
    
    // Analyze speech pattern (simplified simulation)
    const words = text_lower.split(' ');
    if (words.length > 0) {
      if (words.length > 10 && text.includes('!')) return "Energetic";
      if (words.length < 5) return "Focused";
    }
    
    return null; // No clear emotion detected
  };

  const getSongRecommendationsForEmotion = (emotion: EmotionType) => {
    if (!emotion) return [];
    
    // Filter songs based on matching mood
    const matchingSongs = songs.filter(song => 
      song.mood && song.mood.some(m => 
        m.toLowerCase() === emotion.toLowerCase() ||
        (emotion === "Happy" && (m === "Upbeat" || m === "Summer")) ||
        (emotion === "Sad" && (m === "Melancholic" || m === "Dark")) ||
        (emotion === "Energetic" && (m === "Dance" || m === "Upbeat")) ||
        (emotion === "Relaxed" && (m === "Romantic" || m === "Smooth")) ||
        (emotion === "Focused" && (m === "Revolutionary" || m === "Quirky"))
      )
    );
    
    // Return up to 3 song recommendations
    return matchingSongs.slice(0, 3);
  };

  return {
    detectedEmotion,
    setDetectedEmotion,
    detectEmotionFromText,
    getSongRecommendationsForEmotion
  };
};
