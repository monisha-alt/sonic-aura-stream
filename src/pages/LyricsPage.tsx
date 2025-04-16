
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Play, Heart, Calendar, ChevronLeft } from "lucide-react";
import { songs, lyrics } from "@/data";
import PlayerControls from "@/components/PlayerControls";
import SongComments from "@/components/SongComments";
import { useToast } from "@/hooks/use-toast";

const LyricsPage = () => {
  const { songId } = useParams<{ songId: string }>();
  const { toast } = useToast();
  const [song, setSong] = useState<typeof songs[0] | null>(null);
  const [songLyrics, setSongLyrics] = useState<string | null>(null);
  const [contributors, setContributors] = useState<string[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "",
    artist: "",
    duration: "",
    cover: ""
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState("0:00");

  // Timer ref for playback simulation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Find the song
    const foundSong = songs.find(s => s.id === songId);
    setSong(foundSong || null);
    
    // Find lyrics for this song
    if (foundSong && lyrics[songId]) {
      setSongLyrics(lyrics[songId].lyrics);
      setContributors(lyrics[songId].contributors || []);
      
      // Set current song
      setCurrentSong({
        title: foundSong.title,
        artist: foundSong.artist,
        duration: foundSong.duration,
        cover: foundSong.cover
      });
    } else if (foundSong) {
      setSongLyrics("Lyrics not available for this song.");
      setCurrentSong({
        title: foundSong.title,
        artist: foundSong.artist,
        duration: foundSong.duration,
        cover: foundSong.cover
      });
    }
  }, [songId]);

  // Simulate playback time updates
  useEffect(() => {
    if (isPlaying && song) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Set up a timer to update the current time
      timerRef.current = setInterval(() => {
        setCurrentPlaybackTime((prevTime) => {
          const [mins, secs] = prevTime.split(':').map(Number);
          let totalSeconds = mins * 60 + secs + 1;
          
          // Convert song duration to seconds for comparison
          const [durationMins, durationSecs] = song.duration.split(':').map(Number);
          const totalDuration = durationMins * 60 + durationSecs;
          
          // Reset if reached the end
          if (totalSeconds >= totalDuration) {
            setIsPlaying(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return "0:00";
          }
          
          // Format back to MM:SS
          const newMins = Math.floor(totalSeconds / 60);
          const newSecs = totalSeconds % 60;
          return `${newMins}:${newSecs.toString().padStart(2, '0')}`;
        });
        
        // Update progress
        if (song) {
          const [durationMins, durationSecs] = song.duration.split(':').map(Number);
          const totalDuration = durationMins * 60 + durationSecs;
          
          const [currentMins, currentSecs] = currentPlaybackTime.split(':').map(Number);
          const currentTotal = currentMins * 60 + currentSecs;
          
          const progressPercentage = (currentTotal / totalDuration) * 100;
          setProgress([progressPercentage]);
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isPlaying, song, currentPlaybackTime]);

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `${currentSong.title} by ${currentSong.artist}`,
      duration: 2000,
    });
  };

  const handleSkipForward = () => {
    // Skip functionality simplified for lyrics page
    toast({
      title: "Next Song",
      description: `Feature limited on lyrics page`,
      duration: 2000,
    });
  };

  const handleSkipBack = () => {
    // Skip functionality simplified for lyrics page
    toast({
      title: "Previous Song",
      description: `Feature limited on lyrics page`,
      duration: 2000,
    });
  };

  const handleTimestampClick = (timestamp: string) => {
    // Parse the timestamp
    const [mins, secs] = timestamp.split(':').map(Number);
    const totalSeconds = mins * 60 + (secs || 0);
    
    // Calculate progress based on total duration
    if (song) {
      const [durationMins, durationSecs] = song.duration.split(':').map(Number);
      const totalDuration = durationMins * 60 + durationSecs;
      
      const progressPercentage = (totalSeconds / totalDuration) * 100;
      setProgress([progressPercentage]);
      
      // Update current time
      setCurrentPlaybackTime(timestamp);
    }
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <h2 className="text-2xl">Song not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar 
          aiModeEnabled={aiModeEnabled}
          handleAiModeToggle={handleAiModeToggle}
        />

        <div className="flex-1 p-4 pb-24">
          <Link 
            to={`/albums/${song.album.replace(/\s+/g, '-').toLowerCase()}`} 
            className="inline-flex items-center text-gray-400 hover:text-white mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to album
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <img 
              src={song.cover} 
              alt={`${song.title} cover`}
              className="w-40 h-40 object-cover rounded-lg shadow-lg"
            />
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{song.title}</h1>
              <Link to={`/artists/${song.artist.replace(/\s+/g, '-').toLowerCase()}`} className="text-xl text-gray-300 hover:text-white">
                {song.artist}
              </Link>
              <p className="text-gray-400">Album: {song.album}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> {song.releaseYear}
                </span>
                <span>{song.duration}</span>
              </div>
              <div className="pt-2 flex space-x-2">
                <Button 
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    toast({
                      title: isPlaying ? "Paused" : "Playing",
                      description: `${song.title} by ${song.artist}`,
                      duration: 2000,
                    });
                  }} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Favorites
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            <div>
              <h2 className="text-xl font-semibold mb-4">Lyrics</h2>
              <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg whitespace-pre-line leading-relaxed">
                {songLyrics}
              </div>
              
              {contributors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-400">Contributors</h3>
                  <p className="text-sm text-gray-500">{contributors.join(", ")}</p>
                </div>
              )}
            </div>
            
            <div>
              <SongComments 
                songId={songId || ""} 
                currentTime={currentPlaybackTime}
                onTimestampClick={handleTimestampClick}
              />
            </div>
          </div>
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

export default LyricsPage;
