
import React from "react";
import { Button } from "@/components/ui/button";

const MoodGenerator = () => {
  return (
    <div className="mt-8 p-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">AI Mood Generator</h3>
      <p className="text-sm text-gray-300 mb-4">Let our AI create a playlist based on your current mood</p>
      <div className="flex flex-wrap gap-2">
        {["Happy", "Relaxed", "Energetic", "Focused", "Melancholic"].map((mood) => (
          <Button key={mood} variant="secondary" size="sm">
            {mood}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodGenerator;
