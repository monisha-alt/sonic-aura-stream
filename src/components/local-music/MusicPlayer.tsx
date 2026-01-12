import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2, Maximize2, Minimize2 } from 'lucide-react';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useState } from 'react';

const MusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume
  } = useMusicPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all ${
          isExpanded ? 'h-screen' : 'h-24'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent backdrop-blur-xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Expanded View */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8"
            >
              {/* Large Album Art */}
              <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 mb-8 flex items-center justify-center shadow-2xl">
                <Music2 className="w-32 h-32 text-white/50" />
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Track Info */}
              <h2 className="text-4xl font-bold text-white mb-2 text-center">
                {currentTrack.track_name}
              </h2>
              <p className="text-xl text-gray-300 mb-4">{currentTrack.artist}</p>
              <p className="text-sm text-gray-400">{currentTrack.album}</p>

              {/* Emotion Tags */}
              {currentTrack.emotion_tags && currentTrack.emotion_tags.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {currentTrack.emotion_tags.map((emotion, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Compact View */}
          {!isExpanded && (
            <div className="flex items-center gap-4 px-6 py-4">
              {/* Album Art */}
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-6 h-6 text-white/50" />
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">
                  {currentTrack.track_name}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
          )}

          {/* Controls Section */}
          <div className="px-6 pb-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progress}%, #374151 ${progress}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Left: Expand/Collapse */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isExpanded ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </motion.button>

              {/* Center: Playback Controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={previous}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={next}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Right: Volume Control */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVolume(!showVolume)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </motion.button>

                {/* Volume Slider */}
                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-lg shadow-xl"
                    >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, #374151 ${volume}%, #374151 100%)`
                        }}
                      />
                      <div className="text-center text-xs text-gray-400 mt-1">
                        {volume}%
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;

