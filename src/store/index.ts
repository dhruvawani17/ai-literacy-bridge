import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  User, 
  LearningSession, 
  ChatMessage, 
  VoiceSettings, 
  AccessibilityPreferences,
  ScribeSession,
  AIMemory 
} from '@/types'

// User store
interface UserStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  updateAccessibilityPreferences: (preferences: Partial<AccessibilityPreferences>) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateAccessibilityPreferences: (preferences) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              accessibility: { 
                ...currentUser.accessibility, 
                ...preferences 
              } as AccessibilityPreferences
            }
          })
        }
      },
      logout: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: 'user-store'
    }
  )
)

// Learning session store
interface LearningStore {
  currentSession: LearningSession | null
  sessions: LearningSession[]
  aiMemory: AIMemory | null
  chatHistory: ChatMessage[]
  isLoading: boolean
  startSession: (subject: string, topic: string) => void
  endSession: () => void
  addInteraction: (message: ChatMessage) => void
  updateProgress: (progress: number) => void
  setSessions: (sessions: LearningSession[]) => void
  setAIMemory: (memory: AIMemory) => void
  clearChat: () => void
}

export const useLearningStore = create<LearningStore>()((set, get) => ({
  currentSession: null,
  sessions: [],
  aiMemory: null,
  chatHistory: [],
  isLoading: false,
  startSession: (subject, topic) => {
    const newSession: LearningSession = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: useUserStore.getState().user?.id || '',
      subject,
      topic,
      startTime: new Date(),
      progress: 0,
      interactions: [],
      aiTutorMemory: get().aiMemory || {
        studentStrengths: [],
        weaknesses: [],
        learningPattern: '',
        preferredExplanationStyle: '',
        historicalPerformance: {},
        lastSession: new Date(),
        totalSessions: 0
      }
    }
    set({ currentSession: newSession })
  },
  endSession: () => {
    const session = get().currentSession
    if (session) {
      set({ 
        currentSession: { ...session, endTime: new Date() },
        sessions: [...get().sessions, { ...session, endTime: new Date() }]
      })
    }
  },
  addInteraction: (message) => {
    const currentHistory = get().chatHistory
    // Prevent duplicate messages by checking if ID already exists
    if (currentHistory.some(existing => existing.id === message.id)) {
      return
    }
    
    set({ chatHistory: [...currentHistory, message] })
    
    const session = get().currentSession
    if (session) {
      const interaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: (message.role === 'user' ? 'question' : 'answer') as 'question' | 'answer',
        content: message.content,
        timestamp: new Date(),
        metadata: message.metadata
      }
      session.interactions.push(interaction)
      set({ currentSession: session })
    }
  },
  updateProgress: (progress) => {
    const session = get().currentSession
    if (session) {
      set({ currentSession: { ...session, progress } })
    }
  },
  setSessions: (sessions) => set({ sessions }),
  setAIMemory: (memory) => set({ aiMemory: memory }),
  clearChat: () => set({ chatHistory: [] })
}))

// Voice and accessibility store
interface AccessibilityStore {
  voiceSettings: VoiceSettings
  isVoiceEnabled: boolean
  isListening: boolean
  accessibilityPreferences: AccessibilityPreferences
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void
  toggleVoice: () => void
  setListening: (listening: boolean) => void
  updateAccessibilityPreferences: (preferences: Partial<AccessibilityPreferences>) => void
}

export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set, get) => ({
      voiceSettings: {
        enabled: false,
        language: 'en-US',
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      },
      isVoiceEnabled: false,
      isListening: false,
      accessibilityPreferences: {
        screenReader: false,
        highContrast: false,
        largeText: false,
        voiceNavigation: false,
        brailleSupport: false,
        audioDescriptions: false,
        speechRate: 1.0,
        fontSize: 'medium'
      },
      updateVoiceSettings: (settings) => 
        set({ voiceSettings: { ...get().voiceSettings, ...settings } }),
      toggleVoice: () => set({ isVoiceEnabled: !get().isVoiceEnabled }),
      setListening: (listening) => set({ isListening: listening }),
      updateAccessibilityPreferences: (preferences) =>
        set({ 
          accessibilityPreferences: { 
            ...get().accessibilityPreferences, 
            ...preferences 
          }
        })
    }),
    {
      name: 'accessibility-store'
    }
  )
)

// Scribe store
interface ScribeStore {
  upcomingSessions: ScribeSession[]
  availableScribes: any[]
  currentScribeSession: ScribeSession | null
  isSearching: boolean
  setUpcomingSessions: (sessions: ScribeSession[]) => void
  setAvailableScribes: (scribes: any[]) => void
  setCurrentScribeSession: (session: ScribeSession | null) => void
  setSearching: (searching: boolean) => void
  bookScribe: (scribeId: string, subject: string, scheduledTime: Date) => void
}

export const useScribeStore = create<ScribeStore>()((set, get) => ({
  upcomingSessions: [],
  availableScribes: [],
  currentScribeSession: null,
  isSearching: false,
  setUpcomingSessions: (sessions) => set({ upcomingSessions: sessions }),
  setAvailableScribes: (scribes) => set({ availableScribes: scribes }),
  setCurrentScribeSession: (session) => set({ currentScribeSession: session }),
  setSearching: (searching) => set({ isSearching: searching }),
  bookScribe: (scribeId, subject, scheduledTime) => {
    const user = useUserStore.getState().user
    if (!user) return

    const newSession: ScribeSession = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      scribeId,
      subject,
      type: 'exam',
      scheduledTime,
      duration: 120, // 2 hours default
      status: 'scheduled'
    }

    set({ 
      upcomingSessions: [...get().upcomingSessions, newSession],
      currentScribeSession: newSession
    })
  }
}))

// UI store for general app state
interface UIStore {
  sidebarOpen: boolean
  currentPage: string
  isLoading: boolean
  notifications: Array<{
    id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    timestamp: Date
  }>
  toggleSidebar: () => void
  setCurrentPage: (page: string) => void
  setLoading: (loading: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
  removeNotification: (id: string) => void
}

export const useUIStore = create<UIStore>()((set, get) => ({
  sidebarOpen: false,
  currentPage: 'dashboard',
  isLoading: false,
  notifications: [],
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),
  addNotification: (message, type = 'info') => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    }
    set({ notifications: [...get().notifications, notification] })
  },
  removeNotification: (id) => {
    set({ notifications: get().notifications.filter(n => n.id !== id) })
  }
}))