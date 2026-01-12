import { motion } from "framer-motion";
import { MessageCircle, Heart, Share2, Play, Pause, SkipForward, SkipBack, Volume2, Clock, Users, TrendingUp, ExternalLink } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { trendingSongs } from "../data/realSongs";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { MusicTrack } from "../types/music";

const Social = () => {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    play, 
    pause, 
    togglePlayPause, 
    next, 
    previous, 
    seek, 
    setVolume: setVolumeControl 
  } = useMusicPlayer();
  
  const { allTracks } = useMusicLibrary();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  
  // Convert trending song to MusicTrack format or use first available track
  const currentSongTrack = useMemo(() => {
    if (currentTrack) {
      return currentTrack;
    }
    // Try to find a track from the library, or use first trending song as fallback
    if (allTracks.length > 0) {
      return allTracks[0];
    }
    // Convert trending song to MusicTrack format
    const trendingSong = trendingSongs[0];
    return {
      track_id: trendingSong.id,
      track_name: trendingSong.title,
      artist: trendingSong.artist,
      album: trendingSong.album,
      genre: trendingSong.genre || 'Unknown',
      duration: trendingSong.duration || '3:00',
      file_name: `${trendingSong.title.replace(/\s+/g, '-').toLowerCase()}.mp3`,
      file_path: `/music-dataset/main-tracks/${trendingSong.title.replace(/\s+/g, '-').toLowerCase()}.mp3`,
      source: 'sample',
      license: 'N/A',
      download_url: undefined,
      attribution: undefined,
      emotion_tags: trendingSong.mood ? [trendingSong.mood.toLowerCase()] : [],
      tags: []
    } as MusicTrack;
  }, [currentTrack, allTracks]);
  
  // Display song info (use currentTrack if available, otherwise fallback)
  const displaySong = useMemo(() => {
    if (currentTrack) {
      return {
        title: currentTrack.track_name,
        artist: currentTrack.artist,
        album: currentTrack.album,
        albumArt: "/placeholder.svg"
      };
    }
    const trendingSong = trendingSongs[0];
    return {
      title: trendingSong.title,
      artist: trendingSong.artist,
      album: trendingSong.album,
      albumArt: "/placeholder.svg"
    };
  }, [currentTrack]);

  useEffect(() => {
    // Simulate existing comments
    setComments([
      {
        id: 1,
        timestamp: "0:45",
        text: "This guitar solo is absolutely incredible! 🔥",
        author: "MusicLover23",
        likes: 12,
        time: "2 hours ago",
        isLiked: false
      },
      {
        id: 2,
        timestamp: "1:23",
        text: "The lyrics hit different at this part 😭",
        author: "SoulSeeker",
        likes: 8,
        time: "1 hour ago",
        isLiked: true
      },
      {
        id: 3,
        timestamp: "2:15",
        text: "Anyone else getting chills?",
        author: "ChillVibes",
        likes: 15,
        time: "30 minutes ago",
        isLiked: false
      },
      {
        id: 4,
        timestamp: "3:02",
        text: "This is my favorite part of the song!",
        author: "MelodyMaker",
        likes: 6,
        time: "15 minutes ago",
        isLiked: false
      }
    ]);
  }, []);
  
  // Auto-play the song when component mounts if no track is playing
  useEffect(() => {
    if (!currentTrack && currentSongTrack && allTracks.length > 0) {
      // Use first available track from library
      const trackToPlay = allTracks[0];
      console.log('🎵 Auto-playing track:', trackToPlay.track_name);
      play(trackToPlay, allTracks.slice(0, 10)); // Play with a playlist of first 10 tracks
    }
  }, [currentSongTrack, allTracks, currentTrack, play]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (currentTrack) {
      togglePlayPause();
    } else if (currentSongTrack) {
      // Start playing if no track is currently loaded
      play(currentSongTrack, allTracks.length > 0 ? allTracks.slice(0, 10) : [currentSongTrack]);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolumeControl(newVolume);
  };
  
  const handleNext = () => {
    next();
  };
  
  const handlePrevious = () => {
    previous();
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        timestamp: formatTime(currentTime),
        text: newComment,
        author: "You",
        likes: 0,
        time: "Just now",
        isLiked: false
      };
      setComments([comment, ...comments]);
      setNewComment("");
      setShowCommentBox(false);
    }
  };

  const toggleLike = (commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const getActiveComments = () => {
    return comments.filter(comment => {
      const [commentMin, commentSec] = comment.timestamp.split(':').map(Number);
      const commentTime = commentMin * 60 + commentSec;
      const currentTimeSeconds = Math.floor(currentTime);
      return Math.abs(commentTime - currentTimeSeconds) <= 5; // Within 5 seconds
    });
  };

  const activeComments = getActiveComments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold">Social Music Experience</h1>
          <p className="text-gray-300 mt-1">Connect with others through music</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Left Side - Music Player */}
        <div className="lg:w-1/2 p-6">
          <div className="h-full flex flex-col">
            {/* Song Info */}
            <div className="text-center mb-8">
              <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={displaySong.albumArt} 
                  alt={displaySong.album}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <h2 className="text-3xl font-bold mb-2">{displaySong.title}</h2>
              <p className="text-xl text-gray-300 mb-2">{displaySong.artist}</p>
              <p className="text-sm text-gray-400 mb-4">{displaySong.album}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>1,234 listeners</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>#1 trending</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(Math.floor(currentTime))}</span>
                <span>{formatTime(Math.floor(duration || 0))}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                disabled={!currentTrack}
              />
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevious}
                disabled={!currentTrack}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
                className="p-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                disabled={!currentTrack}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-4 mb-8">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-400 w-8">{Math.round(volume)}%</span>
            </div>

            {/* Add Comment Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Add Timestamp Comment
            </motion.button>

            {/* Comment Input */}
            {showCommentBox && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Comment at {formatTime(Math.floor(currentTime))}</span>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this moment..."
                  className="w-full p-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowCommentBox(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addComment}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                  >
                    Post Comment
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Side - Comments */}
        <div className="lg:w-1/2 p-6 border-l border-white/10">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Live Comments</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>{comments.length} comments</span>
              </div>
            </div>

            {/* Active Comments Highlight */}
            {activeComments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30"
              >
                <div className="text-sm font-medium text-purple-300 mb-2">
                  🔥 Active at {formatTime(Math.floor(currentTime))}
                </div>
                {activeComments.map(comment => (
                  <div key={comment.id} className="text-sm text-white">
                    {comment.text}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{comment.author}</div>
                        <div className="text-xs text-gray-400">{comment.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">{comment.timestamp}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{comment.text}</p>
                  
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        comment.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;
