import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { lat, lon, location } = await req.json();
    
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!openWeatherApiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    
    // Analyze weather for music context
    const weatherContext = analyzeWeatherForMusic(weatherData);
    
    // Update user preferences with current location if provided
    if (location) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          default_location: location,
          location_enabled: true,
          weather_enabled: true,
        });
    }

    return new Response(JSON.stringify({
      weather: {
        condition: weatherData.weather[0].main.toLowerCase(),
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind?.speed || 0,
        location: weatherData.name,
      },
      context: weatherContext,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-context function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeWeatherForMusic(weatherData: any) {
  const condition = weatherData.weather[0].main.toLowerCase();
  const temperature = weatherData.main.temp;
  const description = weatherData.weather[0].description.toLowerCase();
  
  let moodSuggestion = '';
  let genreSuggestions: string[] = [];
  let energyLevel = 'medium';
  
  // Weather-based music suggestions
  switch (condition) {
    case 'rain':
    case 'drizzle':
      moodSuggestion = 'chill and contemplative';
      genreSuggestions = ['jazz', 'lo-fi', 'indie', 'ambient', 'classical'];
      energyLevel = 'low';
      break;
      
    case 'thunderstorm':
      moodSuggestion = 'dramatic and intense';
      genreSuggestions = ['rock', 'metal', 'electronic', 'cinematic'];
      energyLevel = 'high';
      break;
      
    case 'snow':
      moodSuggestion = 'cozy and warm';
      genreSuggestions = ['folk', 'indie', 'acoustic', 'jazz', 'classical'];
      energyLevel = 'low';
      break;
      
    case 'clear':
      if (temperature > 25) {
        moodSuggestion = 'upbeat and energetic';
        genreSuggestions = ['pop', 'dance', 'reggae', 'tropical', 'afrobeat'];
        energyLevel = 'high';
      } else {
        moodSuggestion = 'bright and optimistic';
        genreSuggestions = ['pop', 'indie pop', 'folk', 'acoustic'];
        energyLevel = 'medium';
      }
      break;
      
    case 'clouds':
      if (description.includes('overcast')) {
        moodSuggestion = 'mellow and introspective';
        genreSuggestions = ['indie', 'alternative', 'folk', 'ambient'];
        energyLevel = 'low';
      } else {
        moodSuggestion = 'calm and peaceful';
        genreSuggestions = ['indie pop', 'folk', 'acoustic', 'chill'];
        energyLevel = 'medium';
      }
      break;
      
    case 'mist':
    case 'fog':
      moodSuggestion = 'mysterious and atmospheric';
      genreSuggestions = ['ambient', 'electronic', 'post-rock', 'cinematic'];
      energyLevel = 'low';
      break;
      
    default:
      moodSuggestion = 'versatile and adaptive';
      genreSuggestions = ['pop', 'indie', 'alternative'];
      energyLevel = 'medium';
  }
  
  // Temperature adjustments
  if (temperature < 0) {
    genreSuggestions.unshift('classical', 'ambient', 'post-rock');
  } else if (temperature > 30) {
    genreSuggestions.unshift('reggae', 'tropical', 'afrobeat', 'latin');
  }
  
  return {
    mood: moodSuggestion,
    genres: genreSuggestions.slice(0, 5), // Limit to top 5
    energyLevel,
    reason: `${condition} weather at ${temperature}°C suggests ${moodSuggestion} music`,
    weatherCondition: condition,
    temperature,
  };
}