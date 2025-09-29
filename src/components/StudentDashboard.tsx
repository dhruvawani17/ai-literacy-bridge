'use client'

import React, { useState, useEffect } from 'react'
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
  Target
} from 'lucide-react'
import { useUserStore, useLearningStore, useScribeStore, useAccessibilityStore } from '@/store'
import { AITutorChat } from './AITutorChat'
import { ScribeMatcher } from './ScribeMatcher'
import { VisualizationEngine } from './VisualizationEngine'
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
  const { user } = useUserStore()
  const { sessions, currentSession, startSession, aiMemory } = useLearningStore()
  const { upcomingSessions } = useScribeStore()
  const { accessibilityPreferences } = useAccessibilityStore()
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS)
  const [showChat, setShowChat] = useState(false)
  const [showScribeMatcher, setShowScribeMatcher] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  const handleStartLearning = (subjectId: string, topic: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(topic)
    startSession(subjectId, topic)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedSubject(null)
    setSelectedTopic(null)
  }

  const handleOpenScribeMatcher = () => {
    setShowScribeMatcher(true)
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
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name || 'Student'}! 
            </h1>
                        <p className="text-gray-600 mt-2">
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
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold">{Math.round(totalProgress)}%</p>
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

        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions Today</p>
              <p className="text-2xl font-bold">{sessions.filter(s => 
                new Date(s.startTime).toDateString() === new Date().toDateString()
              ).length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Scribe Sessions</p>
              <p className="text-2xl font-bold">{upcomingSessions.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-2xl font-bold">12</p>
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
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
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
                    <p className="text-sm font-medium text-gray-700">Topics:</p>
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
                  <p className="text-sm font-medium text-gray-700">Strengths</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiMemory.studentStrengths.slice(0, 3).map((strength, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Focus Areas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiMemory.weaknesses.slice(0, 3).map((weakness, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Learning Style</p>
                  <p className="text-sm mt-1">{aiMemory.preferredExplanationStyle || 'Discovering...'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start a learning session to build your personalized AI tutor memory!
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

          {/* Accessibility Quick Actions */}
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
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