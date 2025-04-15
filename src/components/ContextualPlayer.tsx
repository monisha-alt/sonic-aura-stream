
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { songs } from "@/data";
import { getContextualRecommendations, weatherSuggestions, locationSuggestions } from "@/data/contextual";
import { useToast } from "@/hooks/use-toast";

const ContextualPlayer = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(new Date().getHours());
  const [environment, setEnvironment] = useState<string>("Urban");
  const [recommendations, setRecommendations] = useState<{
    songs: typeof songs;
    context: string[];
  }>({ songs: [], context: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const [usingRealWeather, setUsingRealWeather] = useState(false);

  const weatherOptions = weatherSuggestions.map(w => w.condition);
  const locationOptions = locationSuggestions.map(l => l.environment);

  // Generate recommendations based on context
  const generateRecommendations = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const results = getContextualRecommendations(
        songs, 
        weather, 
        currentTime, 
        environment
      );
      
      setRecommendations(results);
      setIsLoading(false);
      
      toast({
        title: "Recommendations Ready",
        description: `Found ${results.songs.length} songs matching your context`,
        duration: 3000,
      });
    }, 1500);
  };

  // Get current time, updated every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getHours());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Attempt to get user's location
  const handleGetLocation = () => {
    setUsingRealLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Would normally use reverse geocoding API here
          // For demo purposes, just set to a random city
          const randomCities = ["New York", "Los Angeles", "Chicago", "Seattle", "Miami"];
          const randomCity = randomCities[Math.floor(Math.random() * randomCities.length)];
          setLocation(randomCity);
          
          // Set environment based on city (simplified logic)
          if (["New York", "Los Angeles", "Chicago"].includes(randomCity)) {
            setEnvironment("Urban");
          } else if (["Seattle"].includes(randomCity)) {
            setEnvironment("Suburban");
          } else {
            setEnvironment("Beach");
          }
          
          toast({
            title: "Location Detected",
            description: `Location set to ${randomCity}`,
            duration: 2000,
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Could not get your location. Please select manually.",
            duration: 3000,
          });
          setUsingRealLocation(false);
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation",
        duration: 3000,
      });
      setUsingRealLocation(false);
    }
  };

  // Fetch weather data based on location
  const handleGetWeather = () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enter a location or use your current location",
        duration: 3000,
      });
      return;
    }
    
    setUsingRealWeather(true);
    setIsLoading(true);
    
    // Simulate weather API call
    setTimeout(() => {
      const weatherOptions = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm", "Mist"];
      const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      setWeather(randomWeather);
      
      toast({
        title: "Weather Updated",
        description: `Current weather in ${location}: ${randomWeather}`,
        duration: 2000,
      });
      
      setIsLoading(false);
      setUsingRealWeather(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Your Location</h3>
            
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="location">City</Label>
                  <Input 
                    id="location"
                    placeholder="Enter your city"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-gray-700"
                    disabled={usingRealLocation && !location}
                  />
                </div>
                <Button 
                  onClick={handleGetLocation} 
                  variant="outline"
                  disabled={usingRealLocation && !location}
                >
                  {usingRealLocation && !location ? "Detecting..." : "Detect Location"}
                </Button>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="environment">Environment</Label>
                <Select 
                  value={environment} 
                  onValueChange={setEnvironment}
                >
                  <SelectTrigger className="bg-gray-700">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Weather & Time</h3>
            
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="weather">Weather</Label>
                  <Select 
                    value={weather} 
                    onValueChange={setWeather}
                    disabled={usingRealWeather}
                  >
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                    <SelectContent>
                      {weatherOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGetWeather} 
                  variant="outline"
                  disabled={usingRealWeather || !location}
                >
                  {usingRealWeather ? "Updating..." : "Get Weather"}
                </Button>
              </div>
              
              <div className="space-y-1">
                <Label>Current Time</Label>
                <p className="text-sm bg-gray-700 p-2 rounded">
                  {new Date().toLocaleTimeString()} ({currentTime < 12 ? "Morning" : 
                    currentTime < 17 ? "Afternoon" : 
                    currentTime < 21 ? "Evening" : "Night"})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={generateRecommendations} 
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? "Generating..." : "Find Perfect Songs"}
        </Button>
      </div>
      
      {recommendations.songs.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Contextual Recommendations</h3>
            {recommendations.context.map((ctx, i) => (
              <p key={i} className="text-sm text-gray-300">{ctx}</p>
            ))}
          </div>
          
          <div className="space-y-2">
            {recommendations.songs.map((song) => (
              <div
                key={song.id}
                className="flex justify-between items-center p-3 rounded-md bg-gray-800 hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <img 
                    src={song.cover} 
                    alt={`${song.title} cover`}
                    className="w-10 h-10 rounded mr-3"
                  />
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist} • {song.genre.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{song.duration}</span>
                  <Button size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextualPlayer;
