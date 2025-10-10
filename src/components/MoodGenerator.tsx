import React, { useMemo, useState } from "react";
import { useEmotionDetection } from "@/hooks/useEmotionDetection";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MoodGenerator = () => {
  const { detectedEmotion, setDetectedEmotion, detectEmotionFromText, getSongRecommendationsForEmotion } = useEmotionDetection();
  const [text, setText] = useState("");
  const recs = useMemo(() => getSongRecommendationsForEmotion(detectedEmotion), [detectedEmotion, getSongRecommendationsForEmotion]);

  return (
    <Card className="mt-6 bg-gray-800 border-gray-700">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Mood-based picks</div>
            <div className="text-xs text-gray-400">Type how you feel to personalize</div>
          </div>
          <div className="text-sm text-purple-400 font-medium">{detectedEmotion ?? "No emotion detected"}</div>
        </div>
        <div className="flex gap-2">
          <Input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., I'm excited for a workout!"
            className="bg-gray-900 border-gray-700"
          />
          <Button
            onClick={() => setDetectedEmotion(detectEmotionFromText(text))}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Detect
          </Button>
        </div>
        {recs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
            {recs.map((song) => (
              <div key={song.id} className="bg-gray-900 rounded-md p-2 border border-gray-700">
                <img src={song.cover} alt={song.title} className="rounded mb-2 aspect-square object-cover" />
                <div className="text-sm font-semibold truncate">{song.title}</div>
                <div className="text-xs text-gray-400 truncate">{song.artist}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodGenerator;

