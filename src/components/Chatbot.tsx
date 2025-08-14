
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[60] rounded-full h-12 w-12 shadow-lg"
          size="icon"
          variant="secondary"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-[80vh] sm:h-full p-0">
        <SheetHeader className="border-b px-4 py-2">
          <div className="flex justify-between items-center">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-500" />
              AI Music Assistant
              {detectedEmotion && (
                <Badge variant="outline" className="text-xs">
                  {detectedEmotion}
                </Badge>
              )}
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
          {voiceEmotionData && (
            <div className="flex gap-2 text-xs text-muted-foreground mt-2">
              <span>🎵 Pitch: {Math.round(voiceEmotionData.pitch)}Hz</span>
              <span>🗣️ Speed: {Math.round(voiceEmotionData.speed)}</span>
              <span>🔊 Volume: {Math.round(voiceEmotionData.volume)}%</span>
            </div>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isBot ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${
                  msg.isBot
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t p-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about music recommendations..."
            className="flex-1"
          />
          {isRecognitionSupported && (
            <Button 
              onClick={toggleSpeechRecognition} 
              variant={isRecording || isAnalyzingVoice ? "destructive" : "outline"}
              className="px-3"
              type="button"
              title={isAnalyzingVoice ? "Analyzing voice..." : isRecording ? "Stop voice input" : "Start voice analysis"}
              disabled={isAnalyzingVoice}
            >
              {isAnalyzingVoice ? (
                <div className="animate-pulse">
                  <Music className="h-4 w-4" />
                </div>
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Chatbot;
