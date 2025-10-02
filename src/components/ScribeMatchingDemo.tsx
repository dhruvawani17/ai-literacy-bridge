/**
 * Demo Application for Scribe Matching System
 * Comprehensive demonstration of the accessibility platform
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Heart,
  BookOpen,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
  Volume2,
  Eye,
  Clock,
  Award,
  Zap,
  Globe,
  UserCheck
} from 'lucide-react'
import StudentRegistration from './StudentRegistration'
import ScribeRegistration from './ScribeRegistration'
import DynamicScribeMatching from './DynamicScribeMatching'
import ChatPage from '../app/chat/page';
import type { StudentProfile, ScribeProfile, ExamRegistration } from '@/types/scribe-system'

type ViewMode = 'home' | 'student-registration' | 'scribe-registration' | 'dashboard' | 'matching' | 'chat'

interface DashboardViewProps {
  onNavigate: (view: ViewMode) => void
  studentCount: number
  scribeCount: number
}

function DashboardView({ onNavigate, studentCount, scribeCount }: DashboardViewProps) {
  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Platform Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of registered users and matching system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registered Students</p>
                  <p className="text-2xl font-bold">{studentCount}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registered Scribes</p>
                  <p className="text-2xl font-bold">{scribeCount}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful Matches</p>
                  <p className="text-2xl font-bold">{Math.min(studentCount, scribeCount)}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => onNavigate('student-registration')}
                className="w-full"
              >
                Register New Student
              </Button>
              <Button 
                onClick={() => onNavigate('scribe-registration')}
                variant="outline"
                className="w-full"
              >
                Register New Scribe
              </Button>
              <Button 
                onClick={() => onNavigate('matching')}
                variant="outline"
                className="w-full"
              >
                Start Matching Process
              </Button>
              <Button 
                onClick={() => onNavigate('chat')}
                variant="outline"
                className="w-full"
              >
                Open Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {studentCount > 0 || scribeCount > 0 
                  ? `Platform has ${studentCount + scribeCount} active users.`
                  : 'No recent activity. Start by registering users!'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ScribeMatchingDemo() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ViewMode>('home')
  const [registeredStudents, setRegisteredStudents] = useState<StudentProfile[]>([])
  const [registeredScribes, setRegisteredScribes] = useState<ScribeProfile[]>([
    // Sample scribes for demo
    {
      id: 'scribe_demo_001',
      userId: 'user_scribe_001',
      personalInfo: {
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 98765 43210',
        dateOfBirth: '1995-06-15',
        gender: 'female',
        emergencyContact: {
          name: 'Raj Sharma',
          phone: '+91 98765 43211',
          relation: 'Spouse'
        }
      },
      qualifications: {
        education: 'M.Sc. Mathematics',
        degree: 'Masters',
        institution: 'Mumbai University',
        graduationYear: 2018,
        subjects: ['mathematics', 'science'],
        languagesKnown: ['hindi', 'english', 'marathi'],
        specializations: ['Mathematics', 'Physics']
      },
      experience: {
        totalYears: 3,
        examTypes: ['board', 'university'],
        totalExamsScribed: 45,
        successfulExams: 43,
        averageRating: 4.8,
        testimonials: ['Excellent scribe', 'Very patient and accurate']
      },
      availability: {
        daysAvailable: ['monday', 'wednesday', 'friday', 'saturday'],
        timeSlots: [
          {
            id: 'slot_001',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: true
          }
        ],
        maxDistanceWilling: 25,
        examTypesWilling: ['board', 'university'],
        blackoutDates: []
      },
      location: {
        id: 'loc_mumbai_001',
        address: 'Bandra West, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        latitude: 19.0596,
        longitude: 72.8295
      },
      verification: {
        isVerified: true,
        verificationDate: '2024-01-15',
        backgroundCheck: true,
        documents: ['id_proof.pdf', 'education_cert.pdf'],
        references: [
          {
            id: 'ref_001',
            name: 'Dr. Anil Kumar',
            phone: '+91 98765 11111',
            email: 'anil.kumar@university.edu',
            relation: 'Professor',
            institution: 'Mumbai University',
            isVerified: true,
            feedback: 'Excellent candidate'
          }
        ]
      },
      ratings: [
        {
          id: 'rating_001',
          studentId: 'student_001',
          scribeId: 'scribe_demo_001',
          examId: 'exam_001',
          rating: 5,
          feedback: {
            punctuality: 5,
            clarity: 5,
            patience: 5,
            knowledge: 4,
            overall: 5
          },
          comments: 'Excellent scribe, very patient and accurate',
          wouldRecommend: true,
          anonymous: false,
          submittedAt: '2024-03-15T00:00:00Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    },
    {
      id: 'scribe_demo_002',
      userId: 'user_scribe_002',
      personalInfo: {
        name: 'Arjun Patel',
        email: 'arjun.patel@email.com',
        phone: '+91 98765 43220',
        dateOfBirth: '1992-03-22',
        gender: 'male',
        emergencyContact: {
          name: 'Kavya Patel',
          phone: '+91 98765 43221',
          relation: 'Wife'
        }
      },
      qualifications: {
        education: 'MBA Finance',
        degree: 'Masters',
        institution: 'Delhi School of Economics',
        graduationYear: 2016,
        subjects: ['commerce', 'english'],
        languagesKnown: ['hindi', 'english', 'gujarati'],
        specializations: ['Economics', 'Business Studies']
      },
      experience: {
        totalYears: 5,
        examTypes: ['competitive', 'university'],
        totalExamsScribed: 78,
        successfulExams: 76,
        averageRating: 4.9,
        testimonials: ['Outstanding support', 'Very professional']
      },
      availability: {
        daysAvailable: ['tuesday', 'thursday', 'saturday', 'sunday'],
        timeSlots: [
          {
            id: 'slot_002',
            dayOfWeek: 2,
            startTime: '08:00',
            endTime: '18:00',
            isRecurring: true
          }
        ],
        maxDistanceWilling: 30,
        examTypesWilling: ['competitive', 'university'],
        blackoutDates: []
      },
      location: {
        id: 'loc_delhi_001',
        address: 'Connaught Place, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        latitude: 28.6315,
        longitude: 77.2167
      },
      verification: {
        isVerified: true,
        verificationDate: '2024-01-10',
        backgroundCheck: true,
        documents: ['id_proof.pdf', 'education_cert.pdf'],
        references: [
          {
            id: 'ref_002',
            name: 'Prof. Meera Singh',
            phone: '+91 98765 22222',
            email: 'meera.singh@dse.edu',
            relation: 'Professor',
            institution: 'Delhi School of Economics',
            isVerified: true,
            feedback: 'Highly recommended'
          }
        ]
      },
      ratings: [
        {
          id: 'rating_002',
          studentId: 'student_002',
          scribeId: 'scribe_demo_002',
          examId: 'exam_002',
          rating: 5,
          feedback: {
            punctuality: 5,
            clarity: 5,
            patience: 4,
            knowledge: 5,
            overall: 5
          },
          comments: 'Outstanding support during CA exams',
          wouldRecommend: true,
          anonymous: false,
          submittedAt: '2024-03-20T00:00:00Z'
        }
      ],
      createdAt: '2023-12-15T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z'
    }
  ])
  const [enableVoiceSupport, setEnableVoiceSupport] = useState(true)
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null)
  const [selectedScribe, setSelectedScribe] = useState<ScribeProfile | null>(null)
  const [confirmedExam, setConfirmedExam] = useState<ExamRegistration | null>(null)

  const handleStudentRegistration = async (profile: StudentProfile) => {
    setRegisteredStudents(prev => [...prev, profile])
    setCurrentStudent(profile)
    
    if (enableVoiceSupport) {
      const utterance = new SpeechSynthesisUtterance(
        'Student registration completed successfully! Redirecting you to your personalized dashboard.'
      )
      window.speechSynthesis.speak(utterance)
    }

    // Show success message briefly then redirect to dashboard
    setTimeout(() => {
      setCurrentView('dashboard')
      // Navigate to dedicated scribe dashboard route
      router.push('/scribe-dashboard')
    }, 1000) // Shorter delay since success screen already shows countdown
  }

  const handleScribeRegistration = async (profile: ScribeProfile) => {
    setRegisteredScribes(prev => [...prev, profile])
    
    if (enableVoiceSupport) {
      const utterance = new SpeechSynthesisUtterance(
        'Scribe registration completed successfully! Thank you for volunteering. Redirecting to verification status.'
      )
      window.speechSynthesis.speak(utterance)
    }

    // Show success message briefly then redirect to dashboard
    setTimeout(() => {
      setCurrentView('dashboard')
      // Navigate to dedicated scribe dashboard route
      router.push('/scribe-dashboard')
    }, 1000) // Shorter delay since success screen already shows countdown
    
    if (enableVoiceSupport) {
      const utterance = new SpeechSynthesisUtterance(
        'Scribe registration completed successfully! Thank you for volunteering. Your application will be reviewed and you will be contacted soon.'
      )
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleStartMatching = () => {
    if (currentStudent) {
      setCurrentView('matching')
      if (enableVoiceSupport) {
        const utterance = new SpeechSynthesisUtterance(
          'Starting scribe matching. Please provide your exam details to find the perfect scribe for your needs.'
        )
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  const handleScribeSelected = (scribe: ScribeProfile, exam: ExamRegistration) => {
    setSelectedScribe(scribe)
    setConfirmedExam(exam)
    setCurrentView('dashboard')
    
    if (enableVoiceSupport) {
      const utterance = new SpeechSynthesisUtterance(
        `Excellent! You have successfully booked ${scribe.personalInfo.name} as your scribe for the ${exam.examDetails.examName} exam. You will receive confirmation details shortly.`
      )
      window.speechSynthesis.speak(utterance)
    }
  }

  const renderHomeView = () => (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-10 md:mb-12">
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Eye className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600" />
            <Heart className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-500" />
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent leading-tight">
            ScribeConnect
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-800 font-bold mt-3 sm:mt-4 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0">
            AI-Powered Scribe Matching Platform for Blind & Visually Impaired Students
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-7 md:mb-8">
          <Card className="p-4 sm:p-5 md:p-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all">
            <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-700 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-blue-900">Smart Matching</h3>
            <p className="text-sm sm:text-base text-blue-800 font-medium leading-relaxed">AI-powered algorithm matches students with ideal scribes based on location, subjects, and preferences</p>
          </Card>
          
          <Card className="p-4 sm:p-5 md:p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-700 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-green-900">Verified Scribes</h3>
            <p className="text-sm sm:text-base text-green-800 font-medium leading-relaxed">All scribes undergo background checks, training, and verification for safe, reliable assistance</p>
          </Card>
          
          <Card className="p-4 sm:p-5 md:p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
            <Volume2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-purple-700 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-purple-900">Voice Accessible</h3>
            <p className="text-sm sm:text-base text-purple-800 font-medium leading-relaxed">Complete voice support and screen reader compatibility for seamless accessibility</p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0">
          <Button
            onClick={() => setCurrentView('student-registration')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto min-h-[48px] sm:min-h-[56px]"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Register as Student
          </Button>
          
          <Button
            onClick={() => setCurrentView('scribe-registration')}
            size="lg"
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto min-h-[48px] sm:min-h-[56px]"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Volunteer as Scribe
          </Button>
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-4 px-2 sm:px-0">
          <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
            <input
              type="checkbox"
              checked={enableVoiceSupport}
              onChange={(e) => setEnableVoiceSupport(e.target.checked)}
              className="rounded w-4 h-4 sm:w-5 sm:h-5"
            />
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-black font-semibold">Enable Voice Support</span>
          </label>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-green-700 rounded-xl text-white p-4 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12 shadow-2xl mx-2 sm:mx-0">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-white">Making Education Accessible</h2>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium">Empowering students with disabilities through volunteer support</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{registeredStudents.length}</div>
            <div className="text-blue-100 font-semibold text-xs sm:text-sm md:text-base">Students Registered</div>
          </div>
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{registeredScribes.length}</div>
            <div className="text-blue-100 font-semibold text-xs sm:text-sm md:text-base">Volunteer Scribes</div>
          </div>
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">100%</div>
            <div className="text-blue-100 font-semibold text-xs sm:text-sm md:text-base">Voice Accessible</div>
          </div>
          <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">24/7</div>
            <div className="text-blue-100 font-semibold text-xs sm:text-sm md:text-base">Support Available</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
        <Card className="p-4 sm:p-5 md:p-6 border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-700 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-yellow-900">Instant Matching</h3>
          </div>
          <p className="text-sm sm:text-base text-yellow-800 font-medium leading-relaxed">
            Advanced AI algorithms provide instant matches based on 15+ factors including location, subjects, language preferences, and availability.
          </p>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <MapPin className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-700 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-blue-900">Location-Based</h3>
          </div>
          <p className="text-sm sm:text-base text-blue-800 font-medium leading-relaxed">
            Smart location matching ensures scribes are within comfortable travel distance, with options for remote assistance via video calls.
          </p>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Star className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-700 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-purple-900">Quality Assurance</h3>
          </div>
          <p className="text-sm sm:text-base text-purple-800 font-medium leading-relaxed">
            Comprehensive rating system, regular feedback collection, and continuous training ensure high-quality scribe services.
          </p>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-700 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-green-900">Flexible Scheduling</h3>
          </div>
          <p className="text-sm sm:text-base text-green-800 font-medium leading-relaxed">
            Advanced scheduling system accommodates exam timetables, scribe availability, and emergency backup arrangements.
          </p>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Globe className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-indigo-700 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-indigo-900">Multi-Language</h3>
          </div>
          <p className="text-sm sm:text-base text-indigo-800 font-medium leading-relaxed">
            Support for 10+ languages including English, Hindi, Tamil, Telugu, and other regional languages for comfortable communication.
          </p>
        </Card>

        <Card className="p-4 sm:p-5 md:p-6 border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Award className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-700 flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold text-orange-900">Certified Training</h3>
          </div>
          <p className="text-sm sm:text-base text-orange-800 font-medium leading-relaxed">
            All scribes complete mandatory training modules on disability awareness, communication skills, and exam procedures.
          </p>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 sm:p-6 md:p-8 border-2 border-gray-300 shadow-lg mx-2 sm:mx-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-purple-800">Ready to Get Started?</h2>
        <p className="text-blue-800 font-bold mb-4 sm:mb-6 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-2 sm:px-0">
          Join thousands of students and scribes who have already transformed their academic journey
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2 sm:px-0">
          <Button
            onClick={() => setCurrentView('student-registration')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto min-h-[48px] sm:min-h-[56px]"
          >
            Start Student Registration
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Button>
          <Button
            onClick={() => setCurrentView('scribe-registration')}
            variant="outline"
            className="border-2 border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto min-h-[48px] sm:min-h-[56px]"
          >
            Become a Volunteer Scribe
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Platform Dashboard</h1>
          <p className="text-blue-800 font-medium text-lg">Overview of registrations and platform activity</p>
        </div>
        <Button
          onClick={() => setCurrentView('home')}
          variant="outline"
          className="border-2 border-gray-600 text-black hover:bg-gray-100 font-semibold"
        >
          ← Back to Home
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 font-semibold">Total Students</p>
              <p className="text-4xl font-bold text-blue-700">{registeredStudents.length}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-semibold">Volunteer Scribes</p>
              <p className="text-4xl font-bold text-green-700">{registeredScribes.length}</p>
            </div>
            <Heart className="h-12 w-12 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 font-semibold">Successful Matches</p>
              <p className="text-4xl font-bold text-purple-700">
                {Math.min(registeredStudents.length, registeredScribes.length)}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-semibold">Platform Rating</p>
              <p className="text-4xl font-bold text-yellow-700">4.9</p>
            </div>
            <Star className="h-12 w-12 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Student Registrations
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
                      <Badge variant="secondary">Pending Verification</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Scribe Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registeredScribes.length === 0 ? (
              <p className="text-purple-600 text-center py-4">No scribes registered yet</p>
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
                      <Badge variant="secondary">Under Review</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {registeredStudents.length > 0 && registeredScribes.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Matching Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold mb-2">Potential Matches Found!</h3>
                <p className="text-blue-700">
                  AI has identified {Math.min(registeredStudents.length * 2, registeredScribes.length * 3)} potential matches
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-blue-700">Location Compatibility</div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-blue-700">Subject Match</div>
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
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHomeView()
      case 'student-registration':
        return <StudentRegistration onRegistrationComplete={handleStudentRegistration} />
      case 'scribe-registration':
        return <ScribeRegistration onRegistrationComplete={handleScribeRegistration} />
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setCurrentView}
            studentCount={registeredStudents.length}
            scribeCount={registeredScribes.length}
          />
        )
      case 'matching':
        return currentStudent ? (
          <DynamicScribeMatching
            student={currentStudent}
            availableScribes={registeredScribes}
            onScribeSelected={handleScribeSelected}
          />
        ) : (
          <div className="min-h-screen p-6 bg-background">
            <div className="text-center">
              <p className="text-lg">No student selected for matching.</p>
              <Button onClick={() => setCurrentView('dashboard')}>Back to Dashboard</Button>
            </div>
          </div>
        )
      case 'chat':
        return <ChatPage />
      default:
        return renderHomeView()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'home' && renderHomeView()}
      {currentView === 'student-registration' && (
        <div>
          <div className="max-w-4xl mx-auto p-6">
            <Button
              onClick={() => setCurrentView('home')}
              variant="outline"
              className="mb-6 text-black font-semibold"
            >
              ← Back to Home
            </Button>
          </div>
          <StudentRegistration
            onRegistrationComplete={handleStudentRegistration}
            enableVoiceSupport={enableVoiceSupport}
          />
        </div>
      )}
      {currentView === 'scribe-registration' && (
        <div>
          <div className="max-w-4xl mx-auto p-6">
            <Button
              onClick={() => setCurrentView('home')}
              variant="outline"
              className="mb-6 text-black font-semibold"
            >
              ← Back to Home
            </Button>
          </div>
          <ScribeRegistration
            onRegistrationComplete={handleScribeRegistration}
            enableVoiceSupport={enableVoiceSupport}
          />
        </div>
      )}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'matching' && currentStudent && (
        <div>
          <div className="max-w-4xl mx-auto p-6">
            <Button
              onClick={() => setCurrentView('dashboard')}
              variant="outline"
              className="mb-6"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <DynamicScribeMatching
            student={currentStudent}
            availableScribes={registeredScribes}
            onScribeSelected={handleScribeSelected}
            enableVoiceSupport={enableVoiceSupport}
          />
        </div>
      )}
      {currentView === 'chat' && (
        <div>
          <div className="max-w-4xl mx-auto p-6">
            <Button
              onClick={() => setCurrentView('dashboard')}
              variant="outline"
              className="mb-6"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <ChatPage />
        </div>
      )}
    </div>
  )
}

export default ScribeMatchingDemo