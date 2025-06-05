
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Music, Trash2 } from "lucide-react";
import { Song } from "@/hooks/useSongs";

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
}

interface PlaylistManagerProps {
  songs: Song[];
  onPlayPlaylist: (playlist: Song[], startIndex?: number) => void;
}

const PlaylistManager = ({ songs, onPlayPlaylist }: PlaylistManagerProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const createPlaylist = () => {
    if (newPlaylistName.trim() && selectedSongs.length > 0) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        songs: [...selectedSongs],
        createdAt: new Date()
      };
      
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName("");
      setSelectedSongs([]);
      setIsCreateDialogOpen(false);
    }
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const toggleSongSelection = (song: Song) => {
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Playlists</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Playlist</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Select Songs ({selectedSongs.length} selected)
                </h3>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {songs.map((song) => {
                    const isSelected = selectedSongs.some(s => s.id === song.id);
                    return (
                      <div
                        key={song.id}
                        onClick={() => toggleSongSelection(song)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-purple-600 bg-opacity-50 border border-purple-400" 
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&auto=format&fit=crop'} 
                            alt={song.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-white">{song.title}</p>
                            <p className="text-sm text-gray-400">{song.artist}</p>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <Button 
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim() || selectedSongs.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No playlists yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first playlist to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-md flex items-center justify-center">
                      <Music className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{playlist.name}</h3>
                      <p className="text-gray-400 text-sm">{playlist.songs.length} songs</p>
                      <p className="text-gray-500 text-xs">
                        Created {playlist.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => onPlayPlaylist(playlist.songs)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-1">
                  {playlist.songs.slice(0, 5).map((song, index) => (
                    <Badge key={song.id} variant="secondary" className="text-xs">
                      {song.title}
                    </Badge>
                  ))}
                  {playlist.songs.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{playlist.songs.length - 5} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;
