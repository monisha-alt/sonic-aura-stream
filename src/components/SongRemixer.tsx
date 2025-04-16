
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { songs, remixes as allRemixes, RemixType, RemixEffect } from "@/data";
import RemixHeader from "./remix/RemixHeader";
import SongVisualizer from "./remix/SongVisualizer";
import CreateRemixForm from "./remix/CreateRemixForm";
import SavedRemixes from "./remix/SavedRemixes";
import { effectTypeLabels } from "./remix/remixUtils";

interface SongRemixerProps {
  songId: string;
}

interface RemixFormValues {
  name: string;
  effects: RemixEffect[];
  isPublic: boolean;
}

const SongRemixer = ({ songId }: SongRemixerProps) => {
  const { toast } = useToast();
  const [currentSong, setCurrentSong] = useState<typeof songs[0] | null>(null);
  const [remixes, setRemixes] = useState<RemixType[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Find the song
    const foundSong = songs.find(s => s.id === songId);
    setCurrentSong(foundSong || null);
    
    // Get remixes for this song
    if (allRemixes[songId]) {
      setRemixes(allRemixes[songId]);
    }
  }, [songId]);

  const handleSaveRemix = (data: RemixFormValues) => {
    const newRemix: RemixType = {
      id: `r${Date.now()}`,
      name: data.name,
      originalSongId: songId,
      createdBy: "currentUser", // In a real app, this would be the logged-in user's ID
      createdAt: new Date(),
      effects: data.effects,
      isPublic: data.isPublic
    };

    // Add to remixes list
    setRemixes((prev) => [newRemix, ...prev]);
    
    toast({
      title: "Remix saved!",
      description: `Your remix "${data.name}" has been saved.`,
      duration: 3000,
    });
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    setIsPlaying(false);
    
    if (!previewMode) {
      toast({
        title: "Preview mode activated",
        description: "Now you can hear your remix effects in action!",
        duration: 2000,
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `${previewMode ? "Remix preview" : "Original song"}`,
      duration: 1500,
    });
  };

  if (!currentSong) {
    return <div className="text-center p-8">Song not found</div>;
  }

  return (
    <div className="space-y-6">
      <RemixHeader 
        previewMode={previewMode} 
        handlePreview={handlePreview} 
      />

      <SongVisualizer 
        currentSong={currentSong}
        isPlaying={isPlaying}
        handlePlayPause={handlePlayPause}
      />

      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Remix</TabsTrigger>
          <TabsTrigger value="saved">Saved Remixes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="p-4 bg-gray-800 bg-opacity-30 rounded-lg">
          <CreateRemixForm onSave={handleSaveRemix} />
        </TabsContent>
        
        <TabsContent value="saved" className="p-4 bg-gray-800 bg-opacity-30 rounded-lg">
          <SavedRemixes remixes={remixes} effectTypeLabels={effectTypeLabels} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SongRemixer;
