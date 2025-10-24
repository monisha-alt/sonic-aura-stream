import { motion } from "framer-motion";
import { Brain, Mic, MicOff, Heart, Smile, Frown, Meh, Zap, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmotionDetection = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const emotions = [
    { name: "Happy", icon: Smile, color: "from-yellow-400 to-orange-500", description: "Upbeat and energetic music" },
    { name: "Sad", icon: Frown, color: "from-blue-400 to-indigo-500", description: "Calm and soothing melodies" },
    { name: "Neutral", icon: Meh, color: "from-gray-400 to-slate-500", description: "Balanced and diverse playlist" },
    { name: "Excited", icon: Zap, color: "from-pink-400 to-red-500", description: "High-energy and dynamic tracks" },
  ];

  const handleStartListening = () => {
    setIsListening(true);
    setIsAnalyzing(true);
    
    // Simulate emotion detection
    setTimeout(() => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setDetectedEmotion(randomEmotion.name);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleStopListening = () => {
    setIsListening(false);
    setIsAnalyzing(false);
    setDetectedEmotion(null);
  };

  const getEmotionData = () => {
    return emotions.find(e => e.name === detectedEmotion);
  };

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
            <h1 className="text-2xl font-bold">AI Emotion Detection</h1>
            <p className="text-gray-300">Speak and let AI analyze your emotions</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-8">
        {/* Main Detection Area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 max-w-2xl"
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
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                isListening 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50" 
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50"
              }`}
            >
              {isListening ? (
                <Mic className="w-16 h-16 text-white" />
              ) : (
                <MicOff className="w-16 h-16 text-white" />
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

          {/* Status Text */}
          <div className="space-y-4">
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center space-x-2"
              >
                <Brain className="w-6 h-6 animate-pulse" />
                <span className="text-lg">Analyzing your voice...</span>
              </motion.div>
            )}

            {detectedEmotion && !isAnalyzing && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-2xl font-bold text-green-400">
                  Emotion Detected: {detectedEmotion}
                </div>
                <div className="text-gray-300">
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
                onClick={handleStartListening}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Mic className="w-6 h-6" />
                Start Detection
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopListening}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
