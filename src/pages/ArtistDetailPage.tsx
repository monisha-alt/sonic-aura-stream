
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Play, Disc, ListMusic } from "lucide-react";
import { artists, songs, albums, ArtistType } from "@/data";
import PlayerControls from "@/components/PlayerControls";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ArtistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [artist, setArtist] = useState<ArtistType | null>(null);
  const [artistSongs, setArtistSongs] = useState<typeof songs>([]);
  const [artistAlbums, setArtistAlbums] = useState<typeof albums>([]);
  
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
    // Find the artist
    const foundArtist = artists.find(a => a.id === id);
    setArtist(foundArtist || null);
    
    // Find songs by this artist
    if (foundArtist) {
      const artistSongs = songs.filter(song => 
        song.artist === foundArtist.name
      );
      setArtistSongs(artistSongs);
      
      // Find albums by this artist
      const artistAlbums = albums.filter(album => 
        album.artist === foundArtist.name
      );
      setArtistAlbums(artistAlbums);
      
      // Set current song to the first song by the artist
      if (artistSongs.length > 0) {
        setCurrentSong({
          title: artistSongs[0].title,
          artist: artistSongs[0].artist,
          duration: artistSongs[0].duration,
          cover: artistSongs[0].cover
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
      title: artistSongs[songIndex].title,
      artist: artistSongs[songIndex].artist,
      duration: artistSongs[songIndex].duration,
      cover: artistSongs[songIndex].cover
    });
    setIsPlaying(true);
    setProgress([0]);
    
    toast({
      title: "Now Playing",
      description: `${artistSongs[songIndex].title} by ${artistSongs[songIndex].artist}`,
      duration: 2000,
    });
  };

  const handleSkipForward = () => {
    const nextIndex = (currentSongIndex + 1) % artistSongs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentSong({
      title: artistSongs[nextIndex].title,
      artist: artistSongs[nextIndex].artist,
      duration: artistSongs[nextIndex].duration,
      cover: artistSongs[nextIndex].cover
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${artistSongs[nextIndex].title} by ${artistSongs[nextIndex].artist}`,
        duration: 2000,
      });
    }
  };

  const handleSkipBack = () => {
    const prevIndex = (currentSongIndex - 1 + artistSongs.length) % artistSongs.length;
    setCurrentSongIndex(prevIndex);
    setCurrentSong({
      title: artistSongs[prevIndex].title,
      artist: artistSongs[prevIndex].artist,
      duration: artistSongs[prevIndex].duration,
      cover: artistSongs[prevIndex].cover
    });
    setProgress([0]);
    
    if (isPlaying) {
      toast({
        title: "Now Playing",
        description: `${artistSongs[prevIndex].title} by ${artistSongs[prevIndex].artist}`,
        duration: 2000,
      });
    }
  };

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <h2 className="text-2xl">Artist not found</h2>
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
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
            <img 
              src={artist.image} 
              alt={artist.name}
              className="w-48 h-48 object-cover rounded-full shadow-lg"
            />
            
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold">{artist.name}</h1>
              <div className="text-sm text-gray-400">
                <span className="px-2 py-1 bg-gray-700 rounded mr-2">{artist.genres.join(", ")}</span>
              </div>
              <p className="max-w-2xl text-gray-300">{artist.bio}</p>
              <div className="pt-2">
                <Button 
                  onClick={() => {
                    if (artistSongs.length > 0) {
                      setIsPlaying(true);
                      toast({
                        title: "Playing",
                        description: `Popular songs by ${artist.name}`,
                        duration: 2000,
                      });
                    }
                  }} 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={artistSongs.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play Popular Songs
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Disc className="mr-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">Albums</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artistAlbums.map(album => (
                  <Link to={`/albums/${album.id}`} key={album.id} className="group">
                    <div className="flex items-center p-3 rounded-md hover:bg-gray-800 transition-colors">
                      <img 
                        src={album.cover} 
                        alt={album.title} 
                        className="w-16 h-16 rounded mr-3"
                      />
                      <div>
                        <p className="font-medium group-hover:text-purple-400">{album.title}</p>
                        <p className="text-sm text-gray-400">{album.releaseYear}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <ListMusic className="mr-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">Popular Songs</h2>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Album</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artistSongs.map((song, index) => (
                    <TableRow key={song.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/lyrics/${song.id}`} className="hover:text-purple-400">
                          {song.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-400">{song.album}</TableCell>
                      <TableCell className="text-right text-gray-400">{song.duration}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handlePlaySong(index)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default ArtistDetailPage;
