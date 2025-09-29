// LiveKit Configuration for AI Literacy Bridge

export interface LiveKitConfig {
  serverUrl: string
  apiKey: string
  apiSecret: string
  roomName: string
}

export interface VoiceTutorRoomOptions {
  userId: string
  userName: string
  subject?: string
  gradeLevel?: number
}

// LiveKit server configuration
// Using actual LiveKit credentials from environment variables
export const LIVEKIT_CONFIG = {
  // Your LiveKit server URL
  serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://ai-literacy-bridge-bs6x9mon.livekit.cloud',
  
  // API credentials (server-side only)
  apiKey: process.env.LIVEKIT_API_KEY || 'APItzxWyvkfrKGc',
  apiSecret: process.env.LIVEKIT_API_SECRET || 'Pf0N1kW2HmDzK9cluil4LdTtdlAo0Sze0a9HsDUw5YK',
  
  // Room configuration
  defaultRoomName: 'voice-tutor-room',
  maxParticipants: 2, // Student + AI Tutor
  
  // Audio settings optimized for voice tutoring
  audioPreset: {
    maxBitrate: 128_000,
    priority: 'high' as const,
  },
  
  // Publishing defaults
  publishDefaults: {
    audioPreset: {
      maxBitrate: 128_000,
    },
    videoCodec: undefined, // Audio-only for voice tutoring
  },
}

// Generate room token (this should be done on your backend in production)
export async function generateRoomToken(options: VoiceTutorRoomOptions): Promise<string> {
  // In production, this would be a server-side API call to generate a JWT token
  // For demo purposes, we'll return a placeholder token
  
  const roomName = `voice-tutor-${options.userId}-${Date.now()}`
  
  // This is a placeholder - in production you would use the LiveKit JWT library
  // to generate a proper token with your API key and secret
  const placeholderToken = btoa(JSON.stringify({
    iss: LIVEKIT_CONFIG.apiKey,
    sub: options.userId,
    aud: roomName,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    room: roomName,
    identity: options.userId,
    name: options.userName,
  }))
  
  return placeholderToken
}

// Room connection helper
export function createRoomConnection() {
  return {
    // Room options optimized for voice tutoring
    adaptiveStream: true,
    dynacast: true,
    publishDefaults: LIVEKIT_CONFIG.publishDefaults,
    
    // Audio-only configuration
    videoCaptureDefaults: {
      enabled: false, // Disable video for voice-only tutoring
    },
    
    audioCaptureDefaults: {
      enabled: true,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  }
}

// Voice processing configuration
export const VOICE_CONFIG = {
  // Speech recognition settings
  speechRecognition: {
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    language: 'en-US',
  },
  
  // Text-to-speech settings
  speechSynthesis: {
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    preferredVoices: ['Google', 'Natural', 'Enhanced'],
  },
  
  // Audio processing
  audioProcessing: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    channelCount: 1, // Mono for voice
  },
}

export default {
  LIVEKIT_CONFIG,
  VOICE_CONFIG,
  generateRoomToken,
  createRoomConnection,
}