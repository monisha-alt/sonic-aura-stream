
import React from "react";
import { Button } from "@/components/ui/button";
import { Music, Waves } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { songs } from "@/data";

interface RemixHeaderProps {
  previewMode: boolean;
  handlePreview: () => void;
  songId?: string;
}

const RemixHeader = ({ previewMode, handlePreview, songId }: RemixHeaderProps) => {
  const currentSong = songId ? songs.find(s => s.id === songId) : null;
  
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold flex items-center">
        <Music className="mr-2 h-6 w-6 text-purple-500" /> 
        Remix Studio
        {currentSong && (
          <span className="ml-2 text-lg font-normal text-gray-400">
            | {currentSong.title} by {currentSong.artist}
          </span>
        )}
      </h2>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          onClick={handlePreview}
          variant={previewMode ? "secondary" : "outline"}
          className={previewMode ? "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-800 dark:hover:bg-purple-700 dark:text-white" : ""}
        >
          <Waves className="mr-2 h-4 w-4" />
          {previewMode ? "Exit Preview" : "Preview Remix"}
        </Button>
      </div>
    </div>
  );
};

export default RemixHeader;
