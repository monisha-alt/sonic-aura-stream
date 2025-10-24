import { motion } from "framer-motion";
import { Music, Brain, Sparkles, TrendingUp, Calendar, MessageCircle, User, Mic, Cloud, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(timeInterval);
    };
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
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity as number,
    },
  };

  const navItems = [
    { name: "Home", path: "/", icon: Music },
    { name: "Emotion", path: "/emotion", icon: Brain },
    { name: "Recommendations", path: "/recommendations", icon: TrendingUp },
    { name: "Social", path: "/social", icon: MessageCircle },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

      {/* Floating musical notes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20 text-2xl pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={floatingAnimation}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity as number,
            delay: Math.random() * 2,
          }}
        >
          ♪
        </motion.div>
      ))}

      {/* Cursor glow effect */}
      <div
        className="fixed pointer-events-none z-10 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-0 left-0 right-0 z-30 p-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            <Music className="w-8 h-8" />
            Aura Music
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      <motion.div
        className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 pt-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Content */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity as number,
            }}
          >
            Aura Music
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
          >
            Your Mood. Your Music. Your World.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed"
          >
            Experience AI-powered emotion detection, context-aware recommendations, and social music discovery
            that adapts to your life in real-time.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/emotion")}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg flex items-center gap-3 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            <Mic className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Start with Emotion</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(236, 72, 153, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/recommendations")}
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold text-lg flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6" />
            <span>Smart Recommendations</span>
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {[
            {
              icon: Brain,
              title: "Voice Emotion Detection",
              description: "AI analyzes your voice to detect emotions in real-time",
              color: "from-purple-500 to-indigo-500"
            },
            {
              icon: Cloud,
              title: "Weather-Based Music",
              description: "Songs that match your current weather and mood",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: Calendar,
              title: "Calendar Integration",
              description: "Playlists based on your upcoming events and tasks",
              color: "from-green-500 to-emerald-500"
            },
            {
              icon: MessageCircle,
              title: "Social Timestamps",
              description: "Comment and react at specific song moments",
              color: "from-pink-500 to-rose-500"
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Context Info */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location-based recommendations
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-powered discovery
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;