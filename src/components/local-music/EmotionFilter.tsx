import { motion } from 'framer-motion';
import { Smile, Frown, Heart, Zap, Music, Flame } from 'lucide-react';
import { EmotionType } from '../../types/music';

interface EmotionFilterProps {
  selectedEmotion: EmotionType;
  onEmotionChange: (emotion: EmotionType) => void;
}

const emotions: { value: EmotionType; label: string; icon: any; color: string }[] = [
  { value: 'all', label: 'All', icon: Music, color: 'from-gray-400 to-gray-600' },
  { value: 'happy', label: 'Happy', icon: Smile, color: 'from-yellow-400 to-orange-500' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'from-blue-400 to-indigo-500' },
  { value: 'calm', label: 'Calm', icon: Heart, color: 'from-green-400 to-teal-500' },
  { value: 'energetic', label: 'Energetic', icon: Zap, color: 'from-pink-400 to-purple-500' },
  { value: 'romantic', label: 'Romantic', icon: Heart, color: 'from-rose-400 to-pink-500' },
  { value: 'angry', label: 'Angry', icon: Flame, color: 'from-red-400 to-orange-600' },
];

const EmotionFilter: React.FC<EmotionFilterProps> = ({ selectedEmotion, onEmotionChange }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {emotions.map((emotion) => {
        const Icon = emotion.icon;
        const isSelected = selectedEmotion === emotion.value;
        
        return (
          <motion.button
            key={emotion.value}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEmotionChange(emotion.value)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all
              ${isSelected 
                ? `bg-gradient-to-r ${emotion.color} text-white shadow-lg` 
                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{emotion.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default EmotionFilter;

