import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, MapPin, Calendar, Cloud, RefreshCw, Thermometer, Sunrise, Moon, Sun, CloudRain, CloudSnow, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  cover_url?: string;
  contextScore?: number;
}

interface PlaylistPreview {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  context_data: any;
  weather_condition?: string;
  calendar_event_type?: string;
  time_of_day?: string;
  created_at: string;
}

interface ContextualPlaylistPreviewProps {
  onPlayPlaylist?: (songs: Song[]) => void;
}

const ContextualPlaylistPreview: React.FC<ContextualPlaylistPreviewProps> = ({ onPlayPlaylist }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistPreview | null>(null);
  const [generatingPlaylist, setGeneratingPlaylist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLatestPlaylist();
    generateContextualPlaylist();
  }, []);

  const loadLatestPlaylist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('contextual_playlists')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCurrentPlaylist({
          ...data,
          songs: Array.isArray(data.songs) ? data.songs as unknown as Song[] : []
        });
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContextualPlaylist = async (force = false) => {
    if (!force && generatingPlaylist) return;
    
    setGeneratingPlaylist(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please log in first');

      // Get current weather if location is enabled
      let weatherContext = null;
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });

          const { data: weatherData } = await supabase.functions.invoke('weather-context', {
            body: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          weatherContext = weatherData?.context;
        }
      } catch (error) {
        console.log('Weather data not available:', error);
      }

      // Get current calendar events
      let calendarEvents = null;
      try {
        const { data: calendarData } = await supabase.functions.invoke('google-calendar', {
          body: {},
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        calendarEvents = calendarData?.events;
      } catch (error) {
        console.log('Calendar data not available:', error);
      }

      // Determine time of day
      const hour = new Date().getHours();
      let timeOfDay = 'afternoon';
      if (hour < 6) timeOfDay = 'night';
      else if (hour < 12) timeOfDay = 'morning';
      else if (hour < 18) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';

      // Generate playlist
      const { data: playlistData, error } = await supabase.functions.invoke('contextual-playlist', {
        body: {
          weatherContext,
          calendarEvents,
          timeOfDay,
          forceGenerate: force,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setCurrentPlaylist(playlistData.playlist);
      
      if (force) {
        toast({
          title: 'New Playlist Generated',
          description: playlistData.reason || 'Contextual playlist updated',
        });
      }

    } catch (error: any) {
      if (error.message?.includes('not enabled')) {
        // User hasn't enabled auto playlists
        return;
      }
      
      console.error('Error generating playlist:', error);
      if (force) {
        toast({
          title: 'Generation Failed',
          description: error.message || 'Failed to generate contextual playlist',
          variant: 'destructive',
        });
      }
    } finally {
      setGeneratingPlaylist(false);
    }
  };

  const handlePlayPlaylist = () => {
    if (currentPlaylist?.songs && onPlayPlaylist) {
      onPlayPlaylist(currentPlaylist.songs);
      toast({
        title: 'Playing Playlist',
        description: `Started playing "${currentPlaylist.name}"`,
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Playlist Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPlaylist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Playlist Preview</CardTitle>
          <CardDescription>
            No contextual playlist available. Enable automatic playlists in settings to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => generateContextualPlaylist(true)}
            disabled={generatingPlaylist}
            className="w-full"
          >
            {generatingPlaylist ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Preview Playlist
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const contextData = currentPlaylist.context_data || {};
  const timeAgo = new Date(currentPlaylist.created_at).toLocaleTimeString();

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-4 w-4" />;
      case 'snow':
        return <CloudSnow className="h-4 w-4" />;
      case 'thunderstorm':
        return <Zap className="h-4 w-4" />;
      case 'clear':
        return <Sun className="h-4 w-4" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay?.toLowerCase()) {
      case 'morning':
        return <Sunrise className="h-4 w-4" />;
      case 'night':
        return <Moon className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Play className="h-5 w-5" />
              </div>
              {currentPlaylist.name}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateContextualPlaylist(true)}
                disabled={generatingPlaylist}
                className="hover-scale"
              >
                <AnimatePresence mode="wait">
                  {generatingPlaylist ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                      className="h-3 w-3 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    <motion.div
                      key="refresh"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <Button 
                size="sm"
                onClick={handlePlayPlaylist}
                disabled={!currentPlaylist.songs?.length}
                className="hover-scale bg-gradient-to-r from-primary to-primary/80"
              >
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {currentPlaylist.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Enhanced Context Information */}
          <motion.div 
            className="flex flex-wrap gap-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {currentPlaylist.weather_condition && (
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                  {getWeatherIcon(currentPlaylist.weather_condition)}
                  <span className="ml-1.5 capitalize">{currentPlaylist.weather_condition}</span>
                  {contextData.temperature && (
                    <span className="ml-1">
                      <Thermometer className="h-3 w-3 inline ml-1" />
                      {Math.round(contextData.temperature)}°C
                    </span>
                  )}
                </Badge>
              </motion.div>
            )}
            
            {currentPlaylist.calendar_event_type && (
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="px-3 py-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {currentPlaylist.calendar_event_type}
                </Badge>
              </motion.div>
            )}
            
            {currentPlaylist.time_of_day && (
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="px-3 py-1.5 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                  {getTimeIcon(currentPlaylist.time_of_day)}
                  <span className="ml-1.5 capitalize">{currentPlaylist.time_of_day}</span>
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Reason Card */}
          {contextData.reason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-1">AI Reasoning</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {contextData.reason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Song List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Songs ({currentPlaylist.songs?.length || 0})
              </h4>
              <Badge variant="outline" className="text-xs">
                {Math.round((currentPlaylist.songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0) / 60)} min total
              </Badge>
            </div>
            
            <Card>
              <ScrollArea className="h-72 w-full">
                <motion.div 
                  className="space-y-1 p-3"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {currentPlaylist.songs?.map((song, index) => (
                    <motion.div 
                      key={song.id}
                      variants={itemVariants}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 group cursor-pointer hover-scale"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      
                      <div className="relative">
                        <img 
                          src={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=40&h=40&auto=format&fit=crop'}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover ring-2 ring-primary/10"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {song.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist}
                          {song.album && <span className="mx-1">•</span>}
                          {song.album}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(song.duration)}
                        </p>
                        {song.contextScore && (
                          <p className="text-xs text-primary font-medium">
                            {Math.round(song.contextScore * 100)}% match
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="h-3 w-3" />
              Generated at {timeAgo}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContextualPlaylistPreview;