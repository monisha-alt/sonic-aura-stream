import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function analyzeEmotionFromText(text: string): { emotion: string; intensity: number; mood: string; genres: string[]; energyLevel: string } {
  const textLower = text.toLowerCase();
  
  // Emotion detection patterns
  const emotionPatterns = {
    happy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'awesome', 'perfect', 'smile', 'laugh'],
    sad: ['sad', 'down', 'upset', 'cry', 'tears', 'depressed', 'blue', 'lonely', 'hurt', 'broken', 'miss'],
    angry: ['angry', 'mad', 'furious', 'pissed', 'annoyed', 'irritated', 'frustrated', 'hate', 'rage'],
    calm: ['calm', 'peaceful', 'relaxed', 'chill', 'zen', 'serene', 'quiet', 'tranquil', 'mellow'],
    energetic: ['energy', 'pump', 'motivated', 'ready', 'go', 'action', 'power', 'strong', 'intense'],
    romantic: ['love', 'romantic', 'heart', 'kiss', 'romance', 'date', 'beautiful', 'gorgeous'],
    nostalgic: ['remember', 'memories', 'past', 'nostalgia', 'old', 'miss', 'used to', 'back then'],
    anxious: ['worried', 'nervous', 'anxious', 'stress', 'pressure', 'overwhelmed', 'scared', 'afraid']
  };
  
  let detectedEmotion = 'neutral';
  let maxScore = 0;
  let intensity = 0.5; // Default medium intensity
  
  // Calculate emotion scores
  for (const [emotion, keywords] of Object.entries(emotionPatterns)) {
    let score = 0;
    for (const keyword of keywords) {
      const occurrences = (textLower.match(new RegExp(keyword, 'g')) || []).length;
      score += occurrences;
    }
    
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
      intensity = Math.min(1, score * 0.2 + 0.3); // Scale intensity
    }
  }
  
  // Map emotions to music moods and genres
  const emotionToMusic = {
    happy: {
      mood: 'upbeat and joyful',
      genres: ['pop', 'dance', 'funk', 'reggae', 'afrobeat'],
      energyLevel: 'high'
    },
    sad: {
      mood: 'melancholic and introspective',
      genres: ['blues', 'indie', 'alternative', 'acoustic', 'folk'],
      energyLevel: 'low'
    },
    angry: {
      mood: 'intense and powerful',
      genres: ['rock', 'metal', 'punk', 'rap', 'electronic'],
      energyLevel: 'high'
    },
    calm: {
      mood: 'peaceful and soothing',
      genres: ['ambient', 'classical', 'jazz', 'lo-fi', 'new age'],
      energyLevel: 'low'
    },
    energetic: {
      mood: 'energetic and motivational',
      genres: ['electronic', 'dance', 'pop', 'rock', 'hip-hop'],
      energyLevel: 'high'
    },
    romantic: {
      mood: 'romantic and intimate',
      genres: ['r&b', 'soul', 'jazz', 'acoustic', 'indie'],
      energyLevel: 'medium'
    },
    nostalgic: {
      mood: 'nostalgic and reflective',
      genres: ['indie', 'alternative', 'folk', 'classic rock', 'oldies'],
      energyLevel: 'medium'
    },
    anxious: {
      mood: 'calming and reassuring',
      genres: ['ambient', 'classical', 'lo-fi', 'acoustic', 'meditation'],
      energyLevel: 'low'
    },
    neutral: {
      mood: 'balanced and versatile',
      genres: ['pop', 'indie', 'alternative', 'jazz'],
      energyLevel: 'medium'
    }
  };
  
  const musicMapping = emotionToMusic[detectedEmotion as keyof typeof emotionToMusic] || emotionToMusic.neutral;
  
  return {
    emotion: detectedEmotion,
    intensity,
    mood: musicMapping.mood,
    genres: musicMapping.genres,
    energyLevel: musicMapping.energyLevel
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Transcribe audio using OpenAI Whisper
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
    const transcribedText = transcriptionResult.text;

    if (!transcribedText || transcribedText.trim().length === 0) {
      throw new Error('No speech detected in audio');
    }

    // Analyze emotion from transcribed text
    const emotionAnalysis = analyzeEmotionFromText(transcribedText);

    // Enhanced emotion analysis using GPT for better accuracy
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert emotion analyst. Analyze the emotional tone of the given text and respond with a JSON object containing:
            - emotion: primary emotion (happy, sad, angry, calm, energetic, romantic, nostalgic, anxious, neutral)
            - intensity: emotion intensity from 0.1 to 1.0
            - confidence: confidence level from 0.1 to 1.0
            - context: brief explanation of the emotional context
            
            Focus on the overall emotional tone and energy level.`
          },
          {
            role: 'user',
            content: transcribedText
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
    });

    if (!gptResponse.ok) {
      console.warn('GPT analysis failed, using pattern-based analysis');
    } else {
      try {
        const gptResult = await gptResponse.json();
        const gptAnalysis = JSON.parse(gptResult.choices[0].message.content);
        
        // Merge GPT analysis with pattern-based analysis
        if (gptAnalysis.confidence > 0.6) {
          emotionAnalysis.emotion = gptAnalysis.emotion;
          emotionAnalysis.intensity = gptAnalysis.intensity;
        }
      } catch (error) {
        console.warn('Error parsing GPT response, using pattern-based analysis');
      }
    }

    return new Response(
      JSON.stringify({
        transcription: transcribedText,
        emotion: emotionAnalysis.emotion,
        intensity: emotionAnalysis.intensity,
        mood: emotionAnalysis.mood,
        genres: emotionAnalysis.genres,
        energyLevel: emotionAnalysis.energyLevel,
        reason: `Detected ${emotionAnalysis.emotion} emotion from voice with ${Math.round(emotionAnalysis.intensity * 100)}% intensity`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Emotion detection error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});