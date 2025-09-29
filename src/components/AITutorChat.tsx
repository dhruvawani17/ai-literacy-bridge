'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  BookOpen, 
  Eye, 
  EyeOff,
  Loader2 
} from 'lucide-react'
import { useLearningStore, useAccessibilityStore } from '@/store'
import { getCerebrasClient } from '@/lib/cerebras'
import { getVoiceManager, getAccessibilityManager } from '@/lib/accessibility'
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'

interface AITutorChatProps {
  subject: string
  topic: string
  onProgress?: (progress: number) => void
}

// Unique ID generator for messages
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function AITutorChat({ subject, topic, onProgress }: AITutorChatProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    chatHistory, 
    addInteraction, 
    aiMemory, 
    currentSession,
    updateProgress 
  } = useLearningStore()
  
  const { 
    voiceSettings, 
    isVoiceEnabled, 
    isListening, 
    accessibilityPreferences,
    setListening,
    toggleVoice 
  } = useAccessibilityStore()

  const [voiceManager, setVoiceManager] = useState<any>(null)
  const [accessibilityManager, setAccessibilityManager] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVoiceManager(getVoiceManager(voiceSettings))
      setAccessibilityManager(getAccessibilityManager())
    }
  }, [voiceSettings])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Initialize with a welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: `Hello! I'm your AI tutor. I'm here to help you learn ${topic} in ${subject}. I can adapt to your learning style and accessibility needs. How can I help you today?`,
        timestamp: new Date(),
        metadata: { type: 'welcome' }
      }
      addInteraction(welcomeMessage)
      
      if (isVoiceEnabled && voiceManager) {
        voiceManager.speak(welcomeMessage.content)
      }
    }
  }, [topic, subject, chatHistory.length])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    addInteraction(userMessage)
    setMessage('')
    setIsLoading(true)

    try {
      const cerebras = getCerebrasClient()
      
      // Build context from chat history and AI memory
      const context = chatHistory.map(msg => 
        `${msg.role}: ${msg.content}`
      ).slice(-10) // Last 10 messages for context

      // Add accessibility context
      const accessibilityContext = []
      if (accessibilityPreferences.screenReader) {
        accessibilityContext.push('User uses screen reader - provide clear, structured responses')
      }
      if (accessibilityPreferences.audioDescriptions) {
        accessibilityContext.push('User needs audio descriptions for visual content')
      }
      if (accessibilityPreferences.brailleSupport) {
        accessibilityContext.push('User may use Braille - avoid complex visual formatting')
      }

      const systemPrompt = `You are an expert AI tutor specializing in ${subject}, currently teaching ${topic}. 
      ${accessibilityContext.length > 0 ? `Accessibility needs: ${accessibilityContext.join(', ')}. ` : ''}
      Student's learning pattern: ${aiMemory?.learningPattern || 'Not yet determined'}
      Student's strengths: ${aiMemory?.studentStrengths.join(', ') || 'To be discovered'}
      Student's weaknesses: ${aiMemory?.weaknesses.join(', ') || 'To be discovered'}
      
      Provide personalized, encouraging responses. Break down complex concepts into digestible parts.
      If explaining visual concepts, always include detailed descriptions for accessibility.`

      const response = await cerebras.generateEducationalContent(
        userMessage.content,
        subject,
        currentSession?.studentId ? 8 : 8, // Default grade 8
        voiceSettings.language,
        accessibilityContext
      )

      const aiResponse: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { 
          subject, 
          topic,
          accessibilityOptimized: accessibilityContext.length > 0
        }
      }

      addInteraction(aiResponse)

      // Update progress based on interaction
      const newProgress = Math.min(100, (chatHistory.length + 2) * 5)
      updateProgress(newProgress)
      onProgress?.(newProgress)

      // Speak the response if voice is enabled
      if (isVoiceEnabled && voiceManager) {
        await voiceManager.speak(response)
      }

      // Announce to screen readers
      if (accessibilityManager && accessibilityPreferences.screenReader) {
        accessibilityManager.announce('AI tutor responded')
      }

    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date(),
        metadata: { error: true }
      }
      addInteraction(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!voiceManager) return

    if (isListening) {
      voiceManager.stopListening()
      setListening(false)
    } else {
      voiceManager.startListening((result: string) => {
        setMessage(result)
        setListening(false)
      })
      setListening(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      accessibilityPreferences.highContrast && "high-contrast",
      `font-size-${accessibilityPreferences.fontSize}`
    )}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <h3 className="font-semibold">{subject} - {topic}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              aria-label={isVoiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            {accessibilityPreferences.screenReader && (
              <Badge variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                Screen Reader
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted',
                accessibilityPreferences.largeText && "text-lg"
              )}
              role={accessibilityPreferences.screenReader ? "log" : undefined}
              aria-live={msg.role === 'assistant' ? 'polite' : undefined}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={cn(
                "text-xs mt-2 opacity-70",
                msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI tutor is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about this topic..."
            disabled={isLoading}
            className={cn(
              "flex-1",
              accessibilityPreferences.largeText && "text-lg"
            )}
            aria-label="Type your question"
          />
          
          {voiceManager && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              disabled={isLoading}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              className={cn(
                isListening && "bg-red-100 border-red-300"
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-sm text-muted-foreground flex items-center">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <span className="ml-2">Listening...</span>
          </div>
        )}
      </div>
    </div>
  )
}