'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Brain,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import { 
  Room, 
  RoomEvent, 
  Track, 
  LocalTrack, 
  RemoteTrack,
  AudioTrack,
  TrackPublication,
  ConnectionState,
  DisconnectReason,
  createLocalAudioTrack
} from 'livekit-client'
import { getSecureChatAPI } from '@/lib/secure-chat-api'

interface VoiceMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  duration?: number
}

interface LiveKitConfig {
  serverUrl: string
  token: string
  roomName: string
}

export function LiveKitVoiceTutor() {
  // Room and connection states
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Voice states
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  
  // Messages and settings
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [autoListen, setAutoListen] = useState(true)
  const [speechRate, setSpeechRate] = useState(0.9)
  const [speechVolume, setSpeechVolume] = useState(0.8)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  
  // Refs
  const roomRef = useRef<Room | null>(null)
  const localAudioTrack = useRef<LocalTrack | null>(null)
  const speechRecognition = useRef<any>(null)
  const speechSynthesis = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis
      
      // Load available voices
      const loadVoices = () => {
        const voices = speechSynthesis.current?.getVoices() || []
        setAvailableVoices(voices)
        
        // Set default voice (prefer English voices)
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Natural') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex') ||
          voice.lang.startsWith('en')
        ) || voices[0]
        
        setSelectedVoice(preferredVoice)
      }
      
      // Load voices immediately and also when they change
      loadVoices()
      speechSynthesis.current.onvoiceschanged = loadVoices
    }

    // Initialize welcome message
    const welcomeMessage: VoiceMessage = {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to LiveKit Voice Tutor! This provides real-time, low-latency voice interaction for better learning. Click "Connect" to start your voice session.',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isListening && isConnected) {
        e.preventDefault()
        startListening()
      } else if (e.code === 'Escape' && isListening) {
        stopListening()
      } else if (e.code === 'KeyS' && e.ctrlKey) {
        e.preventDefault()
        stopSpeaking()
      } else if (e.code === 'KeyT' && e.ctrlKey && selectedVoice && !isSpeaking) {
        e.preventDefault()
        speakText("Hello! This is how I sound with the selected voice.")
      } else if (e.code === 'KeyL' && e.ctrlKey) {
        e.preventDefault()
        setAutoListen(!autoListen)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isListening, isConnected, selectedVoice, isSpeaking, autoListen])

  // Setup speech recognition
  const setupSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return null
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started')
      setIsListening(true)
      setCurrentTranscript('')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setCurrentTranscript(finalTranscript + interimTranscript)

      if (finalTranscript.trim()) {
        console.log('🗣️ Final transcript received:', finalTranscript.trim())
        console.log('🎤 Keeping microphone active for continuous conversation')
        
        // DON'T stop recognition - keep it running for continuous conversation
        // Just clear the current transcript display
        setCurrentTranscript('')
        
        // Process the message while keeping mic active
        handleUserMessage(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        addSystemMessage(`Speech recognition error: ${event.error}. Please try again.`)
      }
    }

    recognition.onend = () => {
      console.log('🔇 Speech recognition ended')
      setIsListening(false)
      setCurrentTranscript('')
    }

    return recognition
  }, [])

  // Connect to LiveKit room
  const connectToRoom = async () => {
    if (isConnecting || isConnected) return

    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Generate room token from your API
      const roomName = `voice-tutor-${Date.now()}`
      const participantName = 'Student'
      const participantId = `student-${Date.now()}`

      // Get token from your server
      const tokenResponse = await fetch('/api/livekit-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
          participantId,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get LiveKit token')
      }

      const { token, serverUrl } = await tokenResponse.json()

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          audioPreset: {
            maxBitrate: 128_000,
          },
        },
      })

      // Set up room event listeners
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to room')
        setIsConnected(true)
        setIsConnecting(false)
        addSystemMessage('Connected to LiveKit voice session! You can now start speaking.')
        
        // Initialize speech recognition and auto-start listening
        speechRecognition.current = setupSpeechRecognition()
        setTimeout(() => startListening(), 1000)
      })

      newRoom.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        console.log('Disconnected from room:', reason)
        setIsConnected(false)
        setIsConnecting(false)
        addSystemMessage(`Disconnected from voice session: ${reason || 'Unknown reason'}`)
      })

      newRoom.on(RoomEvent.TrackPublished, (publication: TrackPublication) => {
        console.log('Track published:', publication.trackSid)
      })

      newRoom.on(RoomEvent.TrackUnpublished, (publication: TrackPublication) => {
        console.log('Track unpublished:', publication.trackSid)
      })

      newRoom.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        console.log('Audio playback status changed')
      })

      // Connect to your actual LiveKit server
      await newRoom.connect(serverUrl, token)

      setRoom(newRoom)
      roomRef.current = newRoom

    } catch (error) {
      console.error('Failed to connect to room:', error)
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
      setIsConnecting(false)
      addSystemMessage('Failed to connect to voice session. Please check your connection and try again.')
    }
  }

  // Disconnect from room
  const disconnectFromRoom = async () => {
    if (room) {
      await room.disconnect()
      setRoom(null)
      roomRef.current = null
    }
    
    if (speechRecognition.current) {
      speechRecognition.current.stop()
      speechRecognition.current = null
    }
    
    setIsConnected(false)
    setIsListening(false)
    stopSpeaking()
  }

  // Start listening for voice input
  const startListening = useCallback(() => {
    if (!isConnected) {
      console.log('❌ Cannot start listening: not connected')
      return
    }

    console.log('🎯 Starting listening process...')
    
    // Stop any current speech
    stopSpeaking()
    
    // Clean up any existing recognition
    if (speechRecognition.current) {
      try {
        speechRecognition.current.stop()
      } catch (e) {
        console.log('Previous recognition cleanup:', e)
      }
    }
    
    // Reset state
    setIsListening(false)
    setCurrentTranscript('')
    
    // Create new recognition instance
    const newRecognition = setupSpeechRecognition()
    if (!newRecognition) {
      console.log('❌ Speech recognition not supported')
      return
    }
    
    speechRecognition.current = newRecognition
    
    // Start recognition with a small delay to ensure clean state
    setTimeout(() => {
      try {
        console.log('🚀 Starting speech recognition...')
        speechRecognition.current?.start()
      } catch (error) {
        console.error('❌ Error starting speech recognition:', error)
        setIsListening(false)
        
        // If we get an error, try once more after a longer delay
        setTimeout(() => {
          try {
            console.log('🔄 Retrying speech recognition...')
            speechRecognition.current?.start()
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError)
          }
        }, 1000)
      }
    }, 150)
  }, [isConnected, setupSpeechRecognition])

  // Stop listening
  const stopListening = () => {
    if (speechRecognition.current && isListening) {
      speechRecognition.current.stop()
    }
  }

  // Speak text using Web Speech API
  const speakText = async (text: string) => {
    if (!speechSynthesis.current || !text.trim()) return

    speechSynthesis.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate
    utterance.volume = speechVolume
    utterance.pitch = 1.0

    // Use selected voice or find a preferred one
    if (selectedVoice) {
      utterance.voice = selectedVoice
    } else {
      const voices = speechSynthesis.current.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex') ||
        voice.lang.startsWith('en')
      ) || voices[0]
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
    }

    utterance.onstart = () => {
      console.log('🔊 AI started speaking')
      setIsSpeaking(true)
    }
    
    utterance.onend = () => {
      console.log('✅ AI finished speaking')
      setIsSpeaking(false)
      console.log('🎤 Microphone remains active for continuous conversation')
    }
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
      console.log('🎤 Microphone remains active despite speech error')
    }

    speechSynthesis.current.speak(utterance)
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Add system message
  const addSystemMessage = (content: string) => {
    const message: VoiceMessage = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  // Handle user voice input
  const handleUserMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)
    setCurrentTranscript('')

    try {
      // Get AI response using secure API
      const chatAPI = getSecureChatAPI()
      const response = await chatAPI.generateEducationalContent(
        messageText,
        'general',
        8, // Default grade level
        'en'
      )

      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Speak the response if auto-speak is enabled
      if (autoSpeak) {
        await speakText(response)
      }

    } catch (error) {
      console.error('Error getting AI response:', error)
      
      const errorMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your question right now. Could you please try asking again?',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      
      if (autoSpeak) {
        speakText(errorMessage.content)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([])
    stopListening()
    stopSpeaking()
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromRoom()
    }
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            LiveKit Voice Tutor
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
            {isListening && (
              <Badge variant="secondary" className="bg-white/20 text-white animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting to LiveKit Voice Session...' : 'Connect to Start Real-time Voice Learning'}
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Using your LiveKit server (ai-literacy-bridge-bs6x9mon.livekit.cloud) for professional-grade real-time voice communication.
            </p>
            <Button 
              onClick={connectToRoom}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect to Voice Session
                </>
              )}
            </Button>
            {connectionError && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {connectionError}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">How to Use LiveKit Voice Tutor:</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Connect to voice session for real-time interaction</li>
            <li>• Speak naturally - the tutor will respond automatically</li>
            <li>• Auto-listening will start after AI responses for continuous conversation</li>
            <li>• Use <strong>Spacebar</strong> to manually start listening</li>
            <li>• Press <strong>Escape</strong> to stop listening</li>
            <li>• Press <strong>Ctrl+S</strong> to stop speaking</li>
            <li>• Press <strong>Ctrl+T</strong> to test selected voice</li>
            <li>• Press <strong>Ctrl+L</strong> to toggle auto-listening</li>
            <li>• Ask questions about any subject you're studying</li>
          </ul>
        </div>

        {/* Voice Settings */}
        {isConnected && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Voice Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  AI Voice:
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value)
                    setSelectedVoice(voice || null)
                  }}
                  className="w-full p-2 border border-blue-200 rounded-md text-sm"
                >
                  <option value="">Default Voice</option>
                  {availableVoices
                    .filter(voice => voice.lang.startsWith('en'))
                    .map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Speech Rate:
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-blue-600">{speechRate}x</span>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <Button
                onClick={() => setAutoListen(!autoListen)}
                variant={autoListen ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
              >
                <Mic className="h-3 w-3" />
                Auto-Listen: {autoListen ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={() => setAutoSpeak(!autoSpeak)}
                variant={autoSpeak ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
              >
                <Volume2 className="h-3 w-3" />
                Auto-Speak: {autoSpeak ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        )}

        {/* Messages Display */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-purple-600 mt-20">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-75" />
              <p>Connect to start your voice learning session</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'system'
                        ? 'bg-purple-100 border border-purple-300 text-purple-800'
                        : 'bg-white border shadow-sm text-blue-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Current input display */}
              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-300 text-blue-900">
                    <p className="text-sm italic">"{currentTranscript}"</p>
                  </div>
                </div>
              )}
              
              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-blue-700">AI is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          {isConnected ? (
            <>
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`flex items-center gap-2 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start Listening
                  </>
                )}
              </Button>

              <Button
                onClick={disconnectFromRoom}
                variant="outline"
                className="flex items-center gap-2"
              >
                <WifiOff className="h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={connectToRoom}
              disabled={isConnecting}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          )}

          <Button
            onClick={isSpeaking ? stopSpeaking : () => {}}
            variant="outline"
            disabled={!isSpeaking}
            className="flex items-center gap-2"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4" />
                Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Not Speaking
              </>
            )}
          </Button>

          <Button
            onClick={clearConversation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Chat
          </Button>

          {selectedVoice && (
            <Button
              onClick={() => speakText("Hello! This is how I sound with the selected voice.")}
              variant="outline"
              disabled={isSpeaking}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Test Voice
            </Button>
          )}
        </div>

        {/* Status Display */}
        <div className="mt-4 text-center">
          {!isConnected && (
            <p className="text-sm text-blue-700">Connect to voice session to start learning with real-time voice interaction</p>
          )}
          {isConnected && !isListening && !isSpeaking && !isProcessing && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-green-700 font-medium">⏸️ Ready to Start</p>
              <p className="text-sm text-blue-700">Click "Start Listening" for continuous conversation mode</p>
            </div>
          )}
          {isConnected && isListening && !isSpeaking && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 font-medium animate-pulse">🎤 Continuous Listening Active</p>
              <p className="text-sm text-blue-600">Speak anytime - microphone stays on for seamless conversation</p>
            </div>
          )}
          {isConnected && isListening && isSpeaking && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 font-medium">🔊 AI Speaking + Mic Active</p>
              <p className="text-sm text-green-600">Continue speaking when I finish - no need to click anything!</p>
            </div>
          )}
          {isConnected && isListening && isProcessing && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-700 font-medium">🤔 Processing + Mic Active</p>
              <p className="text-sm text-orange-600">Analyzing your question while staying ready for more input</p>
            </div>
          )}
        </div>

        {/* LiveKit Info */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg text-xs text-green-700 border border-green-200">
          <p>
            <strong>✅ LiveKit Configured:</strong> Connected to your LiveKit server at ai-literacy-bridge-bs6x9mon.livekit.cloud 
            with real-time voice communication for optimal learning experience.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveKitVoiceTutor