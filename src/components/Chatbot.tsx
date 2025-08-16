
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
  const { data: availableSongs = [], isLoading: songsLoading } = useSongs('itunes'); // Force iTunes

  // Check if SpeechRecognition is supported
  useEffect(() => {
    // Use window interface to check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsRecognitionSupported(true);
    }
  }, []);

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
        
        // Immediately play music based on voice emotion detection
        if (voiceEmotion && availableSongs.length > 0) {
          console.log('Voice emotion detected:', voiceEmotion);
          console.log('Available iTunes songs:', availableSongs.length);
          
          const emotionToMoodMap: { [key in EmotionType]: string[] } = {
            happy: ["happy", "romantic", "energetic"],
            sad: ["sad", "melancholy", "calm"],
            energetic: ["energetic", "dance", "happy"],
            calm: ["calm", "ambient", "romantic"],
            angry: ["energetic", "sad"],
            romantic: ["romantic", "happy", "calm"],
            nostalgic: ["calm", "romantic", "sad"]
          };
          
          const targetMoods = emotionToMoodMap[voiceEmotion];
          console.log('Target moods for', voiceEmotion, ':', targetMoods);
          
          // Filter iTunes songs by mood
          const matchingSongs = availableSongs.filter(song => {
            const songMoods = song.mood || [];
            const matches = songMoods.some(mood => 
              targetMoods.some(targetMood => 
                mood.toLowerCase().includes(targetMood.toLowerCase())
              )
            );
            return matches;
          });
          
          console.log('Matching songs found:', matchingSongs.length);
          
          if (matchingSongs.length > 0) {
            console.log('Playing iTunes songs:', matchingSongs.slice(0, 5).map(s => s.title));
            playPlaylist(matchingSongs, 0);
            toast({
              title: `🎵 Voice Detected: ${voiceEmotion}`,
              description: `Auto-playing ${matchingSongs.length} iTunes songs for your mood`,
              duration: 4000,
            });
            
            // Add bot message about auto-playing music
            const botMessage = {
              id: `bot-${Date.now()}`,
              content: `🎵 I detected ${voiceEmotion} emotion from your voice! Now playing ${matchingSongs.length} iTunes songs that match your mood. No need to say anything - I can hear your feelings!`,
              isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);
          } else {
            // Play first 5 iTunes songs as fallback
            console.log('No matching songs, playing first 5 iTunes songs');
            const fallbackSongs = availableSongs.slice(0, 5);
            playPlaylist(fallbackSongs, 0);
            toast({
              title: `🎵 Voice Detected: ${voiceEmotion}`,
              description: `Playing ${fallbackSongs.length} iTunes songs based on your voice emotion`,
              duration: 3000,
            });
            
            const botMessage = {
              id: `bot-${Date.now()}`,
              content: `🎵 I detected ${voiceEmotion} emotion from your voice! Playing iTunes songs for you.`,
              isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);
          }
        } else if (voiceEmotion) {
          console.log('Voice emotion detected but no songs available yet');
          toast({
            title: `Voice Detected: ${voiceEmotion}`,
            description: "Loading iTunes songs...",
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
    // Chatbot is now integrated into the sidebar
    <></>
  );
};

export default Chatbot;
