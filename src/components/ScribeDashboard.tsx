/**
 * Scribe Dashboard Component
 * Dedicated dashboard for scribe registration and volunteer management
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { studentService, scribeService, userService, statsService } from '@/lib/firestore-service'
import {
  Heart,
  Users,
  ArrowLeft,
  Mic,
  Volume2,
  Plus,
  CheckCircle,
  Star,
  Zap,
  Globe,
  UserCheck,
  Award,
  Clock,
  MapPin,
  LogOut
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import ScribeRegistration from './ScribeRegistration'
import DynamicScribeMatching from './DynamicScribeMatching'
import type { ScribeProfile, StudentProfile, ExamRegistration } from '@/types/scribe-system'

interface ScribeDashboardProps {
  enableVoiceSupport?: boolean
  userEmail?: string // Email of the logged-in user
}

export function ScribeDashboard({ enableVoiceSupport = true, userEmail }: ScribeDashboardProps) {
  const router = useRouter()
  const { logout } = useFirebaseAuth()
  const [currentView, setCurrentView] = useState<'dashboard' | 'registration' | 'matching'>('dashboard')
  const [registeredScribes, setRegisteredScribes] = useState<ScribeProfile[]>([])
  const [registeredStudents, setRegisteredStudents] = useState<StudentProfile[]>([])
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null)
  const [currentScribe, setCurrentScribe] = useState<ScribeProfile | null>(null)
  const [userType, setUserType] = useState<'student' | 'scribe' | 'unknown'>('unknown')
  const [selectedScribe, setSelectedScribe] = useState<ScribeProfile | null>(null)
  const [confirmedExam, setConfirmedExam] = useState<ExamRegistration | null>(null)
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalScribes: 0,
    verifiedScribes: 0,
    successfulMatches: 0,
    platformRating: 4.9
  })
  const [loading, setLoading] = useState(true)

  // Load user data and determine user type
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true)
      try {
        // Try to get user from localStorage first (for current session)
        const storedStudent = localStorage.getItem('currentStudent')
        const storedScribe = localStorage.getItem('currentScribe')
        
        if (storedStudent) {
          const studentData = JSON.parse(storedStudent)
          setCurrentStudent(studentData)
          setUserType('student')
        } else if (storedScribe) {
          const scribeData = JSON.parse(storedScribe)
          setCurrentScribe(scribeData)
          setUserType('scribe')
        } else if (userEmail) {
          // Try to find user by email in database
          const user = await userService.getUserByEmail(userEmail)
          if (user) {
            setUserType(user.type)
            if (user.type === 'student') {
              setCurrentStudent(user.profile as StudentProfile)
            } else {
              setCurrentScribe(user.profile as ScribeProfile)
            }
          }
        }

        // Load platform statistics
        const stats = await statsService.getPlatformStats()
        setPlatformStats(stats)

      } catch (error: any) {
        console.error('Error loading user data:', error)
        
        // Handle permission errors gracefully
        if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
          console.warn('⚠️  Firebase permissions not configured. Using local data only.')
          console.log('💡 Fix: Run "npm run firebase:deploy:rules" to deploy security rules.')
          console.log('📖 See FIREBASE_SETUP.md for detailed instructions.')
        }
        
        // App continues to work with localStorage data
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [userEmail])

  // Set up real-time listeners for data updates (only when authenticated)
  useEffect(() => {
    let unsubscribeStudents: (() => void) | undefined
    let unsubscribeScribes: (() => void) | undefined

    const setupListeners = () => {
      // Only set up listeners if we have user context (authenticated)
      if (userEmail || currentStudent || currentScribe) {
        try {
          // Listen for student updates (for scribes)
          if (currentScribe && userType === 'scribe') {
            unsubscribeStudents = studentService.onStudentsChange((students) => {
              setRegisteredStudents(students)
            }, userType)
          }

          // Listen for scribe updates (for students)
          if (currentStudent && userType === 'student') {
            unsubscribeScribes = scribeService.onScribesChange((scribes) => {
              setRegisteredScribes(scribes)
            }, userType)
          }
        } catch (error) {
          console.error('Error setting up listeners:', error)
          // Continue without listeners if permissions don't allow
        }
      }
    }

    setupListeners()

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeStudents) unsubscribeStudents()
      if (unsubscribeScribes) unsubscribeScribes()
    }
  }, [userEmail, currentStudent, currentScribe, userType])

  const handleScribeRegistration = async (profile: ScribeProfile) => {
    try {
      // Save to localStorage for immediate access
      localStorage.setItem('currentScribe', JSON.stringify(profile))
      
      // Update local state
      setCurrentScribe(profile)
      setUserType('scribe')
      
      if (enableVoiceSupport) {
        const utterance = new SpeechSynthesisUtterance(
          'Scribe registration completed successfully! Thank you for volunteering.'
        )
        window.speechSynthesis.speak(utterance)
      }

      // Return to dashboard view after successful registration
      setTimeout(() => {
        setCurrentView('dashboard')
      }, 1000)
    } catch (error) {
      console.error('Error handling scribe registration:', error)
    }
  }

  const handleStartMatching = () => {
    if (currentStudent) {
      setCurrentView('matching')
      speakText('Opening AI-powered scribe matching system')
    } else {
      speakText('Please register as a student first to access matching')
    }
  }

  const handleScribeSelected = (scribe: ScribeProfile, exam: ExamRegistration) => {
    setSelectedScribe(scribe)
    setConfirmedExam(exam)
    setCurrentView('dashboard')
    
    if (enableVoiceSupport) {
      const utterance = new SpeechSynthesisUtterance(
        `Excellent! ${scribe.personalInfo.name} has been selected as your scribe for ${exam.examDetails.examName}. Booking confirmed!`
      )
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleVoiceSupport = () => {
    if (enableVoiceSupport && window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      } else {
        const utterance = new SpeechSynthesisUtterance(
          'Voice support is enabled. You can use voice commands to navigate through the scribe dashboard.'
        )
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const speakText = (text: string) => {
    if (enableVoiceSupport && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (currentView === 'registration') {
    return (
      <div>
        <div className="max-w-4xl mx-auto p-6">
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <ScribeRegistration
          onRegistrationComplete={handleScribeRegistration}
          enableVoiceSupport={enableVoiceSupport}
        />
      </div>
    )
  }

  if (currentView === 'matching' && currentStudent) {
    return (
      <div>
        <div className="max-w-4xl mx-auto p-6">
          <Button
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <DynamicScribeMatching
          student={currentStudent}
          availableScribes={registeredScribes}
          onScribeSelected={handleScribeSelected}
          enableVoiceSupport={enableVoiceSupport}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Dashboard</h1>
            <p className="text-muted-foreground font-medium text-lg">Overview of registrations and platform activity</p>
          </div>
          <div className="flex gap-4">
            {/* Voice Support Controls */}
            {enableVoiceSupport && (
              <Button
                onClick={toggleVoiceSupport}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Voice Support
              </Button>
            )}
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="font-semibold"
            >
              ← Back to Home
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-semibold">Total Students</p>
                <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{platformStats.totalStudents}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 border-2 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 dark:text-green-200 font-semibold">Volunteer Scribes</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300">{platformStats.totalScribes}</p>
              </div>
              <Heart className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-6 border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-800 dark:text-purple-200 font-semibold">Verified Scribes</p>
                <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">{platformStats.verifiedScribes}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>

          <Card className="p-6 border-2 border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-semibold">Platform Rating</p>
                <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-300">{platformStats.platformRating}</p>
              </div>
              <Star className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Quick Actions for Students */}
        {currentStudent && (
          <Card className="mb-8 shadow-2xl border-4 border-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between text-white">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
                    🌟 Ready to Find Your Perfect Scribe? 🌟
                  </h3>
                  <p className="text-cyan-100 text-xl font-semibold drop-shadow-md bg-gradient-to-r from-blue-100 to-green-100 bg-clip-text text-transparent">
                    Use our AI-powered matching system to find the ideal scribe for your upcoming exam
                  </p>
                  <div className="flex items-center gap-2 text-yellow-200 font-bold">
                    <Star className="h-5 w-5 fill-yellow-300" />
                    <span>Powered by Advanced AI Technology</span>
                    <Star className="h-5 w-5 fill-yellow-300" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={handleStartMatching}
                    className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 font-bold text-xl px-10 py-4 rounded-xl shadow-2xl border-4 border-white transform hover:scale-110 transition-all duration-200"
                  >
                    <Zap className="h-6 w-6 mr-3 text-white drop-shadow-lg" />
                    ⚡ Find My Scribe ⚡
                  </Button>
                  {selectedScribe && confirmedExam && (
                    <div className="text-center bg-gradient-to-r from-green-400 to-blue-400 p-4 rounded-xl border-3 border-white shadow-lg">
                      <p className="text-white text-lg font-bold drop-shadow-md">✅ Booked: {selectedScribe.personalInfo.name}</p>
                      <p className="text-green-100 text-base font-semibold">{confirmedExam.examDetails.examName}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Section for New Users */}
        {userType === 'unknown' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                Get Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Join our community and help students with disabilities succeed in their exams
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => {
                      setCurrentView('registration')
                      speakText('Opening scribe registration form')
                    }}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register as Volunteer Scribe
                  </Button>
                  <Button
                    onClick={() => router.push('/auth')}
                    size="lg"
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Register as Student
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Profile Section for Current Student */}
        {userType === 'student' && currentStudent && (
          <Card className="mb-8 border-2 border-blue-500 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Your Profile - {currentStudent.personalInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Personal Information</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Email: {currentStudent.personalInfo.email}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Phone: {currentStudent.personalInfo.phone}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Location: {currentStudent.location.city}, {currentStudent.location.state}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Academic Details</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Institution: {currentStudent.academic.institution}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Course: {currentStudent.academic.course}</p>
                  <div className="flex gap-1 mt-2">
                    {currentStudent.academic.preferredSubjects.slice(0, 3).map(subject => (
                      <Badge key={subject} variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Profile Section for Current Scribe */}
        {userType === 'scribe' && currentScribe && (
          <Card className="mb-8 border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                Your Volunteer Profile - {currentScribe.personalInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Personal Information</h4>
                  <p className="text-sm text-green-700">Email: {currentScribe.personalInfo.email}</p>
                  <p className="text-sm text-green-700">Phone: {currentScribe.personalInfo.phone}</p>
                  <p className="text-sm text-green-700">Location: {currentScribe.location.city}, {currentScribe.location.state}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Qualifications</h4>
                  <p className="text-sm text-green-700">Institution: {currentScribe.qualifications.institution}</p>
                  <p className="text-sm text-green-700">Degree: {currentScribe.qualifications.degree}</p>
                  <div className="flex gap-1 mt-2">
                    {currentScribe.qualifications.languagesKnown.slice(0, 3).map(lang => (
                      <Badge key={lang} variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Registrations - Role-based display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Students section - only visible to scribes/volunteers */}
          {(userType === 'scribe' || userType === 'unknown') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students Seeking Scribes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {registeredStudents.length === 0 ? (
                  <p className="text-purple-600 text-center py-4">No students registered yet</p>
                ) : (
                  <div className="space-y-4">
                    {registeredStudents.slice(-3).map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student.personalInfo.name}</p>
                          <p className="text-sm text-blue-700">{student.academic.institution}</p>
                          <div className="flex gap-1 mt-1">
                            {student.academic.preferredSubjects.slice(0, 2).map(subject => (
                              <Badge key={subject} variant="outline" className="text-xs">{subject}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-700">{student.location.city}</p>
                          <Badge variant="secondary">Seeking Scribe</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scribes section - visible to everyone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {userType === 'student' ? 'Available Scribes' : 'Recent Volunteer Registrations'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registeredScribes.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No volunteers registered yet</p>
                  <p className="text-muted-foreground text-sm">
                    Be the first to register and start making a difference!
                  </p>
                  {userType !== 'student' && (
                    <Button
                      onClick={() => {
                        setCurrentView('registration')
                        speakText('Opening scribe registration form')
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {registeredScribes.slice(-3).map((scribe, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{scribe.personalInfo.name}</p>
                        <p className="text-sm text-blue-700">{scribe.qualifications.institution}</p>
                        <div className="flex gap-1 mt-1">
                          {scribe.qualifications.languagesKnown.slice(0, 2).map(lang => (
                            <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-700">{scribe.location.city}</p>
                        <Badge variant="secondary">
                          {userType === 'student' ? 'Available' : 'Under Review'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Matching Simulation */}
        {platformStats.totalStudents > 0 && platformStats.totalScribes > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Matching Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Potential Matches Available!</h3>
                  <p className="text-blue-700">
                    AI has identified {Math.min(platformStats.totalStudents * 2, platformStats.totalScribes * 3)} potential matches across the platform
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-sm text-blue-700">Location Compatibility</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-blue-700">Subject Match Rate</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-blue-700">Schedule Alignment</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/scribe-matching')}
            variant="outline"
            className="mr-4"
          >
            View Full Matching System
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ScribeDashboard
