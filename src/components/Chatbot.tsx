
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
    
    // Generate recommendations based on detected emotion
    const recommendations = getSongRecommendationsForEmotion(emotion);
    
    // Prepare bot response
    setTimeout(() => {
      let botResponseContent = "";
      
      if (emotion) {
        botResponseContent = `I sense that you're feeling ${emotion.toLowerCase()}. `;
        
        if (recommendations.length > 0) {
          botResponseContent += `Here are some songs that match your mood:\n\n`;
          recommendations.forEach((song, index) => {
            botResponseContent += `${index + 1}. "${song.title}" by ${song.artist}\n`;
          });
        } else {
          botResponseContent += `I don't have specific song recommendations for this mood right now, but I'm learning more every day!`;
        }
      } else {
        botResponseContent = `I'm not sure what mood you're in. Could you share more about how you're feeling?`;
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
        
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsRecording(true);
          setIsAnalyzingVoice(false);
          toast({
            title: `Voice emotion detected: ${voiceEmotion}`,
            description: "Now listening for your message...",
            duration: 3000,
          });
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          
          // Combine voice emotion with text emotion for better accuracy
          const textEmotion = detectEmotionFromText(transcript);
          const finalEmotion = detectedEmotion || textEmotion;
          
          if (finalEmotion !== detectedEmotion) {
            setDetectedEmotion(finalEmotion);
          }
          
          // Display comprehensive emotion feedback
          toast({
            title: "Complete Analysis",
            description: `Voice: ${detectedEmotion} | Text: ${textEmotion || 'neutral'} | Final: ${finalEmotion}`,
            duration: 4000,
          });
          
          // Auto-send after a brief delay
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
