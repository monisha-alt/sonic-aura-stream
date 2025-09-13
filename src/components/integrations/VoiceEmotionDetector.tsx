import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Heart, Zap, Brain, Volume2, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmotionResult {
  transcription: string;
  emotion: string;
  intensity: number;
  mood: string;
  genres: string[];
  energyLevel: string;
  reason: string;
}

interface VoiceEmotionDetectorProps {
  onEmotionDetected?: (emotion: EmotionResult) => void;
}

const VoiceEmotionDetector: React.FC<VoiceEmotionDetectorProps> = ({ onEmotionDetected }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

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
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice emotion detection.',
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
        await analyzeEmotion(audioBlob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) { // Max 30 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      toast({
        title: 'Recording Started',
        description: 'Speak naturally to analyze your emotional tone...',
      });
      
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

  const analyzeEmotion = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to use emotion detection');
      }

      const { data, error } = await supabase.functions.invoke('emotion-detection', {
        body: { audio: base64Audio },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setEmotionResult(data);
      onEmotionDetected?.(data);
      
      // Store emotion globally for playlist generation
      (window as any).lastEmotionDetection = data;
      
      toast({
        title: 'Emotion Detected!',
        description: `Found ${data.emotion} emotion - generating matching playlist...`,
      });
      
    } catch (error: any) {
      console.error('Emotion analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Could not analyze emotion from voice',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const icons = {
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
    return icons[emotion as keyof typeof icons] || '🎵';
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
      sad: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      angry: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      calm: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
      energetic: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
      romantic: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
      nostalgic: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
      anxious: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800',
      neutral: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          Voice Emotion Detection
        </CardTitle>
        <CardDescription>
          Speak naturally and let AI analyze your emotions to create the perfect playlist
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Permission Request */}
        {hasPermission === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <Mic className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Microphone access is required for voice emotion detection
              </p>
              <Button onClick={requestMicrophonePermission}>
                <Mic className="h-4 w-4 mr-2" />
                Allow Microphone Access
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recording Controls */}
        {(hasPermission === true || hasPermission === null) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="relative">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                size="lg"
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center"
                    >
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </motion.div>
                  ) : isRecording ? (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <MicOff className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Mic className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              
              {isRecording && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -inset-4 border-4 border-red-300 rounded-full animate-ping"
                />
              )}
            </div>
            
            <div className="space-y-2">
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium text-red-600">
                    Recording... {recordingTime}s
                  </p>
                  <Progress value={(recordingTime / 30) * 100} className="w-32 mx-auto" />
                </motion.div>
              )}
              
              {isAnalyzing && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Analyzing your emotional tone...
                </motion.p>
              )}
              
              {!isRecording && !isAnalyzing && (
                <p className="text-sm text-muted-foreground">
                  {emotionResult ? 'Tap to record again' : 'Tap to start recording'}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Emotion Results */}
        <AnimatePresence>
          {emotionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center space-y-3">
                <div className="text-4xl">{getEmotionIcon(emotionResult.emotion)}</div>
                <Badge className={`text-lg px-4 py-2 ${getEmotionColor(emotionResult.emotion)}`}>
                  {emotionResult.emotion.charAt(0).toUpperCase() + emotionResult.emotion.slice(1)}
                </Badge>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Intensity</p>
                  <Progress 
                    value={emotionResult.intensity * 100} 
                    className="w-48 mx-auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(emotionResult.intensity * 100)}%
                  </p>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">What you said:</p>
                  </div>
                  <p className="text-sm italic bg-background p-3 rounded-lg">
                    "{emotionResult.transcription}"
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Music Recommendation</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Mood:</strong> {emotionResult.mood}
                    </p>
                    <p className="text-sm">
                      <strong>Energy:</strong> {emotionResult.energyLevel}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {emotionResult.genres.map((genre, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 p-2 bg-background/50 rounded">
                    {emotionResult.reason}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default VoiceEmotionDetector;