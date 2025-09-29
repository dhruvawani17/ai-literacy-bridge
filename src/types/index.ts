// User types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  language: string
  accessibility?: AccessibilityPreferences
  profile?: UserProfile
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'student' | 'teacher' | 'scribe' | 'admin'

export interface AccessibilityPreferences {
  screenReader: boolean
  highContrast: boolean
  largeText: boolean
  voiceNavigation: boolean
  brailleSupport: boolean
  audioDescriptions: boolean
  speechRate: number
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
}

export interface UserProfile {
  grade?: number
  subjects: string[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  languagePreference: string
  location?: {
    country: string
    state: string
    city: string
  }
  disabilities?: string[]
}

// Learning types
export interface LearningSession {
  id: string
  studentId: string
  subject: string
  topic: string
  startTime: Date
  endTime?: Date
  progress: number
  interactions: Interaction[]
  aiTutorMemory: AIMemory
}

export interface Interaction {
  id: string
  type: 'question' | 'answer' | 'explanation' | 'visualization' | 'voice'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface AIMemory {
  studentStrengths: string[]
  weaknesses: string[]
  learningPattern: string
  preferredExplanationStyle: string
  historicalPerformance: Record<string, number>
  lastSession: Date
  totalSessions: number
}

// Scribe types
export interface Scribe {
  id: string
  userId: string
  subjects: string[]
  languages: string[]
  availability: AvailabilitySchedule
  rating: number
  totalSessions: number
  isActive: boolean
  certifications: string[]
}

export interface AvailabilitySchedule {
  [key: string]: TimeSlot[] // day of week -> time slots
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string
}

export interface ScribeSession {
  id: string
  studentId: string
  scribeId: string
  subject: string
  type: 'exam' | 'homework' | 'practice'
  scheduledTime: Date
  duration: number
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notes?: string
}

// Visualization types
export interface Visualization {
  id: string
  title: string
  subject: string
  topic: string
  type: 'animation' | 'interactive' | 'chart' | 'diagram'
  codeGenerated: string
  audioDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  languages: string[]
}

export interface VisualizationRequest {
  topic: string
  subject: string
  userLanguage: string
  accessibilityNeeds: string[]
  complexity: 'simple' | 'detailed' | 'comprehensive'
}

// Cerebras integration types
export interface CerebrasConfig {
  apiKey: string
  endpoint: string
  model: string
  maxTokens: number
  temperature: number
}

export interface CerebrasResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: Record<string, any>
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Component props types
export interface DashboardProps {
  user: User
  sessions: LearningSession[]
  upcomingSessions: ScribeSession[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface VoiceSettings {
  enabled: boolean
  language: string
  voice: string
  rate: number
  pitch: number
  volume: number
}