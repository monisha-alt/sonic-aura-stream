
import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Mic, MicOff } from "lucide-react";
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  
  const {
    detectedEmotion,
    setDetectedEmotion,
    detectEmotionFromText,
    getSongRecommendationsForEmotion
  } = useEmotionDetection();

  // Check if SpeechRecognition is supported
  useEffect(() => {
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

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Voice input active",
          description: "Listening... speak now",
          duration: 2000,
        });
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        
        // Auto-detect emotion when speech ends
        const emotion = detectEmotionFromText(transcript);
        setDetectedEmotion(emotion);
        
        // Display emotion feedback
        if (emotion) {
          toast({
            title: "Emotion Detected",
            description: `You sound ${emotion.toLowerCase()}. Finding matching songs...`,
            duration: 3000,
          });
        }
        
        // Auto-send after a brief delay to allow user to see the transcription
        setTimeout(() => {
          handleSendMessage();
        }, 500);
      };
      
      recognition.onerror = (event) => {
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
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 rounded-full h-12 w-12"
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
              Music Assistant {detectedEmotion && <span className="text-sm text-purple-400">({detectedEmotion})</span>}
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
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
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.isBot
                    ? "bg-gray-800 text-white"
                    : "bg-purple-600 text-white"
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
              variant={isRecording ? "destructive" : "outline"}
              className="px-3"
              type="button"
              title={isRecording ? "Stop voice input" : "Start voice input"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
