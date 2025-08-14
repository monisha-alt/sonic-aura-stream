
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Library, 
  ListMusic, 
  Music2, 
  Disc3, 
  Users, 
  Radio, 
  Mic2, 
  Zap, 
  Settings, 
  Heart,
  Sparkles,
  LogOut,
  User,
  Bot,
  Send,
  X,
  Mic,
  MicOff,
  Music
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEmotionDetection, EmotionType } from "@/hooks/useEmotionDetection";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  aiModeEnabled: boolean;
  handleAiModeToggle: () => void;
}

type Message = {
  id: string;
  content: string;
  isBot: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ aiModeEnabled, handleAiModeToggle }) => {
  const [chatExpanded, setChatExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hi! I'm your AI music assistant. How can I help?",
      isBot: true,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [voiceEmotionData, setVoiceEmotionData] = useState<{pitch: number, speed: number, volume: number} | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const { toast } = useToast();
  
  const {
    detectedEmotion,
    setDetectedEmotion,
    detectEmotionFromText,
    getSongRecommendationsForEmotion
  } = useEmotionDetection();

  // Helper functions for chatbot functionality
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: input,
      isBot: false,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    const emotion = detectEmotionFromText(input);
    setDetectedEmotion(emotion);
    setInput("");
    
    const recommendations = getSongRecommendationsForEmotion(emotion);
    
    setTimeout(() => {
      let botResponseContent = "";
      
      if (emotion) {
        botResponseContent = `I sense you're feeling ${emotion}. `;
        
        if (recommendations.length > 0) {
          botResponseContent += `Here are matching songs: `;
          recommendations.forEach((song, index) => {
            botResponseContent += `${index + 1}. "${song.title}" by ${song.artist}${index < recommendations.length - 1 ? ', ' : ''}`;
          });
        } else {
          botResponseContent += `I'm still learning songs for this mood!`;
        }
      } else {
        botResponseContent = `Tell me more about your mood and I'll find perfect songs!`;
      }
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        content: botResponseContent,
        isBot: true,
      };
      
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const startSpeechRecognition = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        setIsAnalyzingVoice(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsRecording(true);
          setIsAnalyzingVoice(false);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          
          const textEmotion = detectEmotionFromText(transcript);
          setDetectedEmotion(textEmotion);
          
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        };
        
        recognition.onerror = () => {
          setIsRecording(false);
          setIsAnalyzingVoice(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } catch (error) {
        setIsAnalyzingVoice(false);
      }
    }
  };

  const stopSpeechRecognition = () => {
    setIsRecording(false);
    setIsAnalyzingVoice(false);
  };

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-gray-100 p-4 flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="text-xl font-bold">MusicAI</h2>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">AI Mode</span>
        </div>
        <Switch checked={aiModeEnabled} onCheckedChange={handleAiModeToggle} />
      </div>
      
      <nav className="space-y-1 flex-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/library" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Library className="h-5 w-5" />
          <span>Library</span>
        </NavLink>
        
        <NavLink 
          to="/playlists" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <ListMusic className="h-5 w-5" />
          <span>Playlists</span>
        </NavLink>
        
        <NavLink 
          to="/favorites" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Heart className="h-5 w-5" />
          <span>Favorites</span>
        </NavLink>
        
        <NavLink 
          to="/contextual" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Radio className="h-5 w-5" />
          <span>Contextual</span>
        </NavLink>
        
        <NavLink 
          to="/remix" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Music2 className="h-5 w-5" />
          <span>Remix</span>
        </NavLink>
        
        <NavLink 
          to="/albums" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Disc3 className="h-5 w-5" />
          <span>Albums</span>
        </NavLink>
        
        <NavLink 
          to="/artists" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Users className="h-5 w-5" />
          <span>Artists</span>
        </NavLink>
        
        <NavLink 
          to="/lyrics" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Mic2 className="h-5 w-5" />
          <span>Lyrics</span>
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-gray-800">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
              }`
            }
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink>
          
          {/* AI Chatbot Section */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <Button
              onClick={() => setChatExpanded(!chatExpanded)}
              className="flex items-center space-x-3 px-4 py-2 rounded-md transition-colors w-full justify-start hover:bg-gray-800 hover:text-purple-400 bg-transparent"
              variant="ghost"
            >
              <Bot className="h-5 w-5" />
              <span>AI Assistant</span>
              {detectedEmotion && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {detectedEmotion}
                </Badge>
              )}
            </Button>
            
            {chatExpanded && (
              <div className="mt-2 p-3 bg-gray-800 rounded-md">
                <ScrollArea className="h-48 mb-3">
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`text-xs p-2 rounded ${
                          msg.isBot
                            ? "bg-gray-700 text-gray-100"
                            : "bg-purple-600 text-white ml-4"
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {voiceEmotionData && (
                  <div className="flex gap-1 text-xs text-gray-400 mb-2">
                    <span>🎵{Math.round(voiceEmotionData.pitch)}Hz</span>
                    <span>🔊{Math.round(voiceEmotionData.volume)}%</span>
                  </div>
                )}
                
                <div className="flex gap-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about music..."
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button 
                    onClick={toggleSpeechRecognition} 
                    variant={isRecording || isAnalyzingVoice ? "destructive" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isAnalyzingVoice}
                  >
                    {isAnalyzingVoice ? (
                      <div className="animate-pulse">
                        <Music className="h-3 w-3" />
                      </div>
                    ) : isRecording ? (
                      <MicOff className="h-3 w-3" />
                    ) : (
                      <Mic className="h-3 w-3" />
                    )}
                  </Button>
                  <Button onClick={handleSendMessage} size="sm" className="h-8 w-8 p-0">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

    </aside>
  );
};

export default Sidebar;
