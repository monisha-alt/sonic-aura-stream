import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Moon, Sunrise, Sunset, Clock, Calendar, Play, Heart, Key, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { getRandomSongs } from "../data/realSongs";
import { useSpotifyTrending } from "../hooks/useSpotify";

const Recommendations = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState<string>("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  
  // Fetch trending songs from Spotify API
  const { songs: spotifySongs, loading: spotifyLoading } = useSpotifyTrending(true);
  
  // Use Spotify songs if available, otherwise fallback to hardcoded
  const recommendedSongs = spotifySongs.length > 0 ? spotifySongs.slice(0, 10) : getRandomSongs(10);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay("Morning");
      else if (hour >= 12 && hour < 17) setTimeOfDay("Afternoon");
      else if (hour >= 17 && hour < 21) setTimeOfDay("Evening");
      else setTimeOfDay("Night");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location:', latitude, longitude);
          try {
            // Simulate weather API call
            setWeather({
              condition: "Sunny",
              temperature: 24,
              humidity: 65,
              description: "Clear sky with light winds"
            });
            setLocation("New York, NY");
          } catch (error) {
            console.error("Error fetching weather:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation("Location not available");
        }
      );
    }

    // Simulate calendar events
    setCalendarEvents([
      { title: "Workout", time: "18:00", type: "exercise" },
      { title: "Study Session", time: "20:00", type: "study" },
      { title: "Date Night", time: "19:30", type: "romantic" }
    ]);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-400" />;
      case "rainy":
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case "cloudy":
      case "overcast":
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case "snowy":
      case "snow":
        return <Cloud className="w-8 h-8 text-blue-200" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case "Morning":
        return <Sunrise className="w-6 h-6 text-orange-400" />;
      case "Afternoon":
        return <Sun className="w-6 h-6 text-yellow-400" />;
      case "Evening":
        return <Sunset className="w-6 h-6 text-red-400" />;
      case "Night":
        return <Moon className="w-6 h-6 text-indigo-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getContextualPlaylists = () => {
    const playlists = [];

    // Weather-based playlists
    if (weather) {
      switch (weather.condition?.toLowerCase()) {
        case "sunny":
        case "clear":
          playlists.push({
            title: "Sunny Vibes",
            description: "Upbeat tracks perfect for sunny weather",
            songs: ["Walking on Sunshine", "Here Comes the Sun", "Good Day Sunshine"],
            color: "from-yellow-400 to-orange-500"
          });
          break;
        case "rainy":
        case "rain":
          playlists.push({
            title: "Rainy Day Blues",
            description: "Cozy songs for rainy weather",
            songs: ["Raindrops Keep Fallin'", "Have You Ever Seen the Rain", "Purple Rain"],
            color: "from-blue-400 to-indigo-500"
          });
          break;
        case "cloudy":
          playlists.push({
            title: "Cloudy Thoughts",
            description: "Mellow tracks for overcast days",
            songs: ["Clouds", "Grey Day", "Overcast"],
            color: "from-gray-400 to-slate-500"
          });
          break;
      }
    }

    // Time-based playlists
    switch (timeOfDay) {
      case "Morning":
        playlists.push({
          title: "Morning Energy",
          description: "Fresh tracks to start your day",
          songs: ["Good Morning", "Rise and Shine", "Morning Glory"],
          color: "from-orange-400 to-yellow-500"
        });
        break;
      case "Afternoon":
        playlists.push({
          title: "Afternoon Groove",
          description: "Energetic songs for the afternoon",
          songs: ["Afternoon Delight", "Midday Sun", "Lunch Break"],
          color: "from-yellow-400 to-orange-500"
        });
        break;
      case "Evening":
        playlists.push({
          title: "Evening Wind Down",
          description: "Relaxing tracks for the evening",
          songs: ["Evening Song", "Sunset Boulevard", "Twilight"],
          color: "from-red-400 to-pink-500"
        });
        break;
      case "Night":
        playlists.push({
          title: "Night Vibes",
          description: "Chill tracks for the night",
          songs: ["Midnight City", "Night Moves", "Starry Night"],
          color: "from-indigo-400 to-purple-500"
        });
        break;
    }

    // Calendar-based playlists
    calendarEvents.forEach(event => {
      switch (event.type) {
        case "exercise":
          playlists.push({
            title: "Workout Power",
            description: "High-energy tracks for your workout",
            songs: ["Eye of the Tiger", "Stronger", "Can't Stop"],
            color: "from-red-500 to-pink-500"
          });
          break;
        case "study":
          playlists.push({
            title: "Focus Mode",
            description: "Concentration music for studying",
            songs: ["Weightless", "Study Music", "Deep Focus"],
            color: "from-green-500 to-teal-500"
          });
          break;
        case "romantic":
          playlists.push({
            title: "Romantic Evening",
            description: "Love songs for your date night",
            songs: ["All of Me", "Perfect", "Thinking Out Loud"],
            color: "from-pink-500 to-rose-500"
          });
          break;
      }
    });

    return playlists;
  };


  const playlists = getContextualPlaylists();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold">Smart Recommendations</h1>
          <p className="text-gray-300 mt-1">AI-powered playlists based on your context</p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Context Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Weather */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              {weather ? getWeatherIcon(weather.condition) : <Cloud className="w-8 h-8 text-gray-400" />}
              <div>
                <h3 className="font-semibold">Weather</h3>
                <p className="text-sm text-gray-400">{location}</p>
              </div>
            </div>
            {weather ? (
              <div>
                <div className="text-2xl font-bold">{weather.temperature}°C</div>
                <div className="text-sm text-gray-300">{weather.condition}</div>
                <div className="text-xs text-gray-400 mt-1">{weather.description}</div>
              </div>
            ) : (
              <div className="text-gray-400">Loading weather...</div>
            )}
          </div>

          {/* Time */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              {getTimeIcon(timeOfDay)}
              <div>
                <h3 className="font-semibold">Time of Day</h3>
                <p className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-2xl font-bold">{timeOfDay}</div>
            <div className="text-sm text-gray-300">{currentTime.toLocaleTimeString()}</div>
          </div>

          {/* Calendar */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="font-semibold">Upcoming Events</h3>
                <p className="text-sm text-gray-400">Today's schedule</p>
              </div>
            </div>
            <div className="space-y-2">
              {calendarEvents.slice(0, 2).map((event, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-gray-400">{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contextual Playlists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Contextual Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -5 }}
                className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${playlist.color} flex items-center justify-center mb-4`}>
                  <Play className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{playlist.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{playlist.description}</p>
                <div className="space-y-2">
                  {playlist.songs.slice(0, 3).map((song, songIndex) => (
                    <div key={songIndex} className="text-sm text-gray-300">
                      • {song}
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                  Play Playlist
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Songs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            🎵 Recommended Songs
            {spotifyLoading && <span className="text-sm text-gray-400 ml-2">(Loading from Spotify...)</span>}
          </h2>
          
          {spotifyLoading && recommendedSongs.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Fetching trending songs from Spotify...</p>
            </div>
          ) : (
          <div className="space-y-4">
            {recommendedSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
              >
                <img 
                  src={song.albumArt} 
                  alt={song.album}
                  className="w-16 h-16 rounded-lg object-cover shadow-lg"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{song.title}</h3>
                    {index % 3 === 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-yellow-400"
                        title="Unlistened - New Discovery!"
                      >
                        <Key className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                  <p className="text-xs text-gray-500">{song.album} • {song.genre}</p>
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
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;
