import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface UnlistenedBadgeProps {
  className?: string;
}

const UnlistenedBadge: React.FC<UnlistenedBadgeProps> = ({ className = '' }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      <Badge 
        variant="secondary" 
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-2 py-1 flex items-center gap-1 shadow-lg"
      >
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span className="text-xs font-semibold">New</span>
      </Badge>
    </motion.div>
  );
};

export default UnlistenedBadge;
