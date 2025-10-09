import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Comment {
  id: string;
  timestamp_in_song: number;
  content: string;
}

interface SongTimelineProps {
  comments: Comment[];
  duration: number;
  currentTime: number;
  onTimestampClick: (timestamp: number) => void;
}

const SongTimeline: React.FC<SongTimelineProps> = ({
  comments,
  duration,
  currentTime,
  onTimestampClick,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-16 bg-gray-800/50 rounded-lg p-2 overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-1/2 left-2 right-2 h-1 bg-gray-700 rounded-full -translate-y-1/2">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Comment markers */}
      {comments.map((comment) => {
        const position = (comment.timestamp_in_song / duration) * 100;
        return (
          <motion.button
            key={comment.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.3 }}
            onClick={() => onTimestampClick(comment.timestamp_in_song)}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
            style={{ left: `${position}%` }}
            title={`${formatTime(comment.timestamp_in_song)}: ${comment.content.slice(0, 50)}...`}
          >
            <div className="relative">
              <MessageCircle className="h-4 w-4 text-purple-400 drop-shadow-lg" fill="currentColor" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {formatTime(comment.timestamp_in_song)}
              </div>
            </div>
          </motion.button>
        );
      })}

      {/* Current time indicator */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg transition-all duration-300"
        style={{ left: `${(currentTime / duration) * 100}%` }}
      />
    </div>
  );
};

export default SongTimeline;
