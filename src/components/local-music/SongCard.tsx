import { motion } from 'framer-motion';
import { Play, Pause, Music2, Clock, User } from 'lucide-react';
import { MusicTrack } from '../../types/music';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

interface SongCardProps {
  track: MusicTrack;
  index: number;
  allTracks: MusicTrack[];
}

const SongCard: React.FC<SongCardProps> = ({ track, index, allTracks }) => {
  const { currentTrack, isPlaying, play, pause } = useMusicPlayer();
  const isCurrentTrack = currentTrack?.track_id === track.track_id;

  const handlePlayClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log('🎯 Play button clicked:', track.track_name);
    
    if (isCurrentTrack && isPlaying) {
      pause();
    } else {
      play(track, allTracks);
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'sad': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'calm': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'energetic': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'romantic': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'angry': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        group relative p-5 rounded-xl backdrop-blur-sm transition-all
        ${isCurrentTrack 
          ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50 shadow-xl shadow-purple-500/20' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
        }
      `}
    >
      {/* Play Button Overlay - Made fully clickable */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePlayClick}
        onMouseDown={(e) => e.stopPropagation()}
        className={`
          absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center
          transition-all shadow-lg z-[100] cursor-pointer
          ${isCurrentTrack && isPlaying
            ? 'bg-gradient-to-r from-purple-600 to-pink-600'
            : 'bg-white/10 backdrop-blur-sm group-hover:bg-purple-600'
          }
        `}
        style={{ 
          pointerEvents: 'auto',
          zIndex: 100
        }}
        aria-label={`Play ${track.track_name}`}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="w-5 h-5 text-white pointer-events-none" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5 pointer-events-none" />
        )}
      </motion.button>

      {/* Album Art Placeholder */}
      <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 mb-4 flex items-center justify-center overflow-hidden relative">
        <Music2 className="w-16 h-16 text-white/50" />
        {isCurrentTrack && isPlaying && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
          {track.track_name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User className="w-4 h-4" />
          <span className="line-clamp-1">{track.artist}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{track.duration}</span>
          <span className="mx-1">•</span>
          <span className="line-clamp-1">{track.genre}</span>
        </div>

        {/* Emotion Tags */}
        {track.emotion_tags && track.emotion_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {track.emotion_tags.map((emotion, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getEmotionColor(emotion)}`}
              >
                {emotion}
              </span>
            ))}
          </div>
        )}

        {/* Song Summary */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 line-clamp-2">
            {track.source === 'Free Music Archive' 
              ? `From ${track.source} - ${track.license}` 
              : `${track.source} • ${track.album}`
            }
          </p>
        </div>

        {/* Source Attribution */}
        {track.attribution && (
          <p className="text-xs text-gray-500 italic mt-2">
            {track.attribution}
          </p>
        )}
      </div>

      {/* Now Playing Indicator */}
      {isCurrentTrack && isPlaying && (
        <motion.div
          className="absolute bottom-2 left-2 flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-purple-400 rounded-full"
              animate={{
                height: ['8px', '16px', '8px'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SongCard;
