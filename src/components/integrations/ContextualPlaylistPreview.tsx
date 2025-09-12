import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, MapPin, Calendar, Cloud, RefreshCw } from 'lucide-react';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {currentPlaylist.name}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generateContextualPlaylist(true)}
              disabled={generatingPlaylist}
            >
              {generatingPlaylist ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
            <Button 
              size="sm"
              onClick={handlePlayPlaylist}
              disabled={!currentPlaylist.songs?.length}
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
      <CardContent className="space-y-4">
        {/* Context Information */}
        <div className="flex flex-wrap gap-2">
          {currentPlaylist.weather_condition && (
            <Badge variant="secondary">
              <Cloud className="h-3 w-3 mr-1" />
              {currentPlaylist.weather_condition}
            </Badge>
          )}
          {currentPlaylist.calendar_event_type && (
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1" />
              {currentPlaylist.calendar_event_type}
            </Badge>
          )}
          {currentPlaylist.time_of_day && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {currentPlaylist.time_of_day}
            </Badge>
          )}
        </div>

        {/* Reason */}
        {contextData.reason && (
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>Why this playlist:</strong> {contextData.reason}
          </p>
        )}

        {/* Song List */}
        <div>
          <h4 className="font-medium mb-2">
            Songs ({currentPlaylist.songs?.length || 0})
          </h4>
          <ScrollArea className="h-64 w-full">
            <div className="space-y-2">
              {currentPlaylist.songs?.map((song, index) => (
                <div 
                  key={song.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors"
                >
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <img 
                    src={song.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=40&h=40&auto=format&fit=crop'}
                    alt={song.title}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Generated at {timeAgo}
        </p>
      </CardContent>
    </Card>
  );
};

export default ContextualPlaylistPreview;