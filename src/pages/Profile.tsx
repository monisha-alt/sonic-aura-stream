import { motion } from "framer-motion";
import { User, Clock, Key, ArrowLeft, Settings, Music, Star, Play, Pause, History } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allTracks } = useMusicLibrary();
  const { currentTrack, isPlaying, play: playTrack, pause: pauseTrack, getPlaybackHistory } = useMusicPlayer();
  
  // Get initial tab from navigation state or default to 'unlistened'
  const getInitialTab = (): 'unlistened' | 'all' | 'recent' => {
    const state = location.state as { tab?: 'unlistened' | 'all' | 'recent' } | null;
    return state?.tab || 'unlistened';
  };
  
  const [activeTab, setActiveTab] = useState<'unlistened' | 'all' | 'recent'>(getInitialTab());
  
  // Update tab when location state changes
  useEffect(() => {
    const state = location.state as { tab?: 'unlistened' | 'all' | 'recent' } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
    }
  }, [location.state]);
  
  const [userStats, setUserStats] = useState({
    totalSongs: 0,
    unlistenedSongs: 0,
    totalPlayTime: "0 hours",
    favoriteGenre: "Unknown",
    joinDate: "January 2024"
  });

  // Get recently played songs from playback history
  const recentlyPlayed = useMemo(() => {
    const history = getPlaybackHistory();
    return history.slice(0, 10);
  }, [getPlaybackHistory]);

  // Update stats based on actual data
  useEffect(() => {
    setUserStats(prev => ({
      ...prev,
      totalSongs: allTracks.length,
      unlistenedSongs: allTracks.length - recentlyPlayed.length
    }));
  }, [allTracks.length, recentlyPlayed.length]);

  const [recentActivity] = useState([
    { action: "Liked", song: "Midnight City", artist: "M83", time: "2 hours ago" },
    { action: "Shared", song: "Blinding Lights", artist: "The Weeknd", time: "5 hours ago" },
    { action: "Added to playlist", song: "Levitating", artist: "Dua Lipa", time: "1 day ago" },
    { action: "Commented on", song: "Good 4 U", artist: "Olivia Rodrigo", time: "2 days ago" },
  ]);

  // Get random songs from actual metadata
  const unlistenedSongs = useMemo(() => {
    const playedIds = new Set(recentlyPlayed.map(s => s.track_id));
    const unplayed = allTracks.filter(song => !playedIds.has(song.track_id));
    const shuffled = [...unplayed].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map((song, index) => ({
      ...song,
      addedDate: index === 0 ? "Today" : index === 1 ? "Yesterday" : `${index} days ago`
    }));
  }, [allTracks, recentlyPlayed]);

  const [playlists] = useState([
    { id: 1, name: "My Favorites", songCount: 45, isPublic: true, lastPlayed: "2 hours ago" },
    { id: 2, name: "Workout Mix", songCount: 32, isPublic: false, lastPlayed: "Yesterday" },
    { id: 3, name: "Chill Vibes", songCount: 67, isPublic: true, lastPlayed: "3 days ago" },
    { id: 4, name: "Road Trip", songCount: 28, isPublic: false, lastPlayed: "1 week ago" },
  ]);

  const [achievements] = useState([
    { id: 1, title: "Music Explorer", description: "Discovered 100 new songs", icon: "🎵", unlocked: true },
    { id: 2, title: "Social Butterfly", description: "Shared 50 songs", icon: "🦋", unlocked: true },
    { id: 3, title: "Night Owl", description: "Listened to music after midnight 30 times", icon: "🦉", unlocked: true },
    { id: 4, title: "Genre Master", description: "Explored 10 different genres", icon: "🎭", unlocked: false },
    { id: 5, title: "Comment King", description: "Left 100 timestamp comments", icon: "💬", unlocked: false },
  ]);


  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-gray-300">Your music journey and preferences</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">Music Lover</h2>
                <p className="text-gray-300 mb-4">Member since {userStats.joinDate}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{userStats.totalSongs}</div>
                    <div className="text-sm text-gray-400">Total Songs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">{userStats.unlistenedSongs}</div>
                    <div className="text-sm text-gray-400">Unlistened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{userStats.totalPlayTime}</div>
                    <div className="text-sm text-gray-400">Play Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{userStats.favoriteGenre}</div>
                    <div className="text-sm text-gray-400">Top Genre</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Songs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveTab('unlistened')}
                className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'unlistened' 
                    ? 'text-yellow-400 border-b-2 border-yellow-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Key className="w-5 h-5" />
                Unlistened ({unlistenedSongs.length})
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'recent' 
                    ? 'text-purple-400 border-b-2 border-purple-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History className="w-5 h-5" />
                Recently Played ({recentlyPlayed.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'all' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Music className="w-5 h-5" />
                All Songs ({allTracks.length})
              </button>
            </div>
            
            <div className="space-y-4">
              {activeTab === 'unlistened' && (
                <>
                  {unlistenedSongs.length > 0 ? (
                    unlistenedSongs.map((song, index) => {
                      const isCurrentTrack = currentTrack?.track_id === song.track_id;
                      const isCurrentlyPlaying = isCurrentTrack && isPlaying;
                      
                      return (
                        <motion.div
                          key={song.track_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                        >
                          <img 
                            src="/placeholder.svg" 
                            alt={song.album}
                            className="w-16 h-16 rounded-lg object-cover shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold group-hover:text-purple-400 transition-colors">{song.track_name}</h4>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-yellow-400"
                                title="Unlistened - New Discovery!"
                              >
                                <Key className="w-4 h-4" />
                              </motion.div>
                            </div>
                            <p className="text-sm text-gray-400">{song.artist} • {song.genre}</p>
                            <p className="text-xs text-gray-500">{song.album} • Added {song.addedDate}</p>
                          </div>

                          <div className="text-sm text-gray-400">{song.duration}</div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCurrentlyPlaying) {
                                  pauseTrack();
                                } else {
                                  playTrack(song, allTracks);
                                }
                              }}
                              className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                                isCurrentlyPlaying
                                  ? 'bg-red-600 hover:bg-red-500'
                                  : 'bg-purple-600 hover:bg-purple-500'
                              }`}
                              disabled={!song.file_path}
                              title={
                                !song.file_path 
                                  ? 'No audio file available' 
                                  : isCurrentlyPlaying 
                                    ? 'Pause song' 
                                    : 'Play song'
                              }
                            >
                              {isCurrentlyPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Key className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">All songs have been listened to!</p>
                      <p className="text-sm mt-2">Great job exploring your music library.</p>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'recent' && (
                <>
                  {recentlyPlayed.length > 0 ? (
                    recentlyPlayed.map((song, index) => {
                      const isCurrentTrack = currentTrack?.track_id === song.track_id;
                      const isCurrentlyPlaying = isCurrentTrack && isPlaying;
                      
                      // Get timestamp from localStorage
                      const getPlayedTime = () => {
                        try {
                          const history = localStorage.getItem('music_playback_history');
                          if (history) {
                            const parsed = JSON.parse(history);
                            const entry = parsed.find((h: any) => h.track.track_id === song.track_id);
                            return entry ? formatTimeAgo(entry.playedAt) : 'Recently';
                          }
                        } catch {}
                        return 'Recently';
                      };
                      
                      return (
                        <motion.div
                          key={song.track_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                        >
                          <img 
                            src="/placeholder.svg" 
                            alt={song.album}
                            className="w-16 h-16 rounded-lg object-cover shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold group-hover:text-purple-400 transition-colors">{song.track_name}</h4>
                              {isCurrentlyPlaying && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="text-green-400"
                                  title="Currently Playing"
                                >
                                  <Music className="w-4 h-4" />
                                </motion.div>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{song.artist} • {song.genre}</p>
                            <p className="text-xs text-gray-500">{song.album} • Played {getPlayedTime()}</p>
                          </div>

                          <div className="text-sm text-gray-400">{song.duration}</div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCurrentlyPlaying) {
                                  pauseTrack();
                                } else {
                                  playTrack(song, allTracks);
                                }
                              }}
                              className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                                isCurrentlyPlaying
                                  ? 'bg-red-600 hover:bg-red-500'
                                  : 'bg-purple-600 hover:bg-purple-500'
                              }`}
                              disabled={!song.file_path}
                              title={
                                !song.file_path 
                                  ? 'No audio file available' 
                                  : isCurrentlyPlaying 
                                    ? 'Pause song' 
                                    : 'Play song'
                              }
                            >
                              {isCurrentlyPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No recently played songs</p>
                      <p className="text-sm mt-2">Start playing songs to see them here!</p>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'all' && (
                <>
                  {allTracks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto">
                      {allTracks.map((song, index) => {
                        const isCurrentTrack = currentTrack?.track_id === song.track_id;
                        const isCurrentlyPlaying = isCurrentTrack && isPlaying;
                        
                        return (
                          <motion.div
                            key={song.track_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.01, x: 5 }}
                            className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                          >
                            <img 
                              src="/placeholder.svg" 
                              alt={song.album}
                              className="w-12 h-12 rounded-lg object-cover shadow-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium group-hover:text-purple-400 transition-colors truncate">{song.track_name}</h4>
                                {isCurrentlyPlaying && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-green-400 flex-shrink-0"
                                  >
                                    <Music className="w-3 h-3" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate">{song.artist} • {song.genre}</p>
                            </div>

                            <div className="text-xs text-gray-400">{song.duration}</div>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCurrentlyPlaying) {
                                  pauseTrack();
                                } else {
                                  playTrack(song, allTracks);
                                }
                              }}
                              className={`p-2 rounded-full transition-colors flex items-center justify-center flex-shrink-0 ${
                                isCurrentlyPlaying
                                  ? 'bg-red-600 hover:bg-red-500'
                                  : 'bg-purple-600 hover:bg-purple-500'
                              }`}
                              disabled={!song.file_path}
                              title={
                                !song.file_path 
                                  ? 'No audio file available' 
                                  : isCurrentlyPlaying 
                                    ? 'Pause song' 
                                    : 'Play song'
                              }
                            >
                              {isCurrentlyPlaying ? (
                                <Pause className="w-3 h-3 text-white" />
                              ) : (
                                <Play className="w-3 h-3 text-white" />
                              )}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No songs available</p>
                      <p className="text-sm mt-2">Your music library is empty.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-sm text-gray-300">{activity.song} - {activity.artist}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Playlists */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                My Playlists
              </h3>
              <div className="space-y-3">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-xs text-gray-400">{playlist.isPublic ? 'Public' : 'Private'}</div>
                    </div>
                    <div className="text-sm text-gray-400">{playlist.songCount} songs</div>
                    <div className="text-xs text-gray-500">Last played {playlist.lastPlayed}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-3 rounded-lg border transition-all ${
                    achievement.unlocked 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/2 border-white/5 opacity-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-gray-400">{achievement.description}</div>
                      </div>
                      {achievement.unlocked && (
                        <div className="text-green-400">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
