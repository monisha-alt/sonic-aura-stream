
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MoodGenerator = () => {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const moods = ["Happy", "Relaxed", "Energetic", "Focused", "Melancholic"];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setIsGenerating(true);
    
    // Simulate playlist generation
    toast({
      title: "Generating Playlist",
      description: `Creating a ${mood.toLowerCase()} mood playlist just for you...`,
      duration: 2000,
    });
    
    // Simulate completion after a delay
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Playlist Ready",
        description: `Your ${mood.toLowerCase()} mood playlist has been created!`,
        duration: 3000,
      });
    }, 3000);
  };

  // Real-time mood suggestion based on time of day
  const [suggestedMood, setSuggestedMood] = useState("");
  
  useEffect(() => {
    const updateSuggestedMood = () => {
      const hour = new Date().getHours();
      let mood;
      
      if (hour >= 5 && hour < 9) mood = "Energetic"; // Morning
      else if (hour >= 9 && hour < 12) mood = "Focused"; // Work morning
      else if (hour >= 12 && hour < 15) mood = "Relaxed"; // Afternoon
      else if (hour >= 15 && hour < 19) mood = "Happy"; // Evening
      else mood = "Melancholic"; // Night
      
      setSuggestedMood(mood);
    };
    
    updateSuggestedMood();
    const interval = setInterval(updateSuggestedMood, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 p-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">AI Mood Generator</h3>
      <p className="text-sm text-gray-300 mb-4">Let our AI create a playlist based on your current mood</p>
      
      {suggestedMood && (
        <p className="text-xs text-purple-300 mb-2">
          Real-time suggestion: <span className="font-semibold">{suggestedMood}</span> music for this time of day
        </p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <Button 
            key={mood} 
            variant={mood === selectedMood ? "default" : "secondary"} 
            size="sm"
            onClick={() => handleMoodSelect(mood)}
            disabled={isGenerating}
            className={mood === suggestedMood ? "border border-purple-400" : ""}
          >
            {mood}
          </Button>
        ))}
      </div>
      
      {isGenerating && (
        <div className="mt-3 flex items-center">
          <div className="h-2 w-2 bg-purple-500 rounded-full animate-ping mr-2"></div>
          <span className="text-sm text-purple-300">Generating your personalized playlist...</span>
        </div>
      )}
    </div>
  );
};

export default MoodGenerator;
