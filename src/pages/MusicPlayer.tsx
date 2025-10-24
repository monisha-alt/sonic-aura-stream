import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Share2, ArrowLeft, Music } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MusicPlayer = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180); // 3 minutes
  const [volume, setVolume] = useState(50);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold">Aura Music Player</h1>
            <p className="text-gray-300">AI-Powered Music Experience</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Album Art Section */}
        <div className="lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            className="w-80 h-80 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
          >
            <div className="w-72 h-72 rounded-full bg-gray-800 flex items-center justify-center">
              <Music className="w-32 h-32 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {/* Player Controls Section */}
        <div className="lg:w-1/2 flex flex-col justify-center p-8 space-y-8">
          {/* Song Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Sample Song</h2>
            <p className="text-xl text-gray-300 mb-4">Sample Artist</p>
            <p className="text-gray-400">AI-Generated Recommendation</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
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
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-4">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm text-gray-400 w-8">{volume}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Heart className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>

          {/* AI Features */}
          <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-center">AI Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-center hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                <div className="text-sm font-medium">Emotion Detection</div>
                <div className="text-xs opacity-80">Coming Soon</div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-center hover:from-green-500 hover:to-teal-500 transition-all"
              >
                <div className="text-sm font-medium">Smart Playlist</div>
                <div className="text-xs opacity-80">Coming Soon</div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MusicPlayer;
