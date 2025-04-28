
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Headphones, Share2 } from "lucide-react";
import { toast } from "sonner";
import { LiveSessionType } from "@/data/liveSessions";
import { SongType, songs } from "@/data/songs";
import { UserType, users } from "@/data/users";

interface LiveSessionCardProps {
  session: LiveSessionType;
  onJoin: (sessionId: string) => void;
  compact?: boolean;
}

const LiveSessionCard: React.FC<LiveSessionCardProps> = ({ 
  session, 
  onJoin,
  compact = false 
}) => {
  const currentSong: SongType | undefined = songs.find(song => song.id === session.currentSongId);
  const host: UserType | undefined = users.find(user => user.id === session.hostId);
  
  const joinSession = () => {
    onJoin(session.id);
    toast.success(`Joined "${session.name}" session`);
  };
  
  const shareSession = () => {
    // In a real app, this would copy a link to the clipboard
    navigator.clipboard.writeText(`https://sonic-aura-stream.app/live/${session.id}`)
      .then(() => {
        toast.success("Session link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy session link");
      });
  };
  
  // Format the time that has elapsed since the session started
  const formatElapsedTime = (startTimeStr: string) => {
    const startTime = new Date(startTimeStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-3">
            <img 
              src={currentSong?.cover} 
              alt="Session cover" 
              className="rounded-md w-full h-full object-cover"
            />
            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1 rounded-full">
              LIVE
            </div>
          </div>
          <div>
            <p className="font-medium">{session.name}</p>
            <p className="text-xs text-gray-400">
              Hosted by {host?.name} • {session.listeners.length} listening
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={joinSession}>
          Join
        </Button>
      </div>
    );
  }
  
  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden">
      <div className="relative">
        <img 
          src={currentSong?.cover} 
          alt="Session cover" 
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-red-600 text-white border-none px-2 animate-pulse">
            LIVE
          </Badge>
        </div>
        {!session.isPublic && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-gray-800 text-white border-none">
              Private
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <h3 className="text-lg font-bold mb-1">{session.name}</h3>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <Users className="h-4 w-4 mr-1" />
          <span>Hosted by {host?.name}</span>
        </div>
        
        {currentSong && (
          <div className="mt-3 p-2 bg-gray-700 rounded-md flex items-center">
            <img 
              src={currentSong.cover} 
              alt={currentSong.title}
              className="w-10 h-10 rounded-md mr-3" 
            />
            <div>
              <p className="font-medium text-sm">{currentSong.title}</p>
              <p className="text-xs text-gray-400">{currentSong.artist}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center text-sm text-purple-300">
            <Headphones className="h-4 w-4 mr-1" />
            <span>{session.listeners.length} listening</span>
          </div>
          <div className="text-xs text-gray-400">
            Started {formatElapsedTime(session.startedAt)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={shareSession}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        <Button onClick={joinSession}>Join Session</Button>
      </CardFooter>
    </Card>
  );
};

export default LiveSessionCard;
