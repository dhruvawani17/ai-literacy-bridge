'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  BookOpen, 
  Calendar,
  User,
  Globe,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useScribeStore, useUserStore, useAccessibilityStore } from '@/store'
import { Scribe, ScribeSession } from '@/types'
import { cn } from '@/lib/utils'

// Mock scribe data
const MOCK_SCRIBES: Scribe[] = [
  {
    id: 'scribe-1',
    userId: 'user-scribe-1',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    languages: ['English', 'Hindi', 'Marathi'],
    availability: {
      'monday': [{ start: '09:00', end: '17:00' }],
      'tuesday': [{ start: '09:00', end: '17:00' }],
      'wednesday': [{ start: '09:00', end: '17:00' }],
      'thursday': [{ start: '09:00', end: '17:00' }],
      'friday': [{ start: '09:00', end: '17:00' }],
    },
    rating: 4.8,
    totalSessions: 156,
    isActive: true,
    certifications: ['Certified Educational Scribe', 'Mathematics Specialist']
  },
  {
    id: 'scribe-2',
    userId: 'user-scribe-2',
    subjects: ['English', 'History', 'Geography'],
    languages: ['English', 'Tamil', 'Telugu'],
    availability: {
      'monday': [{ start: '10:00', end: '18:00' }],
      'tuesday': [{ start: '10:00', end: '18:00' }],
      'wednesday': [{ start: '10:00', end: '18:00' }],
      'thursday': [{ start: '10:00', end: '18:00' }],
      'friday': [{ start: '10:00', end: '18:00' }],
      'saturday': [{ start: '09:00', end: '15:00' }],
    },
    rating: 4.9,
    totalSessions: 203,
    isActive: true,
    certifications: ['Certified Educational Scribe', 'Language Specialist', 'Accessibility Expert']
  },
  {
    id: 'scribe-3',
    userId: 'user-scribe-3',
    subjects: ['Biology', 'Chemistry', 'Environmental Science'],
    languages: ['English', 'Bengali', 'Hindi'],
    availability: {
      'tuesday': [{ start: '14:00', end: '20:00' }],
      'thursday': [{ start: '14:00', end: '20:00' }],
      'friday': [{ start: '14:00', end: '20:00' }],
      'saturday': [{ start: '09:00', end: '17:00' }],
      'sunday': [{ start: '09:00', end: '17:00' }],
    },
    rating: 4.7,
    totalSessions: 89,
    isActive: true,
    certifications: ['Certified Educational Scribe', 'Science Specialist']
  }
]

interface ScribeMatcherProps {
  onScribeSelected?: (scribe: Scribe) => void
  onClose?: () => void
}

export function ScribeMatcher({ onScribeSelected, onClose }: ScribeMatcherProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [filteredScribes, setFilteredScribes] = useState<Scribe[]>(MOCK_SCRIBES)
  const [selectedScribe, setSelectedScribe] = useState<Scribe | null>(null)
  const [bookingStep, setBookingStep] = useState<'search' | 'book' | 'confirmed'>('search')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const { user } = useUserStore()
  const { 
    availableScribes, 
    isSearching, 
    setAvailableScribes, 
    setSearching, 
    bookScribe 
  } = useScribeStore()
  const { accessibilityPreferences } = useAccessibilityStore()

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography']
  const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali']

  useEffect(() => {
    setAvailableScribes(MOCK_SCRIBES)
  }, [setAvailableScribes])

  useEffect(() => {
    let filtered = MOCK_SCRIBES

    if (searchQuery) {
      filtered = filtered.filter(scribe => 
        scribe.subjects.some(subject => 
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        scribe.languages.some(language => 
          language.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (selectedSubject) {
      filtered = filtered.filter(scribe => 
        scribe.subjects.includes(selectedSubject)
      )
    }

    if (selectedLanguage) {
      filtered = filtered.filter(scribe => 
        scribe.languages.includes(selectedLanguage)
      )
    }

    setFilteredScribes(filtered)
  }, [searchQuery, selectedSubject, selectedLanguage])

  const handleScribeSelect = (scribe: Scribe) => {
    setSelectedScribe(scribe)
    setBookingStep('book')
    onScribeSelected?.(scribe)
  }

  const handleBooking = () => {
    if (!selectedScribe || !selectedDate || !selectedTime) return

    const scheduledTime = new Date(`${selectedDate}T${selectedTime}`)
    bookScribe(selectedScribe.id, selectedSubject || 'General', scheduledTime)
    setBookingStep('confirmed')
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={cn(
          "h-4 w-4", 
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-yellow-400"
        )} 
      />
    ))
  }

  if (bookingStep === 'confirmed') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Your scribe session has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <div className="bg-card p-6 rounded-lg border mb-6">
            <h3 className="font-semibold mb-4">Session Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Scribe:</strong> Professional Scribe</p>
              <p><strong>Subject:</strong> {selectedSubject || 'General'}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Duration:</strong> 2 hours</p>
            </div>
          </div>
          <Button onClick={onClose}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (bookingStep === 'book' && selectedScribe) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setBookingStep('search')}>
            ← Back to Search
          </Button>
        </div>
        
        <div className="bg-card p-6 rounded-lg border mb-6">
          <h3 className="text-xl font-semibold mb-4">Book Session with Selected Scribe</h3>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Professional Scribe</p>
              <div className="flex items-center space-x-2">
                <div className="flex">{getRatingStars(selectedScribe.rating)}</div>
                <span className="text-sm text-muted-foreground">
                  ({selectedScribe.totalSessions} sessions)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select 
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select subject</option>
                {selectedScribe.subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select 
                value={selectedLanguage || ''}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select language</option>
                {selectedScribe.languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Session Duration: 2 hours</p>
                <p className="text-sm text-muted-foreground">
                  Includes exam assistance, note-taking, and reading support
                </p>
              </div>
              <Button 
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !selectedSubject}
                className="px-8"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "max-w-6xl mx-auto p-6",
      accessibilityPreferences.highContrast && "high-contrast",
      `font-size-${accessibilityPreferences.fontSize}`
    )}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Find Your Perfect Scribe</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered matching to connect you with qualified scribes for exams and study sessions
            </p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card p-6 rounded-lg border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select 
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(e.target.value || null)}
            className="p-3 border rounded-lg"
          >
            <option value="">All subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select 
            value={selectedLanguage || ''}
            onChange={(e) => setSelectedLanguage(e.target.value || null)}
            className="p-3 border rounded-lg"
          >
            <option value="">All languages</option>
            {languages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedSubject && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedSubject}
              <button onClick={() => setSelectedSubject(null)} className="ml-1">×</button>
            </Badge>
          )}
          {selectedLanguage && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedLanguage}
              <button onClick={() => setSelectedLanguage(null)} className="ml-1">×</button>
            </Badge>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Available Scribes ({filteredScribes.length})
          </h2>
          {isSearching && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">AI matching in progress...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScribes.map((scribe) => (
            <div key={scribe.id} className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Professional Scribe</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex">{getRatingStars(scribe.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {scribe.rating} ({scribe.totalSessions} sessions)
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={scribe.isActive ? "default" : "secondary"}>
                  {scribe.isActive ? "Available" : "Busy"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {scribe.subjects.map(subject => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {scribe.languages.map(language => (
                      <Badge key={language} variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {scribe.certifications.map(cert => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => handleScribeSelect(scribe)}
                    className="w-full"
                    disabled={!scribe.isActive}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredScribes.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scribes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new scribes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}