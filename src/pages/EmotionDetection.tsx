import { motion } from "framer-motion";
import { Brain, Mic, MicOff, Heart, Smile, Frown, Zap, AlertCircle, Play, Pause } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";

// Type definitions for SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  onaudiostart: () => void;
  onsoundstart: () => void;
  onspeechstart: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

const EmotionDetection = () => {
  const [isListening, setIsListening] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { allTracks, filterByEmotion, loading } = useMusicLibrary();
  const { play: playTrack, pause: pauseTrack, currentTrack, isPlaying } = useMusicPlayer();

  // Check if SpeechRecognition is supported
  const isSupported = useMemo(() => {
    return typeof window !== 'undefined' && (
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window
    );
  }, []);

  // Use local songs based on detected emotion from actual metadata
  const recommendedSongs = useMemo(() => {
    if (!detectedEmotion) return [];
    // Map "Excited" to "energetic" for song filtering
    let emotion = detectedEmotion.toLowerCase();
    if (emotion === 'excited') {
      emotion = 'energetic';
    }
    const emotionType = emotion as 'happy' | 'sad' | 'calm' | 'energetic' | 'romantic' | 'angry';
    const songs = filterByEmotion(emotionType).slice(0, 5);
    console.log('🎵 Recommended songs for', detectedEmotion, ':', songs.length, songs);
    return songs;
  }, [detectedEmotion, filterByEmotion]);

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

  // Classify emotion from text transcript
  const classifyEmotionFromText = (text: string): { emotion: string; confidence: number } | null => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const lowerText = text.toLowerCase();
    
    // Define emotion keywords and patterns
    const emotionPatterns = {
      happy: {
        keywords: ['happy', 'great', 'good', 'awesome', 'excellent', 'wonderful', 'amazing', 'fantastic', 'joy', 'excited', 'love', 'loved', 'beautiful', 'perfect', 'best', 'yes', 'yeah', 'yay', 'smile', 'laugh', 'fun', 'enjoy'],
        weight: 1.0
      },
      excited: {
        keywords: ['excited', 'energetic', "let's go", 'ready', 'fast', 'quick', 'rush', 'adrenaline', 'pumped', 'hyped', 'thrilled', 'ecstatic', 'fire', 'lit'],
        weight: 1.2
      },
      sad: {
        keywords: ['sad', 'bad', 'terrible', 'awful', 'horrible', 'depressed', 'down', 'upset', 'cry', 'tears', 'lonely', 'alone', 'hurt', 'pain', 'sorrow', 'grief', 'disappointed', 'frustrated'],
        weight: 1.0
      },
      angry: {
        keywords: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'irritated', 'frustrated', 'upset', 'disgusted', 'disgusting', 'terrible', 'awful', 'hate', 'stupid', 'idiot', 'damn', 'hell'],
        weight: 1.3
      },
      calm: {
        keywords: ['calm', 'peaceful', 'relax', 'quiet', 'slow', 'gentle', 'soft', 'easy', 'chill', 'zen', 'meditation', 'serene', 'tranquil', 'soothing', 'comfortable'],
        weight: 1.0
      },
      romantic: {
        keywords: ['love', 'romantic', 'beautiful', 'sweet', 'darling', 'honey', 'dear', 'heart', 'kiss', 'hug', 'together', 'forever', 'soulmate', 'perfect', 'dream', 'angel'],
        weight: 1.1
      }
    };

    // Calculate scores for each emotion
    const scores: { [key: string]: number } = {};
    
    Object.entries(emotionPatterns).forEach(([emotion, pattern]) => {
      let score = 0;
      pattern.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length * pattern.weight;
        }
      });
      scores[emotion] = score;
    });

    // Find the emotion with highest score
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      // No emotion keywords found - use sentiment analysis
      // Count positive vs negative words
      const positiveWords = ['good', 'nice', 'okay', 'fine', 'well', 'ok', 'alright'];
      const negativeWords = ['bad', 'not', "don't", "can't", 'no', 'never'];
      
      const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
      
      if (positiveCount > negativeCount) {
        return { emotion: 'Happy', confidence: 0.6 };
      } else if (negativeCount > positiveCount) {
        return { emotion: 'Sad', confidence: 0.6 };
      } else {
        return { emotion: 'Calm', confidence: 0.5 };
      }
    }

    const detectedEmotion = Object.keys(scores).find(key => scores[key] === maxScore) || 'Calm';
    const confidence = Math.min(maxScore / 10, 0.95); // Normalize confidence
    
    // Capitalize first letter
    const capitalizedEmotion = detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1);
    
    return { 
      emotion: capitalizedEmotion === 'Excited' ? 'Excited' : capitalizedEmotion,
      confidence: Math.max(confidence, 0.5)
    };
  };

  const startListening = () => {
    if (!isSupported) {
      setErrorMessage("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      // Initialize SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false; // Stop after one sentence
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US';
      
      // Reset states
      setIsListening(true);
      setIsAnalyzing(false);
      setDetectedEmotion(null);
      setTranscript("");
      setErrorMessage(null);
      setStatusMessage("Listening... please speak now.");
      
      // Handle recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex];
        const transcriptText = result[0].transcript.trim();
        
        console.log('🎤 Speech detected:', transcriptText);
        console.log('🎤 Confidence:', result[0].confidence);
        
        if (!transcriptText || transcriptText.length === 0) {
          setErrorMessage("No valid human voice detected. Please speak clearly.");
          setIsListening(false);
          setIsAnalyzing(false);
          return;
        }
        
        setTranscript(transcriptText);
        setStatusMessage("Voice detected → converting to text...");
        setIsAnalyzing(true);
        
        // Classify emotion from transcript
        setTimeout(() => {
          const emotionResult = classifyEmotionFromText(transcriptText);
          
          if (emotionResult && emotionResult.emotion) {
            console.log('🎭 Emotion classified:', emotionResult.emotion, 'Confidence:', emotionResult.confidence);
            setDetectedEmotion(emotionResult.emotion);
            setIsAnalyzing(false);
            setStatusMessage("");
            setErrorMessage(null);
          } else {
            setErrorMessage("Could not detect emotion. Please try speaking again.");
            setIsAnalyzing(false);
            setIsListening(false);
          }
        }, 500);
      };
      
      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Speech recognition error:', event.error);
        
        let errorMsg = "Speech recognition error occurred.";
        
        switch (event.error) {
          case 'no-speech':
            errorMsg = "No valid human voice detected. Please speak clearly.";
            break;
          case 'audio-capture':
            errorMsg = "Microphone access denied. Please allow microphone permissions.";
            break;
          case 'network':
            errorMsg = "Network error. Please check your internet connection.";
            break;
          case 'not-allowed':
            errorMsg = "Microphone access denied. Please allow microphone permissions.";
            break;
          case 'aborted':
            // User stopped manually, don't show error
            return;
          default:
            errorMsg = `Speech recognition error: ${event.error}`;
        }
        
        setErrorMessage(errorMsg);
        setIsListening(false);
        setIsAnalyzing(false);
      };
      
      // Handle end of recognition
      recognition.onend = () => {
        setIsListening(false);
        if (!detectedEmotion && !errorMessage) {
          // Recognition ended without result - might be timeout
          if (!transcript) {
            setErrorMessage("No speech detected. Please try again.");
          }
        }
      };
      
      // Handle start
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setStatusMessage("Listening... please speak now.");
      };
      
      // Handle audio start
      recognition.onaudiostart = () => {
        console.log('🎤 Audio capture started');
      };
      
      // Handle speech start
      recognition.onspeechstart = () => {
        console.log('🎤 Speech detected');
        setStatusMessage("Voice detected → converting to text...");
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setErrorMessage("Failed to start speech recognition. Please try again.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    setIsAnalyzing(false);
    setStatusMessage("");
  };

  const getEmotionData = () => {
    return emotions.find(e => e.name === detectedEmotion);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold">AI Voice Emotion Detection</h1>
          <p className="text-gray-300 mt-1">Speak naturally and let AI analyze your emotions</p>
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
            {!isSupported && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-2 text-red-400 bg-red-400/10 px-6 py-3 rounded-lg border border-red-400/30"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
                </span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-2 text-yellow-400 bg-yellow-400/10 px-6 py-3 rounded-lg border border-yellow-400/30"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}

            {statusMessage && !errorMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center space-x-2 text-blue-400"
              >
                <Mic className="w-5 h-5" />
                <span className="text-lg">{statusMessage}</span>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center space-x-2"
              >
                <Brain className="w-6 h-6 animate-pulse" />
                <span className="text-lg">Analyzing your voice for emotions...</span>
              </motion.div>
            )}

            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-400 italic"
              >
                "{transcript}"
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

            {!isListening && !isAnalyzing && !detectedEmotion && !errorMessage && (
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
                disabled={!isSupported}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          {detectedEmotion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
            >
              <h3 className="text-2xl font-semibold mb-6 text-center">
                🎵 Recommended Songs for {detectedEmotion} Mood
              </h3>
              
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-pulse">Loading songs...</div>
                </div>
              ) : recommendedSongs.length > 0 ? (
              <div className="space-y-4">
                {recommendedSongs.map((song, index) => {
                  const isCurrentTrack = currentTrack?.track_id === song.track_id;
                  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
                  
                  return (
                    <motion.div
                      key={song.track_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
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
                        <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                          {song.track_name}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                        <p className="text-xs text-gray-500 truncate">{song.album} • {song.duration}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
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
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No songs found for {detectedEmotion} mood.</p>
                  <p className="text-sm mt-2">Total tracks loaded: {allTracks.length}</p>
                  <p className="text-xs mt-1 text-gray-500">Try detecting a different emotion.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* AI Features Info */}
          <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-center">AI Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="font-medium">Voice Analysis</div>
                <div className="text-gray-400">Google Web Speech API</div>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                <div className="font-medium">Emotion Mapping</div>
                <div className="text-gray-400">Text sentiment analysis</div>
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
