import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Music, AlbumIcon } from "lucide-react";
import { albums, songs, AlbumType } from "@/data";
import PlayerControls from "@/components/PlayerControls";
import { useToast } from "@/hooks/use-toast";
import ShareAlbum from "@/components/ShareAlbum";

const AlbumDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [albumSongs, setAlbumSongs] = useState<typeof songs>([]);
  
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

  useEffect(() => {
    const foundAlbum = albums.find(a => a.id === id);
    setAlbum(foundAlbum || null);
    
    if (foundAlbum) {
      const albumSongs = songs.filter(song => 
        song.album === foundAlbum.title
      );
      setAlbumSongs(albumSongs);
      
      if (albumSongs.length > 0) {
        setCurrentSong({
          title: albumSongs[0].title,
          artist: albumSongs[0].artist,
          duration: albumSongs[0].duration,
          cover: albumSongs[0].cover
        });
      }
    }
  }, [id]);

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

  const handlePlaySong = (songIndex: number) => {
    setCurrentSongIndex(songIndex);
    setCurrentSong({
      title: albumSongs[songIndex].title,
      artist: albumSongs[songIndex].artist,
      duration: albumSongs[songIndex].duration,
      cover: albumSongs[songIndex].cover
    });
    setIsPlaying(true);
    setProgress([0]);
    
    toast({
      title: "Now Playing",
      description: `${albumSongs[songIndex].title} by ${albumSongs[songIndex].artist}`,
      duration: 2000,
    });
  };

  const handleSkipForward = () => {
    const nextIndex = (currentSongIndex + 1) % albumSongs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentSong({
      title: albumSongs[nextIndex].title,
      artist: albumSongs[nextIndex].artist,
      duration: albumSongs[nextIndex].duration,
      cover: albumSongs[nextIndex].cover
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${albumSongs[nextIndex].title} by ${albumSongs[nextIndex].artist}`,
        duration: 2000,
      });
    }
  };

  const handleSkipBack = () => {
    const prevIndex = (currentSongIndex - 1 + albumSongs.length) % albumSongs.length;
    setCurrentSongIndex(prevIndex);
    setCurrentSong({
      title: albumSongs[prevIndex].title,
      artist: albumSongs[prevIndex].artist,
      duration: albumSongs[prevIndex].duration,
      cover: albumSongs[prevIndex].cover
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${albumSongs[prevIndex].title} by ${albumSongs[prevIndex].artist}`,
        duration: 2000,
      });
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <h2 className="text-2xl">Album not found</h2>
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
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <img 
              src={album.cover} 
              alt={`${album.title} album cover`}
              className="w-48 h-48 object-cover rounded-lg shadow-lg"
            />
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{album.title}</h1>
              <Link to={`/artists/${album.id.replace('al', 'a')}`} className="text-xl text-gray-300 hover:text-white">
                {album.artist}
              </Link>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> {album.releaseYear}
                </span>
                <span className="flex items-center">
                  <Music className="mr-1 h-4 w-4" /> {albumSongs.length} songs
                </span>
                <span className="flex items-center">
                  <AlbumIcon className="mr-1 h-4 w-4" /> {album.genre.join(", ")}
                </span>
              </div>
              <div className="pt-2 flex space-x-2">
                <Button 
                  onClick={() => {
                    setIsPlaying(true);
                    toast({
                      title: "Now Playing",
                      description: `${album.title} by ${album.artist}`,
                      duration: 2000,
                    });
                  }} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play Album
                </Button>
                <ShareAlbum albumId={album.id} />
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Songs</h2>
          <div className="space-y-1">
            {albumSongs.map((song, index) => (
              <div
                key={song.id}
                className="flex justify-between items-center p-3 rounded-md hover:bg-gray-800"
              >
                <div className="flex items-center">
                  <span className="w-6 text-center text-gray-500 mr-3">{index + 1}</span>
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/lyrics/${song.id}`}
                    className="text-sm text-gray-400 hover:text-purple-400"
                  >
                    Lyrics
                  </Link>
                  <span className="text-sm text-gray-400">{song.duration}</span>
                  <Button size="sm" variant="ghost" onClick={() => handlePlaySong(index)}>
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

export default AlbumDetailPage;
