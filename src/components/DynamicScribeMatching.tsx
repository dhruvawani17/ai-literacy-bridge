/**
 * Dynamic Scribe Matching System
 * Real-time matching with availability, distance, and advanced filtering
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  User,
  BookOpen,
  Languages,
  Calendar,
  Filter,
  Search,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Video,
  Car,
  Heart,
  Award,
  ShieldCheck,
  Volume2,
  Eye,
  Timer,
  Compass
} from 'lucide-react'
import type { StudentProfile, ScribeProfile, ExamRegistration } from '@/types/scribe-system'
import { ScribeMatchingEngine } from '@/lib/scribe-matching-engine'

interface DynamicScribeMatchingProps {
  student: StudentProfile
  availableScribes: ScribeProfile[]
  onScribeSelected: (scribe: ScribeProfile, exam: ExamRegistration) => void
  enableVoiceSupport?: boolean
}

interface MatchResult {
  scribe: ScribeProfile
  score: number
  distance: number
  matchFactors: {
    subjectMatch: number
    languageMatch: number
    experienceMatch: number
    availabilityMatch: number
    locationMatch: number
    ratingMatch: number
  }
  estimatedTravelTime: number
  isAvailable: boolean
  nextAvailable?: string
}

interface FilterOptions {
  maxDistance: number
  minRating: number
  subjectFilter: string[]
  languageFilter: string[]
  availabilityFilter: string
  experienceLevel: string
  genderPreference: string
  remoteCapable: boolean
}

export function DynamicScribeMatching({ 
  student, 
  availableScribes, 
  onScribeSelected,
  enableVoiceSupport = true 
}: DynamicScribeMatchingProps) {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [filteredMatches, setFilteredMatches] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScribe, setSelectedScribe] = useState<ScribeProfile | null>(null)
  const [examDetails, setExamDetails] = useState({
    subject: '',
    date: '',
    time: '',
    duration: 180, // minutes
    venue: '',
    examType: 'written',
    specialRequirements: ''
  })
  
  const [filters, setFilters] = useState<FilterOptions>({
    maxDistance: student.preferences.maxTravelDistance || 25,
    minRating: 3.0,
    subjectFilter: [],
    languageFilter: [],
    availabilityFilter: 'any',
    experienceLevel: 'any',
    genderPreference: student.preferences.scribeGender || 'any',
    remoteCapable: false
  })

  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'rating' | 'experience'>('score')
  const [isRealTimeUpdating, setIsRealTimeUpdating] = useState(true)

  const matchingEngine = new ScribeMatchingEngine()

  // Real-time matching function
  const performMatching = useCallback(async () => {
    if (!availableScribes.length) return

    setIsLoading(true)
    
    try {
      const matchResults: MatchResult[] = []
      
      for (const scribe of availableScribes) {
        // Create mock exam registration for matching
        const mockExam: ExamRegistration = {
          id: `temp_exam_${Date.now()}`,
          studentId: student.id,
          examDetails: {
            examName: examDetails.subject,
            examType: examDetails.examType as any,
            subjects: [examDetails.subject as any],
            language: student.academic.languagePreference[0] as any,
            date: examDetails.date,
            startTime: examDetails.time,
            endTime: '', // Will be calculated
            duration: examDetails.duration,
            location: student.location,
            examCenterId: 'temp',
          },
          requirements: {
            scribeNeeded: true,
            readerNeeded: false,
            extraTime: 0,
            largeFont: true,
            separateRoom: false,
            computerNeeded: false,
            specialInstructions: examDetails.specialRequirements
          },
          status: 'pending',
          matchHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Calculate comprehensive match score
        const result = await matchingEngine.findMatches(student, mockExam, [scribe])

        if (!result.success || result.matches.length === 0) continue

        const scribeMatch = result.matches[0]

        // Calculate detailed match factors
        const subjectMatch = calculateSubjectMatch(student.academic.preferredSubjects, scribe.qualifications.subjects)
        const languageMatch = calculateLanguageMatch(student.academic.languagePreference, scribe.qualifications.languagesKnown)
        const experienceMatch = calculateExperienceMatch(scribe.experience.totalYears)
        const distance = calculateDistance(student.location, scribe.location)
        const locationMatch = Math.max(0, 100 - (distance / filters.maxDistance) * 100)
        const ratingMatch = calculateRatingMatch(scribe.ratings)
        const availabilityMatch = await checkAvailability(scribe, examDetails.date, examDetails.time)

        // Check if scribe is currently available
        const isAvailable = await isScribeAvailable(scribe, examDetails.date, examDetails.time)
        const nextAvailable = isAvailable ? undefined : await getNextAvailableSlot(scribe)

        matchResults.push({
          scribe,
          score: scribeMatch.matchScore,
          distance,
          matchFactors: {
            subjectMatch,
            languageMatch,
            experienceMatch,
            availabilityMatch,
            locationMatch,
            ratingMatch
          },
          estimatedTravelTime: calculateTravelTime(distance),
          isAvailable,
          nextAvailable
        })
      }

      // Sort results
      const sortedResults = matchResults.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return a.distance - b.distance
          case 'rating':
            return (getAverageRating(b.scribe.ratings) || 0) - (getAverageRating(a.scribe.ratings) || 0)
          case 'experience':
            return b.scribe.experience.totalYears - a.scribe.experience.totalYears
          default:
            return b.score - a.score
        }
      })

      setMatches(sortedResults)
      
      // Announce results if voice support is enabled
      if (enableVoiceSupport && sortedResults.length > 0) {
        const announcement = `Found ${sortedResults.length} matching scribes. Top match: ${sortedResults[0].scribe.personalInfo.name} with ${Math.round(sortedResults[0].score)}% compatibility.`
        speakText(announcement)
      }
      
    } catch (error) {
      console.error('Matching error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [student, availableScribes, filters, examDetails, sortBy, enableVoiceSupport])

  // Filter matches based on criteria
  useEffect(() => {
    let filtered = matches.filter(match => {
      // Distance filter
      if (match.distance > filters.maxDistance) return false
      
      // Rating filter
      const rating = getAverageRating(match.scribe.ratings) || 0
      if (rating < filters.minRating) return false
      
      // Subject filter
      if (filters.subjectFilter.length > 0) {
        const hasSubject = filters.subjectFilter.some(subject => 
          match.scribe.qualifications.subjects.includes(subject as any)
        )
        if (!hasSubject) return false
      }
      
      // Language filter
      if (filters.languageFilter.length > 0) {
        const hasLanguage = filters.languageFilter.some(lang => 
          match.scribe.qualifications.languagesKnown.includes(lang as any)
        )
        if (!hasLanguage) return false
      }
      
      // Availability filter
      if (filters.availabilityFilter === 'available_now' && !match.isAvailable) return false
      
      // Experience filter
      if (filters.experienceLevel !== 'any') {
        const years = match.scribe.experience.totalYears
        switch (filters.experienceLevel) {
          case 'beginner':
            if (years > 2) return false
            break
          case 'intermediate':
            if (years < 1 || years > 5) return false
            break
          case 'expert':
            if (years < 5) return false
            break
        }
      }
      
      // Gender preference
      if (filters.genderPreference !== 'any' && 
          match.scribe.personalInfo.gender !== filters.genderPreference) return false
      
      // Remote capability
      if (filters.remoteCapable && !canProvideRemoteService(match.scribe)) return false
      
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = match.scribe.personalInfo.name.toLowerCase().includes(searchLower)
        const subjectMatch = match.scribe.qualifications.subjects.some(s => 
          s.toLowerCase().includes(searchLower)
        )
        const langMatch = match.scribe.qualifications.languagesKnown.some(l => 
          l.toLowerCase().includes(searchLower)
        )
        if (!nameMatch && !subjectMatch && !langMatch) return false
      }
      
      return true
    })
    
    setFilteredMatches(filtered)
  }, [matches, filters, searchTerm])

  // Real-time updates
  useEffect(() => {
    if (isRealTimeUpdating) {
      performMatching()
      const interval = setInterval(performMatching, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [performMatching, isRealTimeUpdating])

  // Helper functions
  const calculateSubjectMatch = (studentSubjects: string[], scribeSubjects: string[]): number => {
    const intersection = studentSubjects.filter(s => scribeSubjects.includes(s))
    return studentSubjects.length > 0 ? (intersection.length / studentSubjects.length) * 100 : 0
  }

  const calculateLanguageMatch = (studentLangs: string[], scribeLangs: string[]): number => {
    const intersection = studentLangs.filter(l => scribeLangs.includes(l))
    return studentLangs.length > 0 ? (intersection.length / studentLangs.length) * 100 : 0
  }

  const calculateExperienceMatch = (years: number): number => {
    if (years >= 5) return 100
    if (years >= 3) return 80
    if (years >= 1) return 60
    return 40
  }

  const calculateDistance = (loc1: any, loc2: any): number => {
    // Haversine formula for distance calculation
    const R = 6371 // Earth's radius in km
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const calculateTravelTime = (distance: number): number => {
    // Estimate 30 km/h average speed in Indian cities
    return Math.round((distance / 30) * 60) // minutes
  }

  const calculateRatingMatch = (ratings: any[]): number => {
    const avgRating = getAverageRating(ratings) || 0
    return (avgRating / 5) * 100
  }

  const getAverageRating = (ratings: any[]): number => {
    if (!ratings || ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return sum / ratings.length
  }

  const checkAvailability = async (scribe: ScribeProfile, date: string, time: string): Promise<number> => {
    // Mock availability check - in real implementation, check against calendar
    return Math.random() > 0.3 ? 100 : 0
  }

  const isScribeAvailable = async (scribe: ScribeProfile, date: string, time: string): Promise<boolean> => {
    // Mock availability - in real implementation, check real-time availability
    return Math.random() > 0.3
  }

  const getNextAvailableSlot = async (scribe: ScribeProfile): Promise<string> => {
    // Mock next available slot
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const canProvideRemoteService = (scribe: ScribeProfile): boolean => {
    // Check if scribe can provide remote services
    return scribe.availability.daysAvailable.length > 0 // Mock check
  }

  const speakText = (text: string) => {
    if (!enableVoiceSupport || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.volume = 0.8
    window.speechSynthesis.speak(utterance)
  }

  const handleScribeSelect = (scribe: ScribeProfile) => {
    setSelectedScribe(scribe)
    if (enableVoiceSupport) {
      speakText(`Selected ${scribe.personalInfo.name}. Please confirm exam details to proceed with booking.`)
    }
  }

  const handleBookScribe = () => {
    if (!selectedScribe || !examDetails.subject || !examDetails.date) return
    
    const exam: ExamRegistration = {
      id: `exam_${Date.now()}`,
      studentId: student.id,
      examDetails: {
        examName: examDetails.subject,
        examType: examDetails.examType as any,
        subjects: [examDetails.subject as any],
        language: student.academic.languagePreference[0] as any,
        date: examDetails.date,
        startTime: examDetails.time,
        endTime: '', // Will be calculated based on duration
        duration: examDetails.duration,
        location: {
          id: 'temp_location',
          address: examDetails.venue || student.location.address,
          city: student.location.city,
          state: student.location.state,
          pincode: student.location.pincode,
          latitude: student.location.latitude,
          longitude: student.location.longitude
        },
        examCenterId: 'temp'
      },
      requirements: {
        scribeNeeded: true,
        readerNeeded: false,
        extraTime: 0,
        largeFont: true,
        separateRoom: false,
        computerNeeded: false,
        specialInstructions: examDetails.specialRequirements
      },
      status: 'pending',
      matchHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    onScribeSelected(selectedScribe, exam)
    
    if (enableVoiceSupport) {
      speakText(`Booking confirmed with ${selectedScribe.personalInfo.name}. You will receive confirmation details shortly.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
            Find Your Perfect Scribe
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-800 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0">
            AI-powered matching finds the ideal scribe for your exam needs in real-time
          </p>
          
          {enableVoiceSupport && (
            <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm sm:text-base">
              <Volume2 className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Voice Navigation Active</span>
            </div>
          )}
        </div>

        {/* Exam Details Input */}
        <Card className="mb-6 sm:mb-8 shadow-lg border-0 bg-white mx-2 sm:mx-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="subject" className="text-blue-800 font-semibold text-sm sm:text-base">Subject *</Label>
                <Select onValueChange={(value: string) => setExamDetails(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {student.academic.preferredSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date" className="text-blue-800 font-semibold text-sm sm:text-base">Exam Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={examDetails.date}
                  onChange={(e) => setExamDetails(prev => ({ ...prev, date: e.target.value }))}
                  className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="time" className="text-blue-800 font-semibold text-sm sm:text-base">Start Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={examDetails.time}
                  onChange={(e) => setExamDetails(prev => ({ ...prev, time: e.target.value }))}
                  className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11"
                />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="duration" className="text-blue-800 font-semibold text-sm sm:text-base">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examDetails.duration}
                  onChange={(e) => setExamDetails(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11"
                  placeholder="180"
                />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="venue" className="text-blue-800 font-semibold text-sm sm:text-base">Venue</Label>
                <Input
                  id="venue"
                  value={examDetails.venue}
                  onChange={(e) => setExamDetails(prev => ({ ...prev, venue: e.target.value }))}
                  className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11"
                  placeholder="Exam center address"
                />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="examType" className="text-blue-800 font-semibold text-sm sm:text-base">Exam Type</Label>
                <Select onValueChange={(value: string) => setExamDetails(prev => ({ ...prev, examType: value }))}>
                  <SelectTrigger className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11">
                    <SelectValue placeholder="Written" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="written">Written</SelectItem>
                    <SelectItem value="oral">Oral</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="computer_based">Computer Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6">
              <Label htmlFor="requirements" className="text-blue-800 font-semibold text-sm sm:text-base">Special Requirements</Label>
              <Input
                id="requirements"
                value={examDetails.specialRequirements}
                onChange={(e) => setExamDetails(prev => ({ ...prev, specialRequirements: e.target.value }))}
                className="border-gray-300 mt-1 sm:mt-2 h-10 sm:h-11"
                placeholder="Any special accommodations or instructions"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <Card className="shadow-lg border-0 bg-white xl:sticky xl:top-6 mx-2 sm:mx-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-t-lg p-4 sm:p-6 shadow-lg">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold">
                  <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300 flex-shrink-0" />
                  <span className="text-sm sm:text-base">🔍 Smart Filters 🔍</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-purple-50 to-blue-50">
                {/* Search */}
                <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-3 sm:p-4 rounded-xl border-2 sm:border-3 border-cyan-400 shadow-lg">
                  <Label className="text-blue-900 font-bold text-base sm:text-lg flex items-center gap-2">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base">🔎 Search Scribes</span>
                  </Label>
                  <div className="relative mt-2 sm:mt-3">
                    <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Name, subject, language..."
                      className="pl-10 sm:pl-12 border-2 sm:border-3 border-cyan-500 bg-gradient-to-r from-white to-cyan-50 text-cyan-900 font-semibold text-sm sm:text-base h-10 sm:h-12 rounded-lg shadow-md focus:border-blue-600 focus:ring-2 sm:focus:ring-4 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 sm:p-4 rounded-xl border-2 sm:border-3 border-green-400 shadow-lg">
                  <Label className="text-green-900 font-bold text-base sm:text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base">📍 Max Distance: </span>
                    <span className="text-orange-600 bg-orange-200 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">{filters.maxDistance} km</span>
                  </Label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                    className="w-full mt-2 sm:mt-3 h-2 sm:h-3 accent-green-600 bg-gradient-to-r from-green-200 to-emerald-200 rounded-lg"
                  />
                  <div className="flex justify-between text-sm sm:text-base font-bold text-green-700 mt-2 bg-green-50 px-2 sm:px-3 py-1 rounded-lg">
                    <span>5 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border-3 border-yellow-400 shadow-lg">
                  <Label className="text-orange-900 font-bold text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600 fill-yellow-400" />
                    ⭐ Min Rating: <span className="text-purple-600 bg-purple-200 px-3 py-1 rounded-lg">{filters.minRating}⭐</span>
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                    className="w-full mt-3 h-3 accent-yellow-500 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg"
                  />
                </div>

                {/* Availability Filter */}
                <div>
                  <Label className="text-blue-800 font-semibold">Availability</Label>
                  <Select onValueChange={(value: string) => setFilters(prev => ({ ...prev, availabilityFilter: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Time</SelectItem>
                      <SelectItem value="available_now">Available Now</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Filter */}
                <div>
                  <Label className="text-blue-800 font-semibold">Experience Level</Label>
                  <Select onValueChange={(value: string) => setFilters(prev => ({ ...prev, experienceLevel: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Level</SelectItem>
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Real-time Updates Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-blue-800 font-semibold">Real-time Updates</Label>
                  <input
                    type="checkbox"
                    checked={isRealTimeUpdating}
                    onChange={(e) => setIsRealTimeUpdating(e.target.checked)}
                    className="accent-green-600"
                  />
                </div>

                {/* Manual Refresh */}
                <Button 
                  onClick={performMatching} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Matching...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Find Matches
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Label className="text-blue-800 font-semibold text-sm sm:text-base whitespace-nowrap">Sort by:</Label>
                <Select onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-48 border-gray-300 h-10 sm:h-11">
                    <SelectValue placeholder="Best Match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Best Match</SelectItem>
                    <SelectItem value="distance">Nearest</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-green-700 font-medium text-sm sm:text-base w-full sm:w-auto text-center sm:text-right">
                {filteredMatches.length} of {matches.length} scribes
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
                <RefreshCw className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-blue-800">Finding perfect matches...</p>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mx-2 sm:mx-0">
              {filteredMatches.map((match, index) => (
                <Card 
                  key={match.scribe.id} 
                  className={`shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    selectedScribe?.id === match.scribe.id ? 'ring-2 sm:ring-4 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleScribeSelect(match.scribe)}
                >
                  <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                          {match.scribe.personalInfo.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-purple-800 truncate">{match.scribe.personalInfo.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current flex-shrink-0" />
                            <span className="text-green-700 font-medium text-sm sm:text-base">
                              {getAverageRating(match.scribe.ratings)?.toFixed(1) || 'New'}
                            </span>
                            <span className="text-purple-600 text-xs sm:text-sm">({match.scribe.ratings?.length || 0} reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center sm:text-right w-full sm:w-auto">
                        <div className="text-2xl sm:text-3xl font-bold text-green-600">{Math.round(match.score)}%</div>
                        <div className="text-xs sm:text-sm text-blue-700">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                    {/* Availability Status */}
                    <div className="flex items-center gap-2">
                      {match.isAvailable ? (
                        <>
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                          <span className="text-green-700 font-medium text-sm sm:text-base">Available Now</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                          <span className="text-orange-700 font-medium text-sm sm:text-base">
                            Next available: {match.nextAvailable}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Location & Distance */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-green-700 text-sm sm:text-base">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{match.scribe.location.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Compass className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{match.distance.toFixed(1)} km away</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{match.estimatedTravelTime} min travel</span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-green-700 text-sm sm:text-base">
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{match.scribe.experience.totalYears} years experience</span>
                      </div>
                      <span className="text-purple-600 text-xs sm:text-sm">• {match.scribe.experience.totalExamsScribed} exams completed</span>
                    </div>

                    {/* Subjects */}
                    <div>
                      <Label className="text-blue-800 font-semibold mb-2 block text-sm sm:text-base">Subjects</Label>
                      <div className="flex flex-wrap gap-1">
                        {match.scribe.qualifications.subjects.slice(0, 3).map(subject => (
                          <Badge 
                            key={subject} 
                            variant={student.academic.preferredSubjects.includes(subject) ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                        {match.scribe.qualifications.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.scribe.qualifications.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <Label className="text-blue-800 font-semibold mb-2 block text-sm sm:text-base">Languages</Label>
                      <div className="flex flex-wrap gap-1">
                        {match.scribe.qualifications.languagesKnown.slice(0, 3).map(lang => (
                          <Badge 
                            key={lang} 
                            variant={student.academic.languagePreference.includes(lang) ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            <Languages className="h-3 w-3 mr-1" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Match Factors */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-blue-800 font-semibold mb-2 block text-sm sm:text-base">Compatibility Breakdown</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span>Subject Match:</span>
                          <span className="font-medium text-blue-600">{Math.round(match.matchFactors.subjectMatch)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Language Match:</span>
                          <span className="font-medium text-green-600">{Math.round(match.matchFactors.languageMatch)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Experience:</span>
                          <span className="font-medium text-purple-600">{Math.round(match.matchFactors.experienceMatch)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium text-orange-600">{Math.round(match.matchFactors.locationMatch)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Message
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-green-600 text-green-600 hover:bg-green-50 h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Call
                      </Button>
                      {canProvideRemoteService(match.scribe) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50 h-9 sm:h-10 text-xs sm:text-sm"
                        >
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Video
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {!isLoading && filteredMatches.length === 0 && matches.length === 0 && (
              <div className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-2">No Scribes Found</h3>
                <p className="text-blue-700 mb-4 sm:mb-6 text-sm sm:text-base">Try adjusting your filters or exam details to find matches.</p>
                <Button onClick={performMatching} className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Retry Search
                </Button>
              </div>
            )}

            {/* Filtered Out Results */}
            {!isLoading && filteredMatches.length === 0 && matches.length > 0 && (
              <div className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
                <Filter className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-2">No Matches with Current Filters</h3>
                <p className="text-blue-700 mb-4 sm:mb-6 text-sm sm:text-base px-4 sm:px-0">
                  Found {matches.length} scribes, but none match your current filter criteria.
                </p>
                <Button 
                  onClick={() => setFilters({
                    maxDistance: 50,
                    minRating: 0,
                    subjectFilter: [],
                    languageFilter: [],
                    availabilityFilter: 'any',
                    experienceLevel: 'any',
                    genderPreference: 'any',
                    remoteCapable: false
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Book Scribe Modal/Section */}
        {selectedScribe && (
          <Card className="mt-6 sm:mt-8 shadow-xl border-0 bg-white mx-2 sm:mx-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">Confirm Booking with {selectedScribe.personalInfo.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4">Scribe Details</h4>
                  <div className="space-y-2 sm:space-y-3 text-green-700 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{selectedScribe.personalInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedScribe.personalInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedScribe.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{selectedScribe.experience.totalYears} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verified & Background Checked</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Exam Summary</h4>
                  <div className="space-y-3 text-green-700">
                    <div className="flex justify-between">
                      <span>Subject:</span>
                      <span className="font-medium">{examDetails.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{examDetails.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{examDetails.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{examDetails.duration} minutes</span>
                    </div>
                    {examDetails.venue && (
                      <div className="flex justify-between">
                        <span>Venue:</span>
                        <span className="font-medium">{examDetails.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <Button 
                  onClick={handleBookScribe}
                  disabled={!examDetails.subject || !examDetails.date || !examDetails.time}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg py-3"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm Booking
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedScribe(null)}
                  className="px-8 border-gray-400 text-green-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DynamicScribeMatching