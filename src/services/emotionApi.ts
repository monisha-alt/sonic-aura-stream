/**
 * Emotion Detection API Service
 * Communicates with the Wav2Vec2 Emotion Detection backend
 */

// API base URL - can be overridden via environment variable
// Set VITE_EMOTION_API_URL in .env file for production
// Automatically detects if running on network and uses network IP for API
const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_EMOTION_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // If accessing from network IP, use network IP for API
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Running on network IP, use same IP for API
    return `http://${hostname}:8000`;
  }
  
  // Default to localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging
console.log('🔗 Emotion API URL:', API_BASE_URL);
console.log('📋 Environment:', {
  VITE_EMOTION_API_URL: (import.meta as any).env?.VITE_EMOTION_API_URL,
  hostname: window.location.hostname,
  default: 'http://localhost:8000'
});

export interface EmotionPrediction {
  emotion: string;
  confidence: number;
  probabilities: Record<string, number>;
}

/**
 * Check if the emotion API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    console.log(`🔍 Checking API health at: ${API_BASE_URL}/health`);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add mode for CORS
      mode: 'cors',
    });
    
    console.log(`📡 API response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API health check passed:', data);
      return data.model_loaded === true;
    } else {
      console.error(`❌ API returned error status: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    console.error('❌ API health check failed:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return false;
  }
}

/**
 * Predict emotion from audio file
 * 
 * @param audioFile - Audio file (Blob or File object)
 * @returns Emotion prediction result
 */
export async function predictEmotion(audioFile: Blob | File): Promise<EmotionPrediction> {
  try {
    // Create FormData to send audio file
    const formData = new FormData();
    formData.append('audio', audioFile, 'recording.webm');

    console.log('📤 Sending audio to emotion API...');
    console.log(`📍 API URL: ${API_BASE_URL}/predict`);
    console.log(`📍 Audio file size: ${audioFile.size} bytes`);

    // Send POST request to emotion detection API
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      mode: 'cors', // Explicitly enable CORS
      credentials: 'omit', // Don't send cookies
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API returned error: ${response.status}`, errorText);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data: EmotionPrediction = await response.json();
    
    console.log('✅ Emotion prediction received:', data);
    
    return data;
  } catch (error: any) {
    console.error('❌ Error predicting emotion:', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error(
        `Failed to connect to emotion API at ${API_BASE_URL}.\n\n` +
        `Please ensure:\n` +
        `1. The backend API is running: python emotion-api/app.py\n` +
        `2. The API is accessible at: http://localhost:8000\n` +
        `3. Check browser console for CORS errors`
      );
    }
    
    throw error;
  }
}

/**
 * Convert Float32Array audio data to WAV Blob
 * Used for converting recorded audio to file format for API
 */
export function float32ArrayToWavBlob(audioData: Float32Array, sampleRate: number = 16000): Blob {
  // Create WAV file buffer
  const length = audioData.length;
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  
  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, 1, true); // number of channels (mono)
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // data chunk
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert float32 to int16
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

