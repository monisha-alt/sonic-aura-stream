import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Loader2, AlertCircle } from 'lucide-react';
import { useMusicLibrary } from '../../hooks/useMusicLibrary';
import { EmotionType } from '../../types/music';
import SearchBar from './SearchBar';
import EmotionFilter from './EmotionFilter';
import SongCard from './SongCard';
import MusicPlayer from './MusicPlayer';

const MusicLibrary = () => {
  const { allTracks, loading, error, filterAndSearch } = useMusicLibrary();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = filterAndSearch(selectedEmotion, searchQuery);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading your music library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Error Loading Music</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-sm text-gray-400 mt-4">
            Make sure the music-dataset folder is in the public directory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900/95 to-transparent backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <Music className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Local Music Library
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {allTracks.length} copyright-free tracks • {filteredTracks.length} showing
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search songs, artists, albums..."
            />
          </motion.div>

          {/* Emotion Filter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EmotionFilter
              selectedEmotion={selectedEmotion}
              onEmotionChange={setSelectedEmotion}
            />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredTracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Music className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No tracks found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${selectedEmotion} tracks available`}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery('');
                setSelectedEmotion('all');
              }}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-medium transition-colors"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between"
            >
              <h2 className="text-xl font-semibold text-gray-300">
                {selectedEmotion === 'all' 
                  ? 'All Songs' 
                  : `${selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)} Songs`
                }
              </h2>
              <p className="text-sm text-gray-400">
                {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
              </p>
            </motion.div>

            {/* Song Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTracks.map((track, index) => (
                <SongCard
                  key={track.track_id}
                  track={track}
                  index={index}
                  allTracks={filteredTracks}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
};

export default MusicLibrary;

