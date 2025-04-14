
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Search, Heart, Settings, User, Disc, List } from "lucide-react";

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "Cosmic Harmony",
    artist: "Neural Waves",
    duration: "3:45",
    cover: "https://placehold.co/400x400/8B5CF6/FFFFFF?text=Cosmic+Harmony"
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([30]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const { toast } = useToast();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `${currentSong.title} by ${currentSong.artist}`,
      duration: 2000,
    });
  };

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
    toast({
      title: aiModeEnabled ? "AI Mode Disabled" : "AI Mode Enabled",
      description: aiModeEnabled 
        ? "Switched to standard recommendations" 
        : "Personalizing your music experience with AI",
      duration: 3000,
    });
  };

  // Mock recommended songs
  const recommendedSongs = [
    { id: 1, title: "Digital Dreams", artist: "The Algorithms", duration: "4:12" },
    { id: 2, title: "Neural Network", artist: "Binary Beats", duration: "3:28" },
    { id: 3, title: "Quantum Waves", artist: "AI Collective", duration: "5:01" },
    { id: 4, title: "Synthetic Soul", artist: "Deep Learning", duration: "3:56" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Music className="h-8 w-8 text-purple-500" />
          <h1 className="text-xl font-bold">Sonic Aura</h1>
        </div>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-8 bg-gray-800 border-gray-700 focus:border-purple-500 placeholder:text-gray-500" 
              placeholder="Search for songs, artists, or albums" 
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 p-4 border-r border-gray-700 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Your Library</h2>
            <div className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
              <List className="h-5 w-5" />
              <span>Playlists</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
              <Disc className="h-5 w-5" />
              <span>Albums</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">AI Features</h2>
            <div className="space-y-2 p-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ai-mode">AI Mode</Label>
                <Switch id="ai-mode" checked={aiModeEnabled} onCheckedChange={handleAiModeToggle} />
              </div>
              <p className="text-xs text-gray-400">Enhance your music experience with personalized AI recommendations</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-6">Your AI-Powered Recommendations</h2>
          
          {/* Current Song */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <img 
                src={currentSong.cover} 
                alt={`${currentSong.title} by ${currentSong.artist}`}
                className="w-48 h-48 rounded-lg shadow-lg"
              />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{currentSong.title}</h3>
                <p className="text-gray-300">{currentSong.artist}</p>
                <p className="text-gray-400">Duration: {currentSong.duration}</p>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Favorites
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Recommended Based on Your Taste</h3>
            <div className="space-y-2">
              {recommendedSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex justify-between items-center p-3 rounded-md hover:bg-gray-800"
                >
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{song.duration}</span>
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Mood Generator */}
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
        </div>
      </div>

      {/* Player Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex items-center space-x-4 w-full md:w-1/3">
            <img 
              src={currentSong.cover}
              alt="Album cover" 
              className="h-12 w-12 rounded"
            />
            <div>
              <p className="font-medium">{currentSong.title}</p>
              <p className="text-sm text-gray-400">{currentSong.artist}</p>
            </div>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="w-full md:w-1/3 flex flex-col items-center space-y-2 my-4 md:my-0">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button 
                onClick={handlePlayPause}
                variant="secondary" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-gray-400">1:08</span>
              <Slider 
                value={progress} 
                max={100}
                step={1}
                className="w-full" 
                onValueChange={setProgress}
              />
              <span className="text-xs text-gray-400">{currentSong.duration}</span>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 flex justify-end items-center space-x-2">
            <Volume2 className="h-5 w-5 text-gray-400" />
            <Slider 
              value={volume} 
              max={100}
              step={1}
              className="w-24" 
              onValueChange={setVolume}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
