import { motion } from "framer-motion";
import { Brain, Mic, MicOff, Heart, Smile, Frown, Zap, ArrowLeft, Volume2, AlertCircle, Play, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSongsByMood, Song } from "../data/realSongs";

const EmotionDetection = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isValidVoice, setIsValidVoice] = useState(true);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const audioRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const emotions = [
    { 
      name: "Happy", 
      icon: Smile, 
      color: "from-yellow-400 to-orange-500", 
      description: "Upbeat and energetic music",
      songs: ["Dancing Queen", "Happy", "Good Vibrations"]
    },
    { 
      name: "Sad", 
      icon: Frown, 
      color: "from-blue-400 to-indigo-500", 
      description: "Calm and soothing melodies",
      songs: ["Someone Like You", "Hurt", "Mad World"]
    },
    { 
      name: "Calm", 
      icon: Heart, 
      color: "from-green-400 to-teal-500", 
      description: "Peaceful and relaxing tracks",
      songs: ["Weightless", "Clair de Lune", "River Flows in You"]
    },
    { 
      name: "Angry", 
      icon: Zap, 
      color: "from-red-400 to-pink-500", 
      description: "Intense and powerful music",
      songs: ["Break Stuff", "Killing in the Name", "Bodies"]
    },
    { 
      name: "Excited", 
      icon: Zap, 
      color: "from-pink-400 to-purple-500", 
      description: "High-energy and dynamic tracks",
      songs: ["Thunder", "Eye of the Tiger", "We Will Rock You"]
    },
    { 
      name: "Romantic", 
      icon: Heart, 
      color: "from-rose-400 to-pink-500", 
      description: "Love songs and romantic ballads",
      songs: ["All of Me", "Perfect", "Thinking Out Loud"]
    },
  ];

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = stream;
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      analyserRef.current = analyser;
      
      setIsListening(true);
      setIsAnalyzing(true);
      setIsValidVoice(true);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
      // Simulate emotion detection after 3 seconds
      setTimeout(() => {
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setDetectedEmotion(randomEmotion.name);
        setIsAnalyzing(false);
        
        // Load real songs based on detected emotion
        const songs = getSongsByMood(randomEmotion.name);
        setRecommendedSongs(songs.slice(0, 5));
      }, 3000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsValidVoice(false);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      
      // Check if there's valid voice input (not just background noise)
      if (average < 5) {
        setIsValidVoice(false);
      } else {
        setIsValidVoice(true);
      }
      
      if (isListening) {
        animationRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const stopListening = () => {
    if (audioRef.current) {
      audioRef.current.getTracks().forEach(track => track.stop());
      audioRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsListening(false);
    setIsAnalyzing(false);
    setDetectedEmotion(null);
    setAudioLevel(0);
  };

  const getEmotionData = () => {
    return emotions.find(e => e.name === detectedEmotion);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
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
            <h1 className="text-2xl font-bold">AI Voice Emotion Detection</h1>
            <p className="text-gray-300">Speak naturally and let AI analyze your emotions</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 max-w-4xl"
        >
          {/* Microphone Visual */}
          <div className="relative">
            <motion.div
              animate={{
                scale: isListening ? [1, 1.2, 1] : 1,
                rotate: isListening ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut"
              }}
              className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center ${
                isListening 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50" 
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50"
              }`}
            >
              {isListening ? (
                <Mic className="w-20 h-20 text-white" />
              ) : (
                <MicOff className="w-20 h-20 text-white" />
              )}
            </motion.div>

            {/* Audio level indicator */}
            {isListening && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-red-500"
                      style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                      animate={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pulse rings when listening */}
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                />
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-pink-400"
                />
              </>
            )}
          </div>

          {/* Status Messages */}
          <div className="space-y-4">
            {!isValidVoice && isListening && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-2 text-yellow-400"
              >
                <AlertCircle className="w-5 h-5" />
                <span>No valid voice detected. Please speak clearly.</span>
              </motion.div>
            )}

            {isAnalyzing && isValidVoice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center space-x-2"
              >
                <Brain className="w-6 h-6 animate-pulse" />
                <span className="text-lg">Analyzing your voice for emotions...</span>
              </motion.div>
            )}

            {detectedEmotion && !isAnalyzing && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-3xl font-bold text-green-400">
                  Emotion Detected: {detectedEmotion}
                </div>
                <div className="text-gray-300 text-lg">
                  {getEmotionData()?.description}
                </div>
              </motion.div>
            )}

            {!isListening && !isAnalyzing && !detectedEmotion && (
              <div className="text-xl text-gray-300">
                Click the microphone to start emotion detection
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {!isListening ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startListening}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Mic className="w-6 h-6" />
                Start Detection
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopListening}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-red-500/50 transition-all"
              >
                <MicOff className="w-6 h-6" />
                Stop Detection
              </motion.button>
            )}
          </div>

          {/* Emotion Examples */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-6">Detected Emotions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {emotions.map((emotion) => {
                const isDetected = detectedEmotion === emotion.name;
                return (
                  <motion.div
                    key={emotion.name}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isDetected 
                        ? "border-green-400 bg-green-400/10" 
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <emotion.icon className={`w-8 h-8 mx-auto mb-2 ${
                      isDetected ? "text-green-400" : "text-gray-400"
                    }`} />
                    <div className={`text-sm font-medium text-center ${
                      isDetected ? "text-green-400" : "text-gray-300"
                    }`}>
                      {emotion.name}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recommended Songs */}
          {detectedEmotion && recommendedSongs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
            >
              <h3 className="text-2xl font-semibold mb-6 text-center">
                🎵 Recommended Songs for {detectedEmotion} Mood
              </h3>
              <div className="space-y-4">
                {recommendedSongs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <img 
                      src={song.albumArt} 
                      alt={song.album}
                      className="w-16 h-16 rounded-lg object-cover shadow-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                      <p className="text-xs text-gray-500">{song.album} • {song.duration}</p>
                    </div>
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
                      <button className="p-2 bg-purple-600 hover:bg-purple-500 rounded-full transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Features Info */}
          <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-center">AI Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="font-medium">Voice Analysis</div>
                <div className="text-gray-400">Advanced ML models</div>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                <div className="font-medium">Emotion Mapping</div>
                <div className="text-gray-400">Real-time detection</div>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="font-medium">Smart Recommendations</div>
                <div className="text-gray-400">Personalized playlists</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmotionDetection;