import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SongComments from '@/components/SongComments';
import SongTimeline from '@/components/SongTimeline';
import { useSongs } from '@/hooks/useSongs';
import { useComments } from '@/hooks/useComments';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';

const SongDetailPage = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: songs = [] } = useSongs('auto');
  const { data: comments = [] } = useComments(songId || '');
  const { isFavorited, toggleFavorite } = useFavorites();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement] = useState(() => new Audio());

  const song = songs.find(s => s.id === songId);

  useEffect(() => {
    if (!song) return;

    audioElement.src = song.audio_url || '';
    
    audioElement.addEventListener('timeupdate', () => {
      setCurrentTime(audioElement.currentTime);
    });
    
    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration);
    });

    return () => {
      audioElement.pause();
      audioElement.src = '';
    };
  }, [song, audioElement]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimestampClick = (timestamp: number) => {
    audioElement.currentTime = timestamp;
    setCurrentTime(timestamp);
    if (!isPlaying) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Song link copied to clipboard',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">Song not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      <div className="flex">
        <Sidebar aiModeEnabled={false} handleAiModeToggle={() => {}} />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-8 mb-8"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="aspect-square relative mb-6 rounded-lg overflow-hidden">
                    <img
                      src={song.cover_url || ''}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&h=800&auto=format&fit=crop';
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
                      <p className="text-xl text-gray-400">{song.artist}</p>
                      {song.album && (
                        <p className="text-sm text-gray-500">{song.album}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {song.genre?.map((g, i) => (
                        <Badge key={i} variant="secondary">{g}</Badge>
                      ))}
                      {song.mood?.map((m, i) => (
                        <Badge key={i} className="bg-purple-900 text-purple-300">{m}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        size="lg"
                        onClick={handlePlayPause}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5 mr-2" />
                        ) : (
                          <Play className="h-5 w-5 mr-2" />
                        )}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => toggleFavorite(song)}
                      >
                        <Heart
                          className={`h-5 w-5 ${isFavorited(song.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </Button>

                      <Button variant="outline" size="lg" onClick={handleShare}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="pt-4 text-sm text-gray-400">
                      <p>{formatTime(currentTime)} / {formatTime(duration)}</p>
                      <p className="mt-2">{(song.listens || 0).toLocaleString()} plays</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Comment Timeline
                    </h2>
                    <SongTimeline
                      comments={comments.map(c => ({
                        id: c.id,
                        timestamp_in_song: c.timestamp_in_song || 0,
                        content: c.content
                      }))}
                      duration={duration}
                      currentTime={currentTime}
                      onTimestampClick={handleTimestampClick}
                    />
                    <p className="text-sm text-gray-400 mt-3">
                      {comments.length} comment{comments.length !== 1 ? 's' : ''} on this track
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <SongComments
                      songId={songId || ''}
                      currentTime={formatTime(currentTime)}
                      onTimestampClick={(timeStr) => {
                        const [mins, secs] = timeStr.split(':').map(Number);
                        handleTimestampClick(mins * 60 + secs);
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SongDetailPage;
