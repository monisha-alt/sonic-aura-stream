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

    const { weatherContext, calendarEvents, timeOfDay, emotionContext, forceGenerate = false } = await req.json();

    // Check user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!preferences?.auto_mood_playlists && !forceGenerate) {
      return new Response(JSON.stringify({ 
        error: 'Auto mood playlists not enabled',
        enabled: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate context-based playlist
    const playlistData = await generateContextualPlaylist({
      weatherContext,
      calendarEvents,
      timeOfDay,
      userId: user.id,
      supabase,
    });

    // Store the generated playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('contextual_playlists')
      .insert({
        user_id: user.id,
        name: playlistData.name,
        description: playlistData.description,
        context_data: {
          weather: weatherContext,
          calendar: calendarEvents,
          timeOfDay,
          generatedAt: new Date().toISOString(),
        },
        weather_condition: weatherContext?.weatherCondition,
        calendar_event_type: calendarEvents?.[0]?.type,
        time_of_day: timeOfDay,
        songs: playlistData.songs,
      })
      .select()
      .single();

    if (playlistError) {
      console.error('Error storing playlist:', playlistError);
      throw new Error('Failed to store playlist');
    }

    return new Response(JSON.stringify({
      playlist,
      reason: playlistData.reason,
      context: {
        weather: weatherContext,
        calendar: calendarEvents,
        timeOfDay,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in contextual-playlist function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateContextualPlaylist({ 
  weatherContext, 
  calendarEvents, 
  timeOfDay, 
  userId, 
  supabase 
}: any) {
  // Get available songs from database
  const { data: allSongs } = await supabase
    .from('songs')
    .select('*')
    .limit(100);

  if (!allSongs || allSongs.length === 0) {
    throw new Error('No songs available in database');
  }

  // Determine primary context and mood
  let primaryContext = 'general';
  let targetMoods: string[] = [];
  let targetGenres: string[] = [];
  let energyLevel = 'medium';
  let playlistName = '';
  let description = '';
  let reason = '';

  // Calendar events take priority
  if (calendarEvents && calendarEvents.length > 0) {
    const activeEvent = calendarEvents[0];
    primaryContext = activeEvent.type;
    
    switch (activeEvent.type) {
      case 'meeting':
        targetMoods = ['calm', 'focused', 'professional'];
        targetGenres = ['ambient', 'classical', 'lo-fi'];
        energyLevel = 'low';
        playlistName = 'Focus Meeting Mix';
        description = 'Calm background music for your meeting';
        reason = `Meeting in progress - calming background music selected`;
        break;
        
      case 'study':
        targetMoods = ['focused', 'calm', 'concentrated'];
        targetGenres = ['lo-fi', 'ambient', 'classical', 'instrumental'];
        energyLevel = 'low';
        playlistName = 'Study Session Focus';
        description = 'Instrumental music to enhance concentration';
        reason = `Study session detected - focus-enhancing instrumental music`;
        break;
        
      case 'workout':
        targetMoods = ['energetic', 'motivational', 'upbeat'];
        targetGenres = ['electronic', 'pop', 'rock', 'hip-hop'];
        energyLevel = 'high';
        playlistName = 'Workout Power Mix';
        description = 'High-energy music for your workout';
        reason = `Workout time - high-energy motivational tracks`;
        break;
        
      case 'break':
        targetMoods = ['relaxing', 'chill', 'pleasant'];
        targetGenres = ['indie', 'acoustic', 'jazz', 'folk'];
        energyLevel = 'medium';
        playlistName = 'Break Time Chill';
        description = 'Relaxing music for your break';
        reason = `Break time - relaxing and refreshing music`;
        break;
    }
  }
  // Weather context as secondary factor
  else if (weatherContext) {
    primaryContext = 'weather';
    targetMoods = weatherContext.mood ? [weatherContext.mood] : [];
    targetGenres = weatherContext.genres || [];
    energyLevel = weatherContext.energyLevel || 'medium';
    
    const weatherDesc = weatherContext.weatherCondition || 'pleasant';
    playlistName = `${weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)} Weather Mix`;
    description = `Perfect music for ${weatherDesc} weather`;
    reason = weatherContext.reason || `${weatherDesc} weather playlist`;
  }
  // Time of day fallback
  else {
    primaryContext = 'time';
    const hour = new Date().getHours();
    
    if (hour < 6) {
      targetMoods = ['calm', 'sleepy', 'ambient'];
      targetGenres = ['ambient', 'classical', 'lo-fi'];
      energyLevel = 'low';
      playlistName = 'Late Night Vibes';
      description = 'Calm music for late night hours';
      reason = 'Late night - calm and soothing music';
    } else if (hour < 12) {
      targetMoods = ['fresh', 'optimistic', 'energetic'];
      targetGenres = ['pop', 'indie', 'folk', 'acoustic'];
      energyLevel = 'medium';
      playlistName = 'Morning Energizer';
      description = 'Fresh morning music to start your day';
      reason = 'Morning time - fresh and energizing music';
    } else if (hour < 18) {
      targetMoods = ['productive', 'focused', 'upbeat'];
      targetGenres = ['pop', 'indie', 'electronic', 'alternative'];
      energyLevel = 'medium';
      playlistName = 'Afternoon Flow';
      description = 'Productive music for your afternoon';
      reason = 'Afternoon - productive and engaging music';
    } else {
      targetMoods = ['relaxing', 'mellow', 'chill'];
      targetGenres = ['jazz', 'indie', 'acoustic', 'soul'];
      energyLevel = 'low';
      playlistName = 'Evening Unwind';
      description = 'Relaxing music for your evening';
      reason = 'Evening time - relaxing and mellow music';
    }
  }

  // Filter and score songs based on context
  const scoredSongs = allSongs.map(song => {
    let score = 0;
    
    // Mood matching
    if (song.mood && targetMoods.length > 0) {
      const songMoods = Array.isArray(song.mood) ? song.mood : [];
      const moodMatches = songMoods.filter(mood => 
        targetMoods.some(target => 
          mood.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(mood.toLowerCase())
        )
      ).length;
      score += moodMatches * 3;
    }
    
    // Genre matching
    if (song.genre && targetGenres.length > 0) {
      const songGenres = Array.isArray(song.genre) ? song.genre : [];
      const genreMatches = songGenres.filter(genre => 
        targetGenres.some(target => 
          genre.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(genre.toLowerCase())
        )
      ).length;
      score += genreMatches * 2;
    }
    
    // Energy level matching (approximate based on genre)
    if (song.genre) {
      const songGenres = Array.isArray(song.genre) ? song.genre : [];
      const highEnergyGenres = ['electronic', 'dance', 'pop', 'rock', 'hip-hop', 'afrobeat'];
      const lowEnergyGenres = ['ambient', 'classical', 'lo-fi', 'jazz', 'folk'];
      
      const hasHighEnergy = songGenres.some(genre => 
        highEnergyGenres.some(high => genre.toLowerCase().includes(high.toLowerCase()))
      );
      const hasLowEnergy = songGenres.some(genre => 
        lowEnergyGenres.some(low => genre.toLowerCase().includes(low.toLowerCase()))
      );
      
      if (energyLevel === 'high' && hasHighEnergy) score += 2;
      if (energyLevel === 'low' && hasLowEnergy) score += 2;
      if (energyLevel === 'medium' && !hasHighEnergy && !hasLowEnergy) score += 1;
    }
    
    // Popularity boost (but not too much)
    if (song.listens) {
      score += Math.log10(song.listens || 1) * 0.1;
    }
    
    return { ...song, contextScore: score };
  });

  // Sort by score and take top songs
  const selectedSongs = scoredSongs
    .sort((a, b) => b.contextScore - a.contextScore)
    .slice(0, 15)
    .map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      cover_url: song.cover_url,
      audio_url: song.audio_url,
      contextScore: song.contextScore,
    }));

  return {
    name: playlistName,
    description,
    reason,
    songs: selectedSongs,
    context: {
      primaryContext,
      targetMoods,
      targetGenres,
      energyLevel,
    }
  };
}