import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('is_active')
        .eq('user_id', session.user.id)
        .eq('integration_type', 'google_calendar')
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setIsConnected(true);
        onConnectionChange?.(true);
      }
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in first');
      }

      // Get auth URL from edge function
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Store state for verification
      sessionStorage.setItem('google_oauth_state', data.state);
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
      
    } catch (error: any) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_integrations')
        .update({ is_active: false })
        .eq('user_id', session.user.id)
        .eq('integration_type', 'google_calendar');

      if (error) throw error;

      setIsConnected(false);
      onConnectionChange?.(false);
      
      toast({
        title: 'Disconnected',
        description: 'Google Calendar disconnected successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Google Calendar',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
          {isConnected && (
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to automatically adjust music based on your schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Smart playlists based on your calendar:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Focus music during study sessions</li>
                <li>Ambient sounds for meetings</li>
                <li>Energizing tracks for workouts</li>
                <li>Relaxing music during breaks</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Calendar Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Music will automatically adapt to your schedule
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="w-full"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Disconnect Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarConnect;