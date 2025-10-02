import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotion?: {
    emotion: string;
    intensity: number;
    mood: string;
  };
}

interface EmotionResult {
  emotion: string;
  intensity: number;
  mood: string;
  genres: string[];
  energyLevel: string;
}

const VoiceChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice chat.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const startRecording = async () => {
    if (hasPermission === null) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceMessage(audioBlob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Failed',
        description: 'Could not start recording. Please check microphone permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to use voice chat');
      }

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('voice-chatbot', {
        body: { 
          audio: base64Audio,
          conversationHistory,
          detectedEmotion: currentEmotion
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: data.userMessage
      }]);

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.aiResponse,
        emotion: currentEmotion || undefined
      }]);

      // Play audio response
      if (data.audioResponse) {
        await playAudioResponse(data.audioResponse);
      }
      
    } catch (error: any) {
      console.error('Voice chat error:', error);
      toast({
        title: 'Chat Failed',
        description: error.message || 'Could not process voice message',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      currentAudioRef.current = source;
      setIsPlaying(true);
      
      source.onended = () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
      };
      
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.stop();
      currentAudioRef.current = null;
      setIsPlaying(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const icons: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      energetic: '⚡',
      romantic: '💕',
      nostalgic: '🌅',
      anxious: '😰',
      neutral: '😐'
    };
    return icons[emotion] || '🎵';
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Voice Chat Assistant
                  {isPlaying && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </CardTitle>
                <CardDescription>
                  Speak naturally and I'll respond with emotion-aware suggestions
                </CardDescription>
              </div>
            </div>
            {currentEmotion && (
              <Badge className="text-lg px-3 py-1">
                {getEmotionIcon(currentEmotion.emotion)} {currentEmotion.emotion}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Bot className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                  <p className="text-lg font-medium mb-2">Ready to chat!</p>
                  <p className="text-sm">Press the microphone to start talking</p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        {message.emotion && (
                          <div className="flex gap-1 text-xs text-muted-foreground px-2">
                            <span>{getEmotionIcon(message.emotion.emotion)}</span>
                            <span>{message.emotion.mood}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-foreground/50 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-foreground/50 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-foreground/50 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </ScrollArea>
          
          {/* Controls */}
          <div className="border-t p-6 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4">
              {isPlaying && (
                <Button
                  onClick={stopAudio}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12"
                >
                  <VolumeX className="h-5 w-5" />
                </Button>
              )}
              
              <div className="relative">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing || isPlaying}
                  size="lg"
                  className={`rounded-full h-16 w-16 transition-all duration-300 ${
                    isRecording 
                      ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                
                {isRecording && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -inset-4 border-4 border-destructive/30 rounded-full animate-ping"
                  />
                )}
              </div>
            </div>
            
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-4"
              >
                <p className="text-sm font-medium text-destructive">
                  Recording... {recordingTime}s
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap again to send
                </p>
              </motion.div>
            )}
            
            {!isRecording && !isProcessing && !isPlaying && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {messages.length === 0 ? 'Tap the microphone to start' : 'Tap to continue chatting'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceChatbot;
