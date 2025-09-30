/**
 * Scribe Matching System Types
 * Comprehensive type definitions for the blind student-scribe matching platform
 */

// User types
export type UserRole = 'student' | 'scribe' | 'admin'
export type DisabilityType = 'blind' | 'visually_impaired' | 'low_vision' | 'other'
export type ExamType = 'board' | 'competitive' | 'university' | 'entrance' | 'certification'
export type SubjectCategory = 'mathematics' | 'science' | 'english' | 'social_studies' | 'languages' | 'commerce' | 'arts' | 'technical'
export type LanguageOption = 'english' | 'hindi' | 'tamil' | 'telugu' | 'kannada' | 'malayalam' | 'bengali' | 'marathi' | 'gujarati' | 'punjabi'

// Location and Geography
export interface Location {
  id: string
  address: string
  city: string
  state: string
  pincode: string
  latitude: number
  longitude: number
  landmark?: string
}

// Student Profile
export interface StudentProfile {
  id: string
  userId: string
  personalInfo: {
    name: string
    email: string
    phone: string
    dateOfBirth: string
    emergencyContact: {
      name: string
      phone: string
      relation: string
    }
  }
  disability: {
    type: DisabilityType
    severity: 'complete' | 'partial' | 'progressive'
    details: string
    accommodationsNeeded: string[]
    medicalCertificate?: string // file path
  }
  academic: {
    institution: string
    course: string
    year: number
    previousExamExperience: boolean
    preferredSubjects: SubjectCategory[]
    languagePreference: LanguageOption[]
  }
  location: Location
  preferences: {
    scribeGender?: 'male' | 'female' | 'any'
    scribeAgeRange?: [number, number]
    maxTravelDistance: number // in km
    specialRequirements: string
  }
  verification: {
    isVerified: boolean
    verificationDate?: string
    documents: string[] // file paths
  }
  createdAt: string
  updatedAt: string
}

// Scribe Profile  
export interface ScribeProfile {
  id: string
  userId: string
  personalInfo: {
    name: string
    email: string
    phone: string
    dateOfBirth: string
    gender: 'male' | 'female' | 'other'
    emergencyContact: {
      name: string
      phone: string
      relation: string
    }
  }
  qualifications: {
    education: string
    degree: string
    institution: string
    graduationYear: number
    subjects: SubjectCategory[]
    languagesKnown: LanguageOption[]
    specializations: string[]
  }
  experience: {
    totalYears: number
    examTypes: ExamType[]
    totalExamsScribed: number
    successfulExams: number
    averageRating: number
    testimonials: string[]
  }
  availability: {
    daysAvailable: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
    timeSlots: TimeSlot[]
    maxDistanceWilling: number // in km
    examTypesWilling: ExamType[]
    blackoutDates: string[] // dates not available
  }
  location: Location
  verification: {
    isVerified: boolean
    verificationDate?: string
    backgroundCheck: boolean
    documents: string[] // ID, certificates, etc.
    references: Reference[]
  }
  ratings: ScribeRating[]
  createdAt: string
  updatedAt: string
}

// Time Management
export interface TimeSlot {
  id: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isRecurring: boolean
  specificDates?: string[] // for non-recurring slots
}

// Reference system
export interface Reference {
  id: string
  name: string
  phone: string
  email: string
  relation: string
  institution?: string
  isVerified: boolean
  feedback?: string
}

// Exam Registration
export interface ExamRegistration {
  id: string
  studentId: string
  examDetails: {
    examName: string
    examType: ExamType
    subjects: SubjectCategory[]
    language: LanguageOption
    date: string
    startTime: string
    endTime: string
    duration: number // in minutes
    location: Location
    examCenterId: string
    roomNumber?: string
    seatNumber?: string
  }
  requirements: {
    scribeNeeded: boolean
    readerNeeded: boolean
    extraTime: number // percentage extra time
    largeFont: boolean
    separateRoom: boolean
    computerNeeded: boolean
    specialInstructions: string
  }
  status: 'pending' | 'scribe_assigned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  scribeAssigned?: string // scribe ID
  matchHistory: MatchAttempt[]
  createdAt: string
  updatedAt: string
}

// Matching System
export interface MatchAttempt {
  id: string
  studentId: string
  scribeId: string
  examId: string
  matchScore: number
  factors: MatchingFactors
  status: 'proposed' | 'accepted' | 'declined' | 'expired'
  proposedAt: string
  respondedAt?: string
  notes?: string
}

export interface MatchingFactors {
  distanceScore: number // 0-100
  availabilityScore: number // 0-100
  subjectMatchScore: number // 0-100
  languageMatchScore: number // 0-100
  experienceScore: number // 0-100
  ratingScore: number // 0-100
  preferenceMatchScore: number // 0-100
  overallScore: number // weighted average
}

// Rating and Feedback
export interface ScribeRating {
  id: string
  studentId: string
  scribeId: string
  examId: string
  rating: number // 1-5 stars
  feedback: {
    punctuality: number // 1-5
    clarity: number // 1-5
    patience: number // 1-5
    knowledge: number // 1-5
    overall: number // 1-5
  }
  comments: string
  wouldRecommend: boolean
  anonymous: boolean
  submittedAt: string
}

// Smart Community Features
export interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'basics' | 'advanced' | 'subject_specific' | 'accessibility'
  content: {
    sections: TrainingSection[]
    practiceQuestions: PracticeQuestion[]
    assessments: Assessment[]
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // in minutes
  prerequisites: string[]
  createdAt: string
  updatedAt: string
}

export interface TrainingSection {
  id: string
  title: string
  content: string
  videoUrl?: string
  audioUrl?: string
  documents?: string[]
  interactiveElements?: unknown[]
}

export interface PracticeQuestion {
  id: string
  question: string
  type: 'reading' | 'writing' | 'calculation' | 'description'
  difficulty: 'easy' | 'medium' | 'hard'
  subject: SubjectCategory
  expectedAnswer?: string
  rubric?: string
  timeLimit?: number
}

export interface Assessment {
  id: string
  title: string
  questions: PracticeQuestion[]
  passingScore: number
  maxAttempts: number
  certification?: boolean
}

// Emergency and Safety
export interface EmergencyContact {
  id: string
  name: string
  phone: string
  email: string
  relation: string
  isActive: boolean
  lastContacted?: string
}

export interface SafetyIncident {
  id: string
  reportedBy: string
  reportedAgainst?: string
  incidentType: 'no_show' | 'inappropriate_behavior' | 'safety_concern' | 'other'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'investigating' | 'resolved' | 'escalated'
  actionTaken?: string
  reportedAt: string
  resolvedAt?: string
}

// Analytics and Insights
export interface SystemAnalytics {
  totalStudents: number
  totalScribes: number
  totalMatches: number
  successfulMatches: number
  averageMatchTime: number // minutes
  geographicCoverage: {
    [state: string]: {
      students: number
      scribes: number
      coverage: number // percentage
    }
  }
  subjectDemand: {
    [subject in SubjectCategory]: number
  }
  performanceMetrics: {
    averageRating: number
    completionRate: number
    cancellationRate: number
  }
  trends: {
    monthlyGrowth: number
    peakExamSeasons: string[]
    mostDemandedLanguages: LanguageOption[]
  }
}

// API Response Types
export interface MatchingResponse {
  success: boolean
  matches: MatchAttempt[]
  message: string
  alternatives?: MatchAttempt[]
  waitlistPosition?: number
}

export interface VoiceCommand {
  intent: 'navigate' | 'register' | 'search' | 'confirm' | 'cancel' | 'help'
  parameters: Record<string, unknown>
  confidence: number
  transcript: string
}

// Configuration
export interface MatchingConfig {
  weights: {
    distance: number
    availability: number
    subject: number
    language: number
    experience: number
    rating: number
    preference: number
  }
  thresholds: {
    minimumScore: number
    maximumDistance: number
    responseTime: number // hours
  }
  limits: {
    maxMatchesPerRequest: number
    maxActiveRequests: number
    backupScribeCount: number
  }
}