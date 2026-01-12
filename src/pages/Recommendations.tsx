import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Moon, Sunrise, Sunset, Clock, Calendar, Play, Pause, Heart, Key } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { MusicTrack } from "../types/music";

const Recommendations = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState<string>("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const { allTracks, filterByEmotion } = useMusicLibrary();
  const { currentTrack, isPlaying, play: playTrack, pause: pauseTrack, playlist } = useMusicPlayer();
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  
  // Update activePlaylist when playback stops
  useEffect(() => {
    if (!isPlaying) {
      setActivePlaylist(null);
    }
  }, [isPlaying]);
  
  // Use local songs from actual metadata - get random 10 songs
  const recommendedSongs = useMemo(() => {
    const shuffled = [...allTracks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [allTracks]);

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

    // Get user location and fetch real weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location:', latitude, longitude);
          try {
            // Get city name from coordinates (reverse geocoding)
            const geoResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const geoData = await geoResponse.json();
            const cityName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown';
            const countryName = geoData.countryName || '';
            setLocation(`${cityName}${countryName ? ', ' + countryName : ''}`);

            // Fetch real weather data using Open-Meteo API (free, no API key needed)
            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`
            );
            
            if (weatherResponse.ok) {
              const weatherData = await weatherResponse.json();
              const weatherCode = weatherData.current?.weather_code || 0;
              
              // Map WMO weather codes to conditions
              const weatherConditions: { [key: number]: { condition: string; description: string } } = {
                0: { condition: 'Clear', description: 'Clear sky' },
                1: { condition: 'Clear', description: 'Mainly clear' },
                2: { condition: 'Cloudy', description: 'Partly cloudy' },
                3: { condition: 'Cloudy', description: 'Overcast' },
                45: { condition: 'Foggy', description: 'Foggy' },
                48: { condition: 'Foggy', description: 'Depositing rime fog' },
                51: { condition: 'Rainy', description: 'Light drizzle' },
                53: { condition: 'Rainy', description: 'Moderate drizzle' },
                55: { condition: 'Rainy', description: 'Dense drizzle' },
                56: { condition: 'Rainy', description: 'Light freezing drizzle' },
                57: { condition: 'Rainy', description: 'Dense freezing drizzle' },
                61: { condition: 'Rainy', description: 'Slight rain' },
                63: { condition: 'Rainy', description: 'Moderate rain' },
                65: { condition: 'Rainy', description: 'Heavy rain' },
                66: { condition: 'Rainy', description: 'Light freezing rain' },
                67: { condition: 'Rainy', description: 'Heavy freezing rain' },
                71: { condition: 'Snowy', description: 'Slight snow fall' },
                73: { condition: 'Snowy', description: 'Moderate snow fall' },
                75: { condition: 'Snowy', description: 'Heavy snow fall' },
                77: { condition: 'Snowy', description: 'Snow grains' },
                80: { condition: 'Rainy', description: 'Slight rain showers' },
                81: { condition: 'Rainy', description: 'Moderate rain showers' },
                82: { condition: 'Rainy', description: 'Violent rain showers' },
                85: { condition: 'Snowy', description: 'Slight snow showers' },
                86: { condition: 'Snowy', description: 'Heavy snow showers' },
                95: { condition: 'Thunderstorm', description: 'Thunderstorm' },
                96: { condition: 'Thunderstorm', description: 'Thunderstorm with slight hail' },
                99: { condition: 'Thunderstorm', description: 'Thunderstorm with heavy hail' }
              };
              
              const weatherInfo = weatherConditions[weatherCode] || { condition: 'Clear', description: 'Clear sky' };
              
              setWeather({
                condition: weatherInfo.condition,
                temperature: Math.round(weatherData.current?.temperature_2m || 20),
                humidity: Math.round(weatherData.current?.relative_humidity_2m || 0),
                description: weatherInfo.description,
                windSpeed: Math.round((weatherData.current?.wind_speed_10m || 0) * 3.6) // Convert m/s to km/h
              });
            } else {
              throw new Error('Weather API failed');
            }
          } catch (error) {
            console.error("Error fetching weather:", error);
            // Fallback to default weather
            setWeather({
              condition: "Clear",
              temperature: 22,
              humidity: 60,
              description: "Weather data unavailable"
            });
            setLocation("Location detected");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation("Location not available");
          // Set default weather if location is denied
          setWeather({
            condition: "Clear",
            temperature: 22,
            humidity: 60,
            description: "Enable location to get real weather"
          });
        }
      );
    } else {
      setLocation("Geolocation not supported");
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

  // Get tracks for a playlist based on emotion/mood
  const getTracksForPlaylist = (playlistTitle: string): MusicTrack[] => {
    // Map playlist titles to emotions
    const playlistToEmotion: { [key: string]: 'happy' | 'sad' | 'calm' | 'energetic' | 'romantic' } = {
      "Sunny Vibes": "happy",
      "Rainy Day Blues": "sad",
      "Cloudy Thoughts": "calm",
      "Morning Energy": "energetic",
      "Afternoon Groove": "energetic",
      "Evening Wind Down": "calm",
      "Night Vibes": "calm",
      "Workout Power": "energetic",
      "Focus Mode": "calm",
      "Romantic Evening": "romantic"
    };

    const emotion = playlistToEmotion[playlistTitle];
    if (emotion) {
      const filtered = filterByEmotion(emotion);
      return filtered.length > 0 ? filtered.slice(0, 10) : allTracks.slice(0, 10);
    }
    
    // Fallback: return random tracks
    return allTracks.slice(0, 10);
  };

  const handlePlayPlaylist = (playlistTitle: string) => {
    const isCurrentlyActive = activePlaylist === playlistTitle && isPlaying;
    
    if (isCurrentlyActive) {
      // Pause if this playlist is currently playing
      console.log('⏸️ Pausing playlist:', playlistTitle);
      pauseTrack();
      setActivePlaylist(null);
    } else {
      // Play the playlist
      const tracks = getTracksForPlaylist(playlistTitle);
      if (tracks.length > 0) {
        console.log('🎵 Playing playlist:', playlistTitle, 'with', tracks.length, 'tracks');
        playTrack(tracks[0], tracks);
        setActivePlaylist(playlistTitle);
      } else {
        console.warn('⚠️ No tracks available for playlist:', playlistTitle);
      }
    }
  };

  // Check if a playlist is currently active
  const isPlaylistActive = (playlistTitle: string) => {
    return activePlaylist === playlistTitle && isPlaying && playlist.length > 0;
  };
  
  // Update activePlaylist when playback stops
  useEffect(() => {
    if (!isPlaying) {
      setActivePlaylist(null);
    }
  }, [isPlaying]);

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
            color: "from-yellow-400 to-orange-500",
            emotion: "happy"
          });
          break;
        case "rainy":
        case "rain":
          playlists.push({
            title: "Rainy Day Blues",
            description: "Cozy songs for rainy weather",
            songs: ["Raindrops Keep Fallin'", "Have You Ever Seen the Rain", "Purple Rain"],
            color: "from-blue-400 to-indigo-500",
            emotion: "sad"
          });
          break;
        case "cloudy":
          playlists.push({
            title: "Cloudy Thoughts",
            description: "Mellow tracks for overcast days",
            songs: ["Clouds", "Grey Day", "Overcast"],
            color: "from-gray-400 to-slate-500",
            emotion: "calm"
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
          color: "from-orange-400 to-yellow-500",
          emotion: "energetic"
        });
        break;
      case "Afternoon":
        playlists.push({
          title: "Afternoon Groove",
          description: "Energetic songs for the afternoon",
          songs: ["Afternoon Delight", "Midday Sun", "Lunch Break"],
          color: "from-yellow-400 to-orange-500",
          emotion: "energetic"
        });
        break;
      case "Evening":
        playlists.push({
          title: "Evening Wind Down",
          description: "Relaxing tracks for the evening",
          songs: ["Evening Song", "Sunset Boulevard", "Twilight"],
          color: "from-red-400 to-pink-500",
          emotion: "calm"
        });
        break;
      case "Night":
        playlists.push({
          title: "Night Vibes",
          description: "Chill tracks for the night",
          songs: ["Midnight City", "Night Moves", "Starry Night"],
          color: "from-indigo-400 to-purple-500",
          emotion: "calm"
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
            color: "from-red-500 to-pink-500",
            emotion: "energetic"
          });
          break;
        case "study":
          playlists.push({
            title: "Focus Mode",
            description: "Concentration music for studying",
            songs: ["Weightless", "Study Music", "Deep Focus"],
            color: "from-green-500 to-teal-500",
            emotion: "calm"
          });
          break;
        case "romantic":
          playlists.push({
            title: "Romantic Evening",
            description: "Love songs for your date night",
            songs: ["All of Me", "Perfect", "Thinking Out Loud"],
            color: "from-pink-500 to-rose-500",
            emotion: "romantic"
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
                  onClick={() => handlePlayPlaylist(playlist.title)}
                  className={`mt-4 w-full py-2 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2 ${
                    isPlaylistActive(playlist.title)
                      ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                  }`}
                >
                  {isPlaylistActive(playlist.title) ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Playlist
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Play Playlist
                    </>
                  )}
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
          </h2>
          
          <div className="space-y-4">
            {recommendedSongs.map((song, index) => {
              const isCurrentTrack = currentTrack?.track_id === song.track_id;
              const isCurrentlyPlaying = isCurrentTrack && isPlaying;
              
              return (
              <motion.div
                key={song.track_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 5 }}
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
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">{song.track_name}</h3>
                    {index % 3 === 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-yellow-400 flex-shrink-0"
                        title="Unlistened - New Discovery!"
                      >
                        <Key className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  <p className="text-xs text-gray-500 truncate">{song.album} • {song.genre}</p>
                </div>

                <div className="text-sm text-gray-400 flex-shrink-0">{song.duration}</div>

                <div className="flex items-center gap-2 flex-shrink-0">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentlyPlaying) {
                        console.log('⏸️ Pausing:', song.track_name);
                        pauseTrack();
                      } else {
                        console.log('🎵 Playing:', song.track_name, song.file_path);
                        playTrack(song, recommendedSongs);
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
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;
