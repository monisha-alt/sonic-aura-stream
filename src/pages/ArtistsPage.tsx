
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { artists } from "@/data";
import PlayerControls from "@/components/PlayerControls";
import { Card, CardContent } from "@/components/ui/card";
import { songs } from "@/data";

const ArtistsPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState({
    title: songs[0].title,
    artist: songs[0].artist,
    duration: songs[0].duration,
    cover: songs[0].cover
  });
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  const handleAiModeToggle = () => {
    setAiModeEnabled(!aiModeEnabled);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipForward = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentSong({
      title: songs[nextIndex].title,
      artist: songs[nextIndex].artist,
      duration: songs[nextIndex].duration,
      cover: songs[nextIndex].cover
    });
    setProgress([0]);
  };

  const handleSkipBack = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    setCurrentSong({
      title: songs[prevIndex].title,
      artist: songs[prevIndex].artist,
      duration: songs[prevIndex].duration,
      cover: songs[prevIndex].cover
    });
    setProgress([0]);
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
          <h2 className="text-2xl font-bold mb-6">Artists</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <Link to={`/artists/${artist.id}`} key={artist.id}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center">
                    <img 
                      src={artist.image} 
                      alt={`${artist.name}`}
                      className="w-32 h-32 rounded-full object-cover mb-4"
                    />
                    <h3 className="font-semibold text-center text-white">{artist.name}</h3>
                    <p className="text-xs text-gray-400 text-center mt-1">{artist.genres.slice(0, 2).join(", ")}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
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

export default ArtistsPage;
