import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emotion to Spotify mapping
const emotionToSpotifySeeds = {
  happy: { genres: ['pop', 'dance', 'funk'], valence: 0.8, energy: 0.8 },
  sad: { genres: ['acoustic', 'indie', 'alternative'], valence: 0.2, energy: 0.3 },
  angry: { genres: ['rock', 'metal', 'punk'], valence: 0.3, energy: 0.9 },
  calm: { genres: ['ambient', 'classical', 'lo-fi'], valence: 0.5, energy: 0.2 },
  energetic: { genres: ['edm', 'electronic', 'dance'], valence: 0.7, energy: 0.95 },
  romantic: { genres: ['r-n-b', 'soul', 'jazz'], valence: 0.7, energy: 0.4 },
  nostalgic: { genres: ['indie', 'alternative', 'folk'], valence: 0.5, energy: 0.4 },
  anxious: { genres: ['ambient', 'meditation', 'new-age'], valence: 0.4, energy: 0.2 },
  neutral: { genres: ['pop', 'indie', 'alternative'], valence: 0.5, energy: 0.5 }
};

async function getSpotifyAccessToken() {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.warn('Spotify credentials not configured');
    return null;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    console.error('Failed to get Spotify token');
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

async function getSpotifyRecommendations(emotion: string, intensity: number) {
  const accessToken = await getSpotifyAccessToken();
  
  if (!accessToken) {
    return null;
  }

  const seeds = emotionToSpotifySeeds[emotion as keyof typeof emotionToSpotifySeeds] || emotionToSpotifySeeds.neutral;
  const genres = seeds.genres.slice(0, 3).join(',');
  
  const params = new URLSearchParams({
    seed_genres: genres,
    target_valence: seeds.valence.toString(),
    target_energy: (seeds.energy * intensity).toString(),
    limit: '5'
  });

  const response = await fetch(`https://api.spotify.com/v1/recommendations?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    console.error('Failed to get Spotify recommendations');
    return null;
  }

  const data = await response.json();
  return data.tracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((a: any) => a.name).join(', '),
    album: track.album.name,
    image: track.album.images[0]?.url,
    preview_url: track.preview_url,
    external_url: track.external_urls.spotify
  }));
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, conversationHistory = [], detectedEmotion } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Transcribe audio
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Whisper API error: ${await transcriptionResponse.text()}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const userMessage = transcriptionResult.text;

    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('No speech detected in audio');
    }

    // Build conversation context with emotion awareness
    const systemPrompt = `You are a friendly, empathetic music assistant chatbot. Your role is to:
1. Understand the user's emotional state and respond with empathy
2. Suggest music, playlists, or activities based on their mood
3. Have natural, conversational interactions
4. Be supportive and uplifting

${detectedEmotion ? `Current detected emotion: ${detectedEmotion.emotion} (${Math.round(detectedEmotion.intensity * 100)}% intensity)
Mood context: ${detectedEmotion.mood}
Energy level: ${detectedEmotion.energyLevel}
Suggested genres: ${detectedEmotion.genres.join(', ')}

Tailor your response to match and support this emotional state.` : ''}

Keep responses concise (2-3 sentences) and conversational.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Get AI response
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 150
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat API error: ${await chatResponse.text()}`);
    }

    const chatResult = await chatResponse.json();
    const aiResponse = chatResult.choices[0].message.content;

    // Get Spotify recommendations based on emotion
    let musicSuggestions = null;
    if (detectedEmotion) {
      musicSuggestions = await getSpotifyRecommendations(
        detectedEmotion.emotion,
        detectedEmotion.intensity
      );
    }

    // Generate audio response
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'nova',
        input: aiResponse,
        speed: 1.0
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error(`TTS API error: ${await ttsResponse.text()}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({
        userMessage,
        aiResponse,
        audioResponse: base64Audio,
        musicSuggestions,
        detectedEmotion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Voice chatbot error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
