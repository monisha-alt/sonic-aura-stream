import { motion } from "framer-motion";
import { Music, Brain, Sparkles, Play, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      
      {/* Interactive cursor glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30"
        animate={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Music className="w-6 h-6 text-purple-400/30" />
          </motion.div>
        ))}
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Aura Music
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <motion.button
                whileHover={{ scale: 1.1, color: "#c084fc" }}
                className="text-white/80 hover:text-purple-400 transition-colors font-medium"
                onClick={() => navigate("/")}
              >
                Home
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, color: "#c084fc" }}
                className="text-white/80 hover:text-purple-400 transition-colors font-medium"
                onClick={() => navigate("/emotion")}
              >
                Emotion
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, color: "#c084fc" }}
                className="text-white/80 hover:text-purple-400 transition-colors font-medium"
                onClick={() => navigate("/recommendations")}
              >
                Recommendations
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo/Icon */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <motion.div
              animate={floatingAnimation}
              className="relative"
            >
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full p-8 border border-white/10">
                <Music className="w-20 h-20 text-purple-400" />
              </div>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
          >
            Aura Music
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl text-white/90 mb-4 font-light"
          >
            Your Mood. Your Music. Your World.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto"
          >
            Experience AI-powered emotion detection and personalized music recommendations
            that match your feelings in real-time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              <Play className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Start Listening</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(236, 72, 153, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/emotion")}
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold text-lg flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Brain className="w-6 h-6" />
              <span>Detect Emotion</span>
            </motion.button>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Brain,
                title: "AI Emotion Detection",
                description: "Advanced voice analysis to detect your mood",
              },
              {
                icon: TrendingUp,
                title: "Smart Recommendations",
                description: "Personalized playlists based on your emotions",
              },
              {
                icon: Sparkles,
                title: "Mood Matching",
                description: "Music that adapts to how you feel",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse" />
      
      {/* Glowing orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
      />
    </div>
  );
};

export default LandingPage;

