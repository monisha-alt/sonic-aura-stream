
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PlayerControls from "@/components/PlayerControls";
import LiveSessionCard from "@/components/LiveSessionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Users, Music } from "lucide-react";
import { liveSessions } from "@/data/liveSessions";
import { songs } from "@/data/songs";

const LiveSessionsPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: songs[0].title,
    artist: songs[0].artist,
    duration: songs[0].duration,
    cover: songs[0].cover
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const { toast } = useToast();
  
  const publicSessions = liveSessions.filter(session => session.isPublic);
  const privateSessions = liveSessions.filter(session => !session.isPublic);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipForward = () => {
    // Placeholder for skip forward functionality
  };

  const handleSkipBack = () => {
    // Placeholder for skip back functionality
  };

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
  };
  
  const handleJoinSession = (sessionId: string) => {
    const session = liveSessions.find(s => s.id === sessionId);
    if (session) {
      const song = songs.find(s => s.id === session.currentSongId);
      if (song) {
        setCurrentSong({
          title: song.title,
          artist: song.artist,
          duration: song.duration,
          cover: song.cover
        });
        setIsPlaying(true);
        toast({
          title: "Joined Live Session",
          description: `You are now listening to "${session.name}"`,
          duration: 3000,
        });
      }
    }
  };
  
  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a session name",
        duration: 3000,
      });
      return;
    }
    
    toast({
      title: "Session Created",
      description: `Your session "${sessionName}" is now live`,
      duration: 3000,
    });
    
    // In a real implementation, we would add the session to the list
    setSessionName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar 
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />

        <div className="flex-1 p-4 pb-24">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Live Listening Sessions</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-2 md:mt-0">
                  <Users className="mr-2 h-4 w-4" />
                  Create Live Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Create a Live Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input 
                      id="session-name" 
                      placeholder="My Awesome Mix" 
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      className="bg-gray-700"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public-session">Public Session</Label>
                    <Switch 
                      id="public-session" 
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    {isPublic ? 
                      "Anyone can discover and join your session" : 
                      "Only people with the link can join your session"}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCreateSession}>
                    Start Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Featured Sessions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Featured Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicSessions.slice(0, 3).map((session) => (
                <LiveSessionCard 
                  key={session.id} 
                  session={session} 
                  onJoin={handleJoinSession}
                />
              ))}
            </div>
          </div>
          
          {/* Public Sessions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Public Sessions</h3>
            <div className="space-y-3">
              {publicSessions.map((session) => (
                <LiveSessionCard 
                  key={session.id} 
                  session={session} 
                  onJoin={handleJoinSession}
                  compact
                />
              ))}
            </div>
          </div>
          
          {/* Private Sessions */}
          {privateSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Private Sessions</h3>
              <div className="space-y-3">
                {privateSessions.map((session) => (
                  <LiveSessionCard 
                    key={session.id} 
                    session={session} 
                    onJoin={handleJoinSession}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PlayerControls 
        isPlaying={isPlaying}
        currentSong={currentSong}
        handlePlayPause={handlePlayPause}
        handleSkipForward={handleSkipForward}
        handleSkipBack={handleSkipBack}
        progress={progress}
        setProgress={setProgress}
        volume={volume}
        setVolume={setVolume}
      />
    </div>
  );
};

export default LiveSessionsPage;
