'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Mic, 
  Eye,
  Volume2,
  Settings,
  Calendar,
  Award,
  Target,
  LogOut
} from 'lucide-react'
import { useUserStore, useLearningStore, useScribeStore, useAccessibilityStore } from '@/store'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { AITutorChat } from './AITutorChat'
import { AIVoiceTutor } from './AIVoiceTutor'
import { LiveKitVoiceTutor } from './LiveKitVoiceTutor'
import { ScribeMatcher } from './ScribeMatcher'
import { VisualizationEngine } from './VisualizationEngine'
import { StudyAssistant } from './StudyAssistant'
import { gamificationService } from '@/lib/gamification-service'
import { UserGamification } from '@/types/scribe-system'
import { cn } from '@/lib/utils'

interface Subject {
  id: string
  name: string
  progress: number
  topics: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    progress: 65,
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus'],
    difficulty: 'intermediate'
  },
  {
    id: 'science',
    name: 'Science',
    progress: 45,
    topics: ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
    difficulty: 'beginner'
  },
  {
    id: 'english',
    name: 'English',
    progress: 80,
    topics: ['Grammar', 'Literature', 'Writing', 'Speaking'],
    difficulty: 'advanced'
  },
  {
    id: 'history',
    name: 'History',
    progress: 30,
    topics: ['World History', 'Indian History', 'Ancient Civilizations'],
    difficulty: 'beginner'
  }
]

export function StudentDashboard() {
  const router = useRouter()
  const { user } = useUserStore()
  const { sessions, currentSession, startSession, aiMemory } = useLearningStore()
  const { upcomingSessions } = useScribeStore()
  const { accessibilityPreferences } = useAccessibilityStore()
  const { logout } = useFirebaseAuth()
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS)
  const [showChat, setShowChat] = useState(false)
  const [showScribeMatcher, setShowScribeMatcher] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [showVoiceTutor, setShowVoiceTutor] = useState(false)
  const [showLiveKitVoiceTutor, setShowLiveKitVoiceTutor] = useState(false)
  const [showStudyAssistant, setShowStudyAssistant] = useState(false)
  const [userGamification, setUserGamification] = useState<UserGamification | null>(null)

  useEffect(() => {
    const loadGamification = async () => {
      if (user?.id) {
        const gamification = await gamificationService.getUserGamification(user.id)
        setUserGamification(gamification)
      }
    }
    loadGamification()
  }, [user?.id])

  const handleStartLearning = async (subjectId: string, topic: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(topic)
    startSession(subjectId, topic)
    setShowChat(true)

    // Award points for starting a session
    if (user?.id) {
      await gamificationService.updateUserStats(user.id, 'studyHours', 1) // Assuming 1 hour per session
    }
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedSubject(null)
    setSelectedTopic(null)
  }

  const handleOpenScribeMatcher = () => {
    router.push('/scribe-matching')
  }

  const handleCloseScribeMatcher = () => {
    setShowScribeMatcher(false)
  }

  const handleOpenVisualization = (subjectId: string, topic: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(topic)
    setShowVisualization(true)
  }

  const handleCloseVisualization = () => {
    setShowVisualization(false)
    setSelectedSubject(null)
    setSelectedTopic(null)
  }

  const handleOpenVoiceTutor = () => {
    setShowVoiceTutor(true)
  }

  const handleCloseVoiceTutor = () => {
    setShowVoiceTutor(false)
  }

  const handleOpenLiveKitVoiceTutor = () => {
    setShowLiveKitVoiceTutor(true)
  }

  const handleCloseLiveKitVoiceTutor = () => {
    setShowLiveKitVoiceTutor(false)
  }

  const handleOpenStudyAssistant = () => {
    setShowStudyAssistant(true)
  }

  const handleCloseStudyAssistant = () => {
    setShowStudyAssistant(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const totalProgress = subjects.reduce((acc, subject) => acc + subject.progress, 0) / subjects.length

  if (showChat && selectedSubject && selectedTopic) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI Tutor Session</h1>
            <Button variant="outline" onClick={handleCloseChat}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <AITutorChat 
            subject={selectedSubject} 
            topic={selectedTopic}
            onProgress={(progress) => {
              // Update subject progress
            }}
          />
        </div>
      </div>
    )
  }

  if (showScribeMatcher) {
    return <ScribeMatcher onClose={handleCloseScribeMatcher} />
  }

  if (showVoiceTutor) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Voice AI Tutor</h1>
            <Button variant="outline" onClick={handleCloseVoiceTutor}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Talk naturally with your AI tutor using voice commands
          </p>
        </div>
        <AIVoiceTutor />
      </div>
    )
  }

  if (showLiveKitVoiceTutor) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">LiveKit Voice AI Tutor</h1>
            <Button variant="outline" onClick={handleCloseLiveKitVoiceTutor}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Real-time voice interaction with low-latency AI tutoring
          </p>
        </div>
        <LiveKitVoiceTutor />
      </div>
    )
  }

  if (showVisualization && selectedSubject && selectedTopic) {
    return (
      <div className="min-h-screen">
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Interactive Visualization</h1>
            <Button variant="outline" onClick={handleCloseVisualization}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <VisualizationEngine 
          subject={selectedSubject} 
          topic={selectedTopic}
        />
      </div>
    )
  }

  if (showStudyAssistant) {
    return <StudyAssistant onClose={handleCloseStudyAssistant} />
  }

  return (
    <div className={cn(
      "min-h-screen bg-background p-6",
      accessibilityPreferences.highContrast && "high-contrast",
      `font-size-${accessibilityPreferences.fontSize}`
    )}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name || 'Student'}! 
            </h1>
            <p className="text-muted-foreground mt-2">
              Your personalized AI learning companion powered by Direct Llama
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {accessibilityPreferences.screenReader && (
              <Badge variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                Screen Reader
              </Badge>
            )}
            {accessibilityPreferences.voiceNavigation && (
              <Badge variant="secondary">
                <Mic className="h-3 w-3 mr-1" />
                Voice
              </Badge>
            )}
            <Button variant="outline" size="icon" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold text-foreground">{Math.round(totalProgress)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sessions Today</p>
              <p className="text-2xl font-bold text-foreground">{sessions.filter(s => 
                new Date(s.startTime).toDateString() === new Date().toDateString()
              ).length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Scribe Sessions</p>
              <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Achievements</p>
              <p className="text-2xl font-bold text-foreground">{userGamification?.achievements.length || 0}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Your Subjects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{subject.name}</h3>
                    <Badge variant={subject.difficulty === 'advanced' ? 'default' : 'secondary'}>
                      {subject.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          getProgressColor(subject.progress)
                        )}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-card-foreground">Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {subject.topics.slice(0, 3).map((topic) => (
                        <div key={topic} className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartLearning(subject.id, topic)}
                            className="text-xs h-auto py-1 px-2"
                          >
                            💬 {topic}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenVisualization(subject.id, topic)}
                            className="text-xs h-auto py-1 px-1"
                            title="View Visualization"
                          >
                            🎯
                          </Button>
                        </div>
                      ))}
                      {subject.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{subject.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Tutor Memory */}
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-4 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              AI Tutor Insights
            </h3>
            
            {aiMemory ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Strengths</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiMemory.studentStrengths.slice(0, 3).map((strength, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-card-foreground">Focus Areas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiMemory.weaknesses.slice(0, 3).map((weakness, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-card-foreground">Learning Style</p>
                  <p className="text-sm mt-1 text-muted-foreground">{aiMemory.preferredExplanationStyle || 'Discovering...'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start a learning session to build your personalized AI tutor memory!
              </p>
            )}
          </div>

          {/* Gamification */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 shadow-sm border border-yellow-200">
            <h3 className="font-semibold mb-4 flex items-center text-yellow-800">
              <Award className="h-5 w-5 mr-2" />
              Your Progress
            </h3>
            
            {userGamification ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Level {userGamification.level}</span>
                  <span className="text-sm text-muted-foreground">
                    {userGamification.experiencePoints}/{userGamification.experienceToNextLevel} XP
                  </span>
                </div>
                <div className="bg-muted rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(userGamification.experiencePoints / userGamification.experienceToNextLevel) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{userGamification.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{userGamification.achievements.length}</p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>
                </div>

                {userGamification.achievements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recent Achievements</p>
                    <div className="space-y-1">
                      {userGamification.achievements.slice(-2).map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-2 text-sm">
                          <span className="text-lg">{achievement.icon}</span>
                          <span>{achievement.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Loading your progress...
              </p>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Sessions
            </h3>
            
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{session.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.scheduledTime.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {session.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming sessions. Book a scribe for your next exam!
              </p>
            )}
            
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={handleOpenScribeMatcher}
            >
              Book Scribe Session
            </Button>
          </div>

          {/* Voice AI Tutor */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 shadow-sm border border-purple-200">
            <h3 className="font-semibold mb-2 flex items-center text-purple-800">
              <Mic className="h-5 w-5 mr-2" />
              Voice AI Tutor
            </h3>
            <p className="text-sm text-purple-700 mb-4">
              Real-time voice interaction with your AI tutor. Perfect for accessibility and hands-free learning!
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleOpenLiveKitVoiceTutor}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                LiveKit Voice Session (Recommended)
              </Button>
              <Button 
                onClick={handleOpenVoiceTutor}
                variant="outline"
                className="w-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                Basic Voice Session
              </Button>
            </div>
          </div>

          {/* Accessibility Quick Actions */}
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleOpenLiveKitVoiceTutor}
              >
                <Mic className="h-4 w-4 mr-2" />
                LiveKit Voice Tutor
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleOpenVoiceTutor}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Basic Voice Tutor
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleOpenStudyAssistant}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Study Assistant
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Volume2 className="h-4 w-4 mr-2" />
                Voice Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Accessibility Options
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}