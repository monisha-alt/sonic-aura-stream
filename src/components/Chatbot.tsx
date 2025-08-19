
import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Mic, MicOff, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { songs } from "@/data";
import { useEmotionDetection, EmotionType } from "@/hooks/useEmotionDetection";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSongs } from "@/hooks/useSongs";

type Message = {
  id: string;
  content: string;
  isBot: boolean;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your AI music assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [voiceEmotionData, setVoiceEmotionData] = useState<{pitch: number, speed: number, volume: number} | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();
  
  const {
    detectedEmotion,
    setDetectedEmotion,
    detectEmotionFromText,
    getSongRecommendationsForEmotion
  } = useEmotionDetection();
  
  const { playPlaylist } = useAudioPlayer();
  const { data: availableSongs = [], isLoading: songsLoading } = useSongs();
  
  // State for recommended songs display
  const [recommendedSongs, setRecommendedSongs] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Use all available songs with audio source
  const playableSongs = availableSongs.filter(song => song.audio_url);
  
  // Auto-contextual state
  const [contextualData, setContextualData] = useState<{
    location: string;
    weather: string;
    timeOfDay: string;
  } | null>(null);

  // Auto-detect contextual information on component mount
  useEffect(() => {
    // Use window interface to check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsRecognitionSupported(true);
    }
    
    // Auto-detect contextual information
    autoDetectContext();
  }, []);

  const autoDetectContext = async () => {
    try {
      // Auto-detect location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Simulate weather detection based on location
            const currentHour = new Date().getHours();
            const timeOfDay = currentHour < 6 ? 'night' : 
                             currentHour < 12 ? 'morning' : 
                             currentHour < 18 ? 'afternoon' : 'evening';
            
            // Simulate weather (in real app, would use weather API)
            const weatherOptions = ['Clear', 'Cloudy', 'Rainy', 'Sunny'];
            const simulatedWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
            
            const contextData = {
              location: 'Auto-detected',
              weather: simulatedWeather,
              timeOfDay
            };
            
            setContextualData(contextData);
            console.log('Auto-detected context:', contextData);
          },
          (error) => {
            console.log('Geolocation failed, using defaults');
            // Use default context
            const currentHour = new Date().getHours();
            const timeOfDay = currentHour < 6 ? 'night' : 
                             currentHour < 12 ? 'morning' : 
                             currentHour < 18 ? 'afternoon' : 'evening';
            
            setContextualData({
              location: 'Default',
              weather: 'Clear',
              timeOfDay
            });
          }
        );
      } else {
        // Fallback context
        const currentHour = new Date().getHours();
        const timeOfDay = currentHour < 6 ? 'night' : 
                         currentHour < 12 ? 'morning' : 
                         currentHour < 18 ? 'afternoon' : 'evening';
        
        setContextualData({
          location: 'Default',
          weather: 'Clear',
          timeOfDay
        });
      }
    } catch (error) {
      console.error('Context detection failed:', error);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      content: input,
      isBot: false,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Detect emotion from user input
    const emotion = detectEmotionFromText(input);
    setDetectedEmotion(emotion);
    setInput("");
    
    // Generate recommendations and play music based on detected emotion
    const recommendations = getSongRecommendationsForEmotion(emotion);
    
    // Filter available songs for the detected emotion
    const emotionToMoodMap: { [key in EmotionType]: string[] } = {
      happy: ["Happy", "Upbeat", "Energetic", "Feel-good"],
      sad: ["Sad", "Melancholy", "Emotional", "Dark"],
      energetic: ["Energetic", "Dance", "Upbeat", "High-energy"],
      calm: ["Relaxed", "Chill", "Peaceful", "Ambient"],
      angry: ["Intense", "Dark", "Aggressive", "Heavy"],
      romantic: ["Romantic", "Love", "Tender", "Sweet"],
      nostalgic: ["Nostalgic", "Classic", "Vintage", "Retro"]
    };
    
    // Prepare bot response
    setTimeout(() => {
      let botResponseContent = "";
      
      if (emotion && availableSongs.length > 0) {
        const targetMoods = emotionToMoodMap[emotion];
        
        // Filter songs that match the emotion
        const matchingSongs = availableSongs.filter(song => 
          song.mood && song.mood.some(mood => 
            targetMoods.some(targetMood => 
              mood.toLowerCase().includes(targetMood.toLowerCase())
            )
          )
        );
        
        if (matchingSongs.length > 0) {
          // Play the matching songs
          playPlaylist(matchingSongs, 0);
          
          botResponseContent = `🎵 Playing ${emotion} music! I've started a playlist with ${matchingSongs.length} songs that match your ${emotion} mood. Enjoy!`;
          
          toast({
            title: `🎵 Now Playing`,
            description: `Started ${emotion} playlist with ${matchingSongs.length} songs`,
            duration: 4000,
          });
        } else {
          botResponseContent = `I sense you're feeling ${emotion}, but I couldn't find songs matching that mood. Let me play some general music for you.`;
          // Play first few available songs as fallback
          playPlaylist(availableSongs.slice(0, 5), 0);
        }
      } else if (emotion) {
        botResponseContent = `I sense that you're feeling ${emotion}, but I'm having trouble loading songs right now. Try again in a moment!`;
      } else {
        botResponseContent = `I'm not sure what mood you're in. Could you share more about how you're feeling? I can play music that matches your emotions!`;
      }
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        content: botResponseContent,
        isBot: true,
      };
      
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-message",
        content: "Hello! I'm your AI music assistant. How can I help you today?",
        isBot: true,
      },
    ]);
    setDetectedEmotion(null);
    toast({
      title: "Chat cleared",
      description: "Your conversation has been reset.",
      duration: 2000,
    });
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const analyzeVoiceEmotion = async (stream: MediaStream): Promise<{pitch: number, speed: number, volume: number}> => {
    return new Promise((resolve) => {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const timeDataArray = new Uint8Array(analyserRef.current.fftSize);
      
      let volumeSum = 0;
      let pitchSum = 0;
      let samples = 0;
      let speechStart = Date.now();
      
      const analyzeFrame = () => {
        analyserRef.current!.getByteFrequencyData(dataArray);
        analyserRef.current!.getByteTimeDomainData(timeDataArray);
        
        // Calculate volume (RMS)
        let sumSquares = 0;
        for (let i = 0; i < timeDataArray.length; i++) {
          const normalized = (timeDataArray[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const volume = Math.sqrt(sumSquares / timeDataArray.length) * 100;
        
        // Find dominant frequency (simple pitch detection)
        let maxIndex = 0;
        let maxValue = 0;
        for (let i = 1; i < dataArray.length / 4; i++) { // Focus on speech frequencies
          if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
          }
        }
        const pitch = (maxIndex * audioContextRef.current!.sampleRate) / analyserRef.current!.fftSize;
        
        volumeSum += volume;
        pitchSum += pitch;
        samples++;
        
        if (samples < 50) { // Analyze for ~1 second
          requestAnimationFrame(analyzeFrame);
        } else {
          const avgVolume = volumeSum / samples;
          const avgPitch = pitchSum / samples;
          const speechDuration = Date.now() - speechStart;
          const speed = samples / (speechDuration / 1000); // Rough speech rate
          
          resolve({ pitch: avgPitch, speed, volume: avgVolume });
        }
      };
      
      analyzeFrame();
    });
  };

  const detectEmotionFromVoice = (voiceData: {pitch: number, speed: number, volume: number}): EmotionType => {
    const { pitch, speed, volume } = voiceData;
    
    // Enhanced voice-based emotion detection
    if (volume > 50 && speed > 15 && pitch > 200) return "energetic";
    if (volume > 40 && pitch > 180 && speed > 12) return "happy";
    if (volume < 20 && pitch < 150 && speed < 8) return "sad";
    if (volume > 60 && speed > 18) return "angry";
    if (volume < 30 && pitch < 160 && speed < 10) return "calm";
    if (pitch > 220 && volume > 35) return "romantic";
    if (speed < 9 && volume < 35) return "nostalgic";
    
    return "calm"; // Default
  };

  const startSpeechRecognition = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        // Start voice analysis
        setIsAnalyzingVoice(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const voiceData = await analyzeVoiceEmotion(stream);
        setVoiceEmotionData(voiceData);
        
        // Detect emotion from voice characteristics
        const voiceEmotion = detectEmotionFromVoice(voiceData);
        setDetectedEmotion(voiceEmotion);
        
        // Immediately play music based on voice emotion + contextual data
        if (voiceEmotion && playableSongs.length > 0) {
          console.log('Voice emotion detected:', voiceEmotion);
          console.log('Available playable songs:', playableSongs.length);
          console.log('Contextual data:', contextualData);
          
          // Enhanced emotion mapping with contextual influence
          let emotionToMoodMap: { [key in EmotionType]: string[] } = {
            happy: ["happy", "romantic", "energetic"],
            sad: ["sad", "melancholy", "calm"],
            energetic: ["energetic", "dance", "happy"],
            calm: ["calm", "ambient", "romantic"],
            angry: ["energetic", "sad"],
            romantic: ["romantic", "happy", "calm"],
            nostalgic: ["calm", "romantic", "sad"]
          };
          
          // Apply contextual modifications
          if (contextualData) {
            const { weather, timeOfDay } = contextualData;
            
            // Modify mood preferences based on weather
            if (weather.toLowerCase().includes('rain')) {
              emotionToMoodMap.calm = ["calm", "melancholy", "sad"];
              emotionToMoodMap.romantic = ["romantic", "sad", "melancholy"];
            }
            if (weather.toLowerCase().includes('sunny') || weather.toLowerCase().includes('clear')) {
              emotionToMoodMap.happy = ["happy", "energetic", "romantic"];
              emotionToMoodMap.energetic = ["energetic", "happy", "dance"];
            }
            
            // Modify based on time of day
            if (timeOfDay === 'morning') {
              emotionToMoodMap.energetic = ["energetic", "happy", "dance"];
            } else if (timeOfDay === 'evening' || timeOfDay === 'night') {
              emotionToMoodMap.calm = ["calm", "romantic", "melancholy"];
              emotionToMoodMap.romantic = ["romantic", "calm", "happy"];
            }
          }
          
          const targetMoods = emotionToMoodMap[voiceEmotion];
          console.log('Enhanced target moods for', voiceEmotion, 'with context:', targetMoods);
          
          // Filter songs by enhanced mood mapping
          const matchingSongs = playableSongs.filter(song => {
            const songMoods = song.mood || [];
            const matches = songMoods.some(mood => 
              targetMoods.some(targetMood => 
                mood.toLowerCase().includes(targetMood.toLowerCase())
              )
            );
            return matches;
          });
          
          // Display recommended songs as album-style list
          setRecommendedSongs(matchingSongs.slice(0, 8));
          setShowRecommendations(true);
          
          console.log('Matching contextual songs found:', matchingSongs.length);
          
          if (matchingSongs.length > 0) {
            console.log('Auto-playing songs:', matchingSongs.slice(0, 8).map(s => s.title));
            playPlaylist(matchingSongs, 0);
            
            const contextInfo = contextualData ? 
              `${contextualData.weather} weather, ${contextualData.timeOfDay}` : 'default context';
            
            toast({
              title: `🎵 ${voiceEmotion} + Auto Context`,
              description: `Playing ${matchingSongs.length} songs for ${contextInfo}`,
              duration: 4000,
            });
            
            // Add bot message about contextual auto-playing music
            const botMessage = {
              id: `bot-${Date.now()}`,
              content: `🎵 Detected ${voiceEmotion} emotion from your voice! Auto-detected ${contextInfo} and playing ${matchingSongs.length} perfect songs. Fully automatic - no input needed!`,
              isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);
          } else {
            // Play first 8 songs as fallback
            console.log('No contextual matches, playing first 8 songs');
            const fallbackSongs = playableSongs.slice(0, 8);
            setRecommendedSongs(fallbackSongs);
            setShowRecommendations(true);
            playPlaylist(fallbackSongs, 0);
            toast({
              title: `🎵 ${voiceEmotion} + Auto Context`,
              description: `Playing ${fallbackSongs.length} songs with auto-context`,
              duration: 3000,
            });
            
            const botMessage = {
              id: `bot-${Date.now()}`,
              content: `🎵 Detected ${voiceEmotion} from your voice with auto-context! Playing songs for you.`,
              isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);
          }
        } else if (voiceEmotion) {
          console.log('Voice emotion detected but iTunes songs loading...');
          toast({
            title: `Voice + Context Detected: ${voiceEmotion}`,
            description: "Loading iTunes songs with auto-context...",
            duration: 2000,
          });
        }
        
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsRecording(true);
          setIsAnalyzingVoice(false);
          toast({
            title: `Voice Emotion: ${voiceEmotion} 🎵`,
            description: "Music already started! Speak if you want to add text commands...",
            duration: 3000,
          });
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          
          // Text is optional - voice emotion already triggered music
          const textEmotion = detectEmotionFromText(transcript);
          
          toast({
            title: "Voice + Text Analysis",
            description: `Primary emotion (${detectedEmotion}) already playing music. Text adds: ${textEmotion || 'no additional emotion'}`,
            duration: 3000,
          });
          
          // Auto-send the text message for chat history
          setTimeout(() => {
            handleSendMessage();
          }, 800);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          toast({
            title: "Error",
            description: `Voice recognition failed: ${event.error}`,
            duration: 2000,
          });
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } catch (error) {
        setIsAnalyzingVoice(false);
        toast({
          title: "Error",
          description: "Could not access microphone for voice analysis",
          variant: "destructive",
        });
        return;
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsAnalyzingVoice(false);
  };

  return (
    <div className="space-y-4">
      {/* Voice Recognition Button */}
      <div className="flex items-center justify-center p-4">
        <Button
          onClick={toggleSpeechRecognition}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className="relative"
          disabled={isAnalyzingVoice}
        >
          {isAnalyzingVoice ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analyzing Voice...
            </>
          ) : isRecording ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Detect Emotion & Play
            </>
          )}
        </Button>
      </div>

      {/* Detected Emotion Badge */}
      {detectedEmotion && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="capitalize">
            🎵 {detectedEmotion} emotion detected
          </Badge>
        </div>
      )}

      {/* Contextual Info */}
      {contextualData && (
        <div className="text-sm text-muted-foreground text-center">
          <Music className="inline h-4 w-4 mr-1" />
          Auto-context: {contextualData.weather}, {contextualData.timeOfDay}
        </div>
      )}

      {/* Recommended Songs Album View */}
      {showRecommendations && recommendedSongs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center">
            🎵 Playing {detectedEmotion} Music
          </h3>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {recommendedSongs.map((song, index) => (
              <div 
                key={song.id || index}
                className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => playPlaylist(recommendedSongs, index)}
              >
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRecommendations(false)}
            >
              Hide Recommendations
            </Button>
          </div>
        </div>
      )}

      {/* Voice Emotion Data Debug (hidden in production) */}
      {voiceEmotionData && process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
          Voice Analysis: Pitch {voiceEmotionData.pitch.toFixed(0)}Hz, 
          Volume {voiceEmotionData.volume.toFixed(0)}, 
          Speed {voiceEmotionData.speed.toFixed(0)}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
