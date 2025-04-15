
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { albums } from "@/data";
import PlayerControls from "@/components/PlayerControls";
import { useState } from "react";
import { songs } from "@/data";

const AlbumsPage = () => {
  // Simplified player state (duplicated from Index page for standalone functionality)
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
          <h2 className="text-2xl font-bold mb-6">Albums</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <Link to={`/albums/${album.id}`} key={album.id}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                  <CardContent className="p-4">
                    <img 
                      src={album.cover} 
                      alt={`${album.title} album cover`}
                      className="w-full aspect-square object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-white truncate">{album.title}</h3>
                    <p className="text-sm text-gray-400">{album.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">{album.releaseYear}</p>
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

export default AlbumsPage;
