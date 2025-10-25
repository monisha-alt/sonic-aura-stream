import { motion } from "framer-motion";
import { User, Clock, Key, ArrowLeft, Settings, Music, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomSongs } from "../data/realSongs";

const Profile = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    totalSongs: 1247,
    unlistenedSongs: 23,
    totalPlayTime: "2,847 hours",
    favoriteGenre: "Indie Pop",
    joinDate: "January 2024"
  });

  const [recentActivity] = useState([
    { action: "Liked", song: "Midnight City", artist: "M83", time: "2 hours ago" },
    { action: "Shared", song: "Blinding Lights", artist: "The Weeknd", time: "5 hours ago" },
    { action: "Added to playlist", song: "Levitating", artist: "Dua Lipa", time: "1 day ago" },
    { action: "Commented on", song: "Good 4 U", artist: "Olivia Rodrigo", time: "2 days ago" },
  ]);

  const [unlistenedSongs, setUnlistenedSongs] = useState(
    getRandomSongs(5).map((song, index) => ({
      ...song,
      addedDate: index === 0 ? "Today" : index === 1 ? "Yesterday" : `${index} days ago`
    }))
  );

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

  const markAsListened = (songId: string) => {
    setUnlistenedSongs(unlistenedSongs.filter(song => song.id !== songId));
    setUserStats(prev => ({ ...prev, unlistenedSongs: prev.unlistenedSongs - 1 }));
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
          {/* Unlistened Songs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold">Unlistened Songs</h3>
              <div className="px-3 py-1 bg-yellow-400/20 rounded-full text-yellow-400 text-sm font-medium">
                {unlistenedSongs.length} new
              </div>
            </div>
            
            <div className="space-y-4">
              {unlistenedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <img 
                    src={song.albumArt} 
                    alt={song.album}
                    className="w-16 h-16 rounded-lg object-cover shadow-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold group-hover:text-purple-400 transition-colors">{song.title}</h4>
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
                    {song.spotifyId && (
                      <a
                        href={`https://open.spotify.com/track/${song.spotifyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-600 hover:bg-green-500 rounded-full transition-colors"
                        title="Open in Spotify"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => markAsListened(song.id)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      Mark as Listened
                    </motion.button>
                  </div>
                </motion.div>
              ))}
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
