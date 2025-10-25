import { motion } from "framer-motion";
import { Home, Music, Heart, User, List, Library, TrendingUp, Mic, MessageCircle, UserCircle, Plus, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const mainMenuItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Emotion Detection", icon: Mic, path: "/emotion" },
    { name: "Recommendations", icon: TrendingUp, path: "/recommendations" },
    { name: "Social", icon: MessageCircle, path: "/social" },
    { name: "Profile", icon: UserCircle, path: "/profile" },
  ];

  const libraryItems = [
    { name: "All Songs", icon: Music, count: 1247 },
    { name: "Recently Played", icon: List, count: 48 },
  ];

  const artistsList = [
    { name: "The Weeknd", image: "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb" },
    { name: "Taylor Swift", image: "https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676" },
    { name: "Ed Sheeran", image: "https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba" },
    { name: "Adele", image: "https://i.scdn.co/image/ab6761610000e5eb68f6e5892075d7f22615bd17" },
    { name: "Dua Lipa", image: "https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232e716f0abee8d" },
  ];

  const favoritesList = [
    { name: "Blinding Lights", artist: "The Weeknd" },
    { name: "Levitating", artist: "Dua Lipa" },
    { name: "Perfect", artist: "Ed Sheeran" },
    { name: "Someone Like You", artist: "Adele" },
  ];

  const playlistsList = [
    { name: "My Favorites", songCount: 45, color: "from-purple-500 to-pink-500" },
    { name: "Workout Mix", songCount: 32, color: "from-orange-500 to-red-500" },
    { name: "Chill Vibes", songCount: 67, color: "from-blue-500 to-cyan-500" },
    { name: "Road Trip", songCount: 28, color: "from-green-500 to-emerald-500" },
    { name: "Study Focus", songCount: 52, color: "from-indigo-500 to-purple-500" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`${
        isExpanded ? "w-80" : "w-20"
      } h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 border-r border-white/10 flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          {isExpanded && (
            <div>
              <h1 className="text-xl font-bold text-white">Aura Music</h1>
              <p className="text-xs text-gray-400">Your Mood. Your Music.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Main Menu */}
        <div className="p-4">
          <div className="space-y-2">
            {mainMenuItems.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="text-sm font-medium truncate">{item.name}</span>}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Library Section */}
        {isExpanded && (
          <>
            <div className="px-4 py-2 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Library className="w-4 h-4" />
                  Library
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>
              <div className="space-y-2">
                {libraryItems.map((item) => (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.count}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Artists Section */}
            <div className="px-4 py-2 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Artists
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>
              <div className="space-y-2">
                {artistsList.map((artist) => (
                  <motion.button
                    key={artist.name}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-all"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm truncate">{artist.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Favorites Section */}
            <div className="px-4 py-2 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites
                </h3>
                <span className="text-xs text-gray-500">{favoritesList.length}</span>
              </div>
              <div className="space-y-2">
                {favoritesList.map((song, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium truncate group-hover:text-pink-400 transition-colors">
                        {song.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Playlists Section */}
            <div className="px-4 py-2 mt-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Playlists
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>
              <div className="space-y-2">
                {playlistsList.map((playlist, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-all group"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${playlist.color} rounded flex items-center justify-center flex-shrink-0`}>
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-gray-500">{playlist.songCount} songs</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toggle Button */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-all"
        >
          {isExpanded ? "←" : "→"}
        </motion.button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </motion.div>
  );
};

export default Sidebar;

