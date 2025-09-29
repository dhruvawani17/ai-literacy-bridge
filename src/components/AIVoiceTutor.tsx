'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Settings
} from 'lucide-react'
import { getCerebrasClient } from '@/lib/cerebras'
import { getSecureChatAPI } from '@/lib/secure-chat-api'
import { Badge } from '@/components/ui/badge'

interface VoiceMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  duration?: number
}

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function AIVoiceTutor() {
  // Voice recognition and synthesis states
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [speechSupported, setSpeechSupported] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  
  // Settings
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [autoListen, setAutoListen] = useState(true)
  const [speechRate, setSpeechRate] = useState(0.9)
  const [speechVolume, setSpeechVolume] = useState(0.8)
  const [voicePitch, setVoicePitch] = useState(1.0)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Refs
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for speech support
    const speechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const speechSynthesisSupported = 'speechSynthesis' in window
    
    setSpeechSupported(speechRecognitionSupported && speechSynthesisSupported)
    
    if (speechSynthesisSupported) {
      synthRef.current = window.speechSynthesis
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
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
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Initial greeting
    if (speechSynthesisSupported) {
      const welcomeMessage: VoiceMessage = {
        id: 'welcome',
        type: 'assistant',
        content: 'Hello! I\'m your AI voice tutor. I\'m here to help you learn through conversation. You can ask me questions about any subject - mathematics, science, English, history, or anything else you\'d like to explore. Press the microphone button or use the spacebar to start talking!',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      
      // Speak welcome message if auto-speak is enabled
      setTimeout(() => {
        if (autoSpeak) {
          speakText(welcomeMessage.content)
        }
      }, 1000)
    }

    // Setup keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isListening && speechSupported) {
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
  }, [isListening, speechSupported, autoSpeak, selectedVoice, isSpeaking, autoListen])

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const setupSpeechRecognition = () => {
    if (!speechSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart
        } else {
          interimTranscript += transcriptPart
        }
      }

      setTranscript(finalTranscript + interimTranscript)
      setCurrentMessage(finalTranscript + interimTranscript)

      if (finalTranscript) {
        handleUserMessage(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      // Provide audio feedback for errors
      if (autoSpeak) {
        speakText('Sorry, I had trouble hearing you. Please try again.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setTranscript('')
    }

    return recognition
  }

  const startListening = () => {
    if (!speechSupported || isListening) return

    // Stop any current speech
    stopSpeaking()

    recognitionRef.current = setupSpeechRecognition()
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setTranscript('')
  }

  const speakText = async (text: string) => {
    if (!synthRef.current || !text.trim()) return

    // Stop any current speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate
    utterance.volume = speechVolume
    utterance.pitch = voicePitch
    
    // Use selected voice or find a preferred one
    if (selectedVoice) {
      utterance.voice = selectedVoice
    } else {
      const voices = synthRef.current.getVoices()
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

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      // Auto-restart listening after speaking if auto-listen is enabled
      if (speechSupported && autoListen) {
        setTimeout(() => {
          console.log('Auto-starting listening after speech ended')
          startListening()
        }, 500) // Small delay to ensure speech has fully ended
      }
    }
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
      // Still try to restart listening even if speech failed
      if (speechSupported && autoListen) {
        setTimeout(() => startListening(), 500)
      }
    }

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleUserMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setCurrentMessage('')

    try {
      // Get AI response using secure API (fallback to Cerebras client)
      let response: string
      try {
        const chatAPI = getSecureChatAPI()
        response = await chatAPI.generateEducationalContent(
          messageText,
          'general',
          8, // Default grade level
          'en'
        )
      } catch (apiError) {
        console.log('Secure API failed, using Cerebras client:', apiError)
        const cerebrasClient = getCerebrasClient()
        response = await cerebrasClient.generateEducationalContent(
          messageText,
          'general',
          8,
          'en'
        )
      }

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
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    stopListening()
    stopSpeaking()
  }

  const repeatLastMessage = () => {
    const lastAssistantMessage = messages.filter(m => m.type === 'assistant').pop()
    if (lastAssistantMessage) {
      speakText(lastAssistantMessage.content)
    }
  }

  if (!speechSupported) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-red-500" />
            Voice Tutor Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your browser doesn't support speech recognition or synthesis. 
            Please use a modern browser like Chrome, Firefox, or Safari to access the voice tutor.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Voice Tutor for Accessibility
          </div>
          <div className="flex gap-2">
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
        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to Use Voice Tutor:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Press the microphone button or use <strong>Spacebar</strong> to start talking</li>
            <li>• Press <strong>Escape</strong> to stop listening</li>
            <li>• Press <strong>Ctrl+S</strong> to stop speech</li>
            <li>• Ask questions about any subject you're studying</li>
          </ul>
        </div>

        {/* Messages Display */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Start a conversation by pressing the microphone button</p>
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
                        : 'bg-white border shadow-sm text-gray-800'
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
              {currentMessage && (
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-300 text-blue-900">
                    <p className="text-sm italic">"{currentMessage}"</p>
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white border shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-gray-600">Thinking...</p>
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
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`flex items-center gap-2 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
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
            onClick={isSpeaking ? stopSpeaking : repeatLastMessage}
            variant="outline"
            disabled={isLoading}
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
                Repeat Last
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

          <Button
            onClick={() => setAutoSpeak(!autoSpeak)}
            variant={autoSpeak ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Auto-Speak: {autoSpeak ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Status Display */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {isListening && (
            <p className="text-blue-600 font-medium">🎤 Listening for your question...</p>
          )}
          {isSpeaking && (
            <p className="text-green-600 font-medium">🔊 Speaking response...</p>
          )}
          {isLoading && (
            <p className="text-orange-600 font-medium">🤔 Processing your question...</p>
          )}
          {!isListening && !isSpeaking && !isLoading && (
            <p>Ready to help! Press the microphone button or spacebar to ask a question.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AIVoiceTutor