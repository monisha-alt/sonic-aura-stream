
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
    setInput("");
    
    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "I can recommend some songs based on your mood. How are you feeling today?",
        "Have you tried our new AI mood-based playlist generator?",
        "I think you might enjoy 'Cosmic Harmony' by Neural Waves based on your recent listening.",
        "Would you like me to create a personalized playlist for your workout?",
        "I noticed you enjoy electronic music. Have you explored our 'Digital Dreams' collection?",
      ];
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
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
              Music Assistant
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
                {msg.content}
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
