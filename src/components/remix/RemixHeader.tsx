
import React from "react";
import { Button } from "@/components/ui/button";
import { Music, Waves } from "lucide-react";

interface RemixHeaderProps {
  previewMode: boolean;
  handlePreview: () => void;
  songId?: string;
}

const RemixHeader = ({ previewMode, handlePreview, songId }: RemixHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold flex items-center">
        <Music className="mr-2 h-6 w-6 text-purple-500" /> 
        Remix Studio
      </h2>
      <Button
        onClick={handlePreview}
        variant={previewMode ? "secondary" : "outline"}
        className={previewMode ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
      >
        <Waves className="mr-2 h-4 w-4" />
        {previewMode ? "Exit Preview" : "Preview Remix"}
      </Button>
    </div>
  );
};

export default RemixHeader;
