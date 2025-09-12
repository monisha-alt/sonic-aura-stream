import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Cloud, Calendar, Music, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContextualSettingsProps {
  spotifyConnected?: boolean;
  calendarConnected?: boolean;
}

const ContextualSettings: React.FC<ContextualSettingsProps> = ({ 
  spotifyConnected = false, 
  calendarConnected = false 
}) => {
  const [preferences, setPreferences] = useState({
    auto_mood_playlists: false,
    location_enabled: false,
    calendar_enabled: false,
    weather_enabled: false,
    default_location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please log in first');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          ...preferences,
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your contextual playlist preferences have been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location Not Supported',
        description: 'Your browser does not support location services',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get location name using reverse geocoding (simplified)
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=demo`
          );
          
          if (response.ok) {
            const data = await response.json();
            const locationName = data[0]?.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            setCurrentLocation(locationName);
            setPreferences(prev => ({ 
              ...prev, 
              default_location: locationName,
              location_enabled: true 
            }));
          }
        } catch (error) {
          // Fallback to coordinates
          const locationName = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
          setCurrentLocation(locationName);
          setPreferences(prev => ({ 
            ...prev, 
            default_location: locationName,
            location_enabled: true 
          }));
        }
      },
      () => {
        toast({
          title: 'Location Access Denied',
          description: 'Please allow location access to enable weather-based playlists',
          variant: 'destructive',
        });
      }
    );
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contextual Playlist Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
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
          <Settings className="h-5 w-5" />
          Contextual Playlist Settings
          {preferences.auto_mood_playlists && (
            <Badge variant="secondary" className="ml-auto">
              <Music className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure automatic playlist generation based on your calendar, weather, and location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="auto-playlists" className="text-base font-medium">
              Enable Automatic Mood Playlists
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Allow the app to automatically create playlists based on your context
            </p>
          </div>
          <Switch
            id="auto-playlists"
            checked={preferences.auto_mood_playlists}
            onCheckedChange={(checked) => handlePreferenceChange('auto_mood_playlists', checked)}
          />
        </div>

        {/* Location Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Label htmlFor="location-enabled">Location Access</Label>
            </div>
            <Switch
              id="location-enabled"
              checked={preferences.location_enabled}
              onCheckedChange={(checked) => handlePreferenceChange('location_enabled', checked)}
              disabled={!preferences.auto_mood_playlists}
            />
          </div>
          
          {preferences.location_enabled && (
            <div className="ml-6 space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location or use current"
                  value={preferences.default_location}
                  onChange={(e) => handlePreferenceChange('default_location', e.target.value)}
                />
                <Button variant="outline" onClick={requestLocation}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              {currentLocation && (
                <p className="text-sm text-muted-foreground">
                  Current location: {currentLocation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Weather Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <Label htmlFor="weather-enabled">Weather-Based Music</Label>
          </div>
          <Switch
            id="weather-enabled"
            checked={preferences.weather_enabled}
            onCheckedChange={(checked) => handlePreferenceChange('weather_enabled', checked)}
            disabled={!preferences.auto_mood_playlists || !preferences.location_enabled}
          />
        </div>

        {/* Calendar Settings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label htmlFor="calendar-enabled">Calendar Integration</Label>
            </div>
            <Switch
              id="calendar-enabled"
              checked={preferences.calendar_enabled && calendarConnected}
              onCheckedChange={(checked) => handlePreferenceChange('calendar_enabled', checked)}
              disabled={!preferences.auto_mood_playlists || !calendarConnected}
            />
          </div>
          
          {!calendarConnected && preferences.auto_mood_playlists && (
            <p className="text-sm text-muted-foreground ml-6">
              Connect Google Calendar above to enable this feature
            </p>
          )}
        </div>

        {/* Feature Examples */}
        {preferences.auto_mood_playlists && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {preferences.weather_enabled && (
                <li>• Rainy weather → Chill jazz and lo-fi music</li>
              )}
              {preferences.weather_enabled && (
                <li>• Sunny day → Upbeat pop and energetic tracks</li>
              )}
              {preferences.calendar_enabled && calendarConnected && (
                <li>• Study sessions → Focus-enhancing instrumental music</li>
              )}
              {preferences.calendar_enabled && calendarConnected && (
                <li>• Meetings → Ambient background music</li>
              )}
            </ul>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContextualSettings;