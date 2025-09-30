/**
 * Scribe Registration Component
 * Comprehensive registration form for volunteer scribes
 * Includes verification, background checks, and training modules
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Shield,
  FileText,
  Mic,
  Volume2,
  Clock,
  CheckCircle,
  Upload,
  Plus,
  X,
  Star,
  GraduationCap,
  Languages,
  Heart
} from 'lucide-react'
import type { 
  ScribeProfile, 
  SubjectCategory, 
  LanguageOption,
  Location
} from '@/types/scribe-system'
import RegistrationSuccess from './RegistrationSuccess'

// Local types for the registration form
type QualificationLevel = 'high_school' | 'bachelors' | 'masters' | 'phd' | 'professional'
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

interface ScribeRegistrationProps {
  onRegistrationComplete: (profile: ScribeProfile) => void
  enableVoiceSupport?: boolean
}

export function ScribeRegistration({ 
  onRegistrationComplete, 
  enableVoiceSupport = true 
}: ScribeRegistrationProps) {
  // Form state management
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedProfile, setCompletedProfile] = useState<ScribeProfile | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Voice support
  const [isListening, setIsListening] = useState(false)
  const [voiceInstructions, setVoiceInstructions] = useState('')
  
  // Form data - simplified structure for registration
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'other' as 'male' | 'female' | 'other',
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    },
    qualifications: {
      education: '',
      degree: '',
      institution: '',
      graduationYear: new Date().getFullYear(),
      subjects: [] as SubjectCategory[],
      languagesKnown: [] as LanguageOption[],
      specializations: [] as string[],
      // Additional fields for form
      educationList: [] as any[],
      writingSpeed: 0,
      typingSpeed: 0
    },
    experience: {
      totalYears: 0,
      examTypes: [] as any[],
      totalExamsScribed: 0,
      successfulExams: 0,
      averageRating: 0,
      testimonials: [] as string[],
      // Additional fields for form
      level: 'beginner' as ExperienceLevel,
      previousScribeWork: false,
      motivation: '',
      specialSkills: ''
    },
    availability: {
      daysAvailable: [] as any[],
      timeSlots: [] as any[],
      maxDistanceWilling: 10,
      examTypesWilling: [] as any[],
      blackoutDates: [] as string[],
      // Additional fields for form
      maxExamsPerWeek: 2,
      remoteCapable: false,
      flexibleSchedule: true
    },
    location: {
      id: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      latitude: 0,
      longitude: 0
    },
    verification: {
      isVerified: false,
      documents: [] as string[],
      backgroundCheck: false,
      references: [] as any[]
    }
  })

  // Step configuration
  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Qualifications & Skills', icon: GraduationCap },
    { id: 3, title: 'Experience & Expertise', icon: Award },
    { id: 4, title: 'Availability & Location', icon: Clock },
    { id: 5, title: 'Verification & Training', icon: Shield }
  ]

  // Constants
  const educationLevels: { value: QualificationLevel; label: string }[] = [
    { value: 'high_school', label: 'High School/12th Grade' },
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD/Doctorate' },
    { value: 'professional', label: 'Professional Certification' }
  ]

  const subjects: { value: SubjectCategory; label: string; description: string }[] = [
    { value: 'mathematics', label: 'Mathematics', description: 'Algebra, Calculus, Statistics, Geometry' },
    { value: 'science', label: 'Science', description: 'Physics, Chemistry, Biology' },
    { value: 'english', label: 'English', description: 'Literature, Grammar, Composition' },
    { value: 'social_studies', label: 'Social Studies', description: 'History, Geography, Civics' },
    { value: 'languages', label: 'Languages', description: 'Regional and foreign languages' },
    { value: 'commerce', label: 'Commerce', description: 'Accounting, Business Studies, Economics' },
    { value: 'arts', label: 'Arts', description: 'Fine Arts, Music, Drama' },
    { value: 'technical', label: 'Technical/Engineering', description: 'Computer Science, Engineering subjects' }
  ]

  const languages: { value: LanguageOption; label: string }[] = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'punjabi', label: 'Punjabi' }
  ]

  const experienceLevels: { value: ExperienceLevel; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'New to scribe work, willing to learn' },
    { value: 'intermediate', label: 'Intermediate', description: '1-3 years experience or related background' },
    { value: 'advanced', label: 'Advanced', description: '3+ years experience with specialized skills' },
    { value: 'expert', label: 'Expert', description: 'Extensive experience, mentor capability' }
  ]

  const timeSlots = [
    'early_morning', 'morning', 'afternoon', 'evening', 'night',
    'weekdays', 'weekends', 'exam_season', 'holidays'
  ]

  // Voice support functions
  useEffect(() => {
    if (enableVoiceSupport) {
      setVoiceInstructions(getStepInstructions(currentStep))
      speakInstructions(getStepInstructions(currentStep))
    }
  }, [currentStep, enableVoiceSupport])

  const speakInstructions = (text: string) => {
    if (!enableVoiceSupport || !('speechSynthesis' in window)) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.volume = 0.8
    window.speechSynthesis.speak(utterance)
  }

  const getStepInstructions = (step: number): string => {
    const instructions = {
      1: 'Welcome to scribe registration. Thank you for volunteering to help students with disabilities. In this step, please provide your personal information including contact details and emergency contact.',
      2: 'Now provide your educational qualifications, language skills, subject expertise, and writing/typing speeds. This helps us match you with suitable students.',
      3: 'Tell us about your experience with assisting others, any specialized fields, and provide references who can vouch for your character and reliability.',
      4: 'Specify your availability, preferred time slots, travel radius, and whether you can provide remote assistance.',
      5: 'Final step: Complete verification process, upload required documents, and access training modules to become a certified scribe.'
    }
    return instructions[step as keyof typeof instructions] || ''
  }

  // Form validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.personalInfo?.name) newErrors.name = 'Name is required'
        if (!formData.personalInfo?.email) newErrors.email = 'Email is required'
        if (!formData.personalInfo?.phone) newErrors.phone = 'Phone number is required'
        if (!formData.personalInfo?.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
        break
        
      case 2:
        if (!formData.qualifications?.educationList?.length) newErrors.education = 'Please add at least one education qualification'
        if (!formData.qualifications?.languagesKnown?.length) newErrors.languages = 'Please select at least one language'
        if (!formData.qualifications?.subjects?.length) newErrors.subjects = 'Please select your subject expertise'
        break
        
      case 3:
        if (!formData.experience?.level) newErrors.experienceLevel = 'Please select your experience level'
        break
        
      case 4:
        if (!formData.availability?.timeSlots?.length) newErrors.timeSlots = 'Please select your available time slots'
        if (!formData.location?.address) newErrors.address = 'Address is required'
        if (!formData.location?.city) newErrors.city = 'City is required'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    
    try {
      // Create complete scribe profile
      const scribeProfile: ScribeProfile = {
        id: `scribe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}`, // Would come from auth system
        personalInfo: formData.personalInfo,
        qualifications: {
          education: formData.qualifications.education,
          degree: formData.qualifications.degree,
          institution: formData.qualifications.institution,
          graduationYear: formData.qualifications.graduationYear,
          subjects: formData.qualifications.subjects,
          languagesKnown: formData.qualifications.languagesKnown,
          specializations: formData.qualifications.specializations
        },
        experience: {
          totalYears: formData.experience.totalYears,
          examTypes: formData.experience.examTypes,
          totalExamsScribed: formData.experience.totalExamsScribed,
          successfulExams: formData.experience.successfulExams,
          averageRating: formData.experience.averageRating,
          testimonials: formData.experience.testimonials
        },
        availability: {
          daysAvailable: formData.availability.daysAvailable,
          timeSlots: formData.availability.timeSlots,
          maxDistanceWilling: formData.availability.maxDistanceWilling,
          examTypesWilling: formData.availability.examTypesWilling,
          blackoutDates: formData.availability.blackoutDates
        },
        location: formData.location,
        verification: formData.verification,
        ratings: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Show success screen first
      setCompletedProfile(scribeProfile)
      setIsCompleted(true)
      
      if (enableVoiceSupport) {
        speakInstructions('Registration completed successfully! Your application will be reviewed and you will be contacted for background verification.')
      }

      // Call completion handler after delay
      setTimeout(() => {
        onRegistrationComplete(scribeProfile)
      }, 3000)
      
    } catch (error) {
      console.error('Registration error:', error)
      if (enableVoiceSupport) {
        speakInstructions('Registration failed. Please check your information and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} setFormData={setFormData} errors={errors} />
      case 2:
        return <QualificationsStep formData={formData} setFormData={setFormData} errors={errors} subjects={subjects} languages={languages} educationLevels={educationLevels} />
      case 3:
        return <ExperienceStep formData={formData} setFormData={setFormData} errors={errors} experienceLevels={experienceLevels} />
      case 4:
        return <AvailabilityLocationStep formData={formData} setFormData={setFormData} errors={errors} timeSlots={timeSlots} />
      case 5:
        return <VerificationTrainingStep formData={formData} />
      default:
        return null
    }
  }

  // Show success screen if registration is completed
  if (isCompleted && completedProfile) {
    return (
      <RegistrationSuccess
        type="scribe"
        name={completedProfile.personalInfo.name}
        onComplete={() => {
          // This will be called after the countdown
          setIsCompleted(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-xl lg:shadow-2xl border-4 border-gradient-to-r from-green-400 to-blue-400 overflow-hidden">
          <CardHeader className="text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 border-b-4 border-green-300">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-4">
              🌟 Volunteer Scribe Registration 🌟
            </CardTitle>
            <p className="text-purple-800 mt-2 sm:mt-4 font-bold text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
              🎯 Join our amazing community of volunteer scribes helping students with disabilities achieve their dreams! 🎯
            </p>
            
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 rounded-xl border-4 border-green-400 shadow-lg">
              <div className="flex items-center justify-center gap-3 text-green-800 mb-3 text-lg sm:text-xl font-bold">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
                <span>💖 Thank You for Your Amazing Heart! 💖</span>
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
              </div>
              <p className="text-sm sm:text-base md:text-lg text-green-700 font-bold leading-relaxed">
                🌈 Your incredible contribution helps make education accessible and transforms lives! You're making a real difference! 🌈
              </p>
            </div>

            {enableVoiceSupport && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-200 via-cyan-200 to-sky-200 rounded-xl border-4 border-blue-400 shadow-lg">
                <div className="flex items-center justify-center gap-3 text-blue-800 text-lg sm:text-xl font-bold mb-2">
                  <Volume2 className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 animate-bounce" />
                  <span>🎤 Voice Support Active! 🎤</span>
                </div>
                <p className="text-sm sm:text-base text-blue-700 font-semibold">
                  🔊 Listen for audio instructions or use voice commands to navigate easily! 🔊
                </p>
              </div>
            )}
          </CardHeader>

        <CardContent className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-green-50 to-blue-50">
          {/* Responsive Progress Indicators */}
          <div className="mb-6 sm:mb-8">
            {/* Desktop/Tablet Progress Indicator */}
            <div className="hidden md:flex justify-between items-center mb-6 overflow-x-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center min-w-max">
                  <div className={`
                    flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full border-4 transition-all duration-300 shadow-lg
                    ${currentStep > step.id 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white shadow-green-300' 
                      : currentStep === step.id 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 text-white shadow-blue-300 animate-pulse' 
                        : 'bg-gradient-to-r from-orange-200 to-yellow-300 border-orange-400 text-orange-600'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6 lg:h-7 lg:w-7" />
                    ) : (
                      <step.icon className="h-6 w-6 lg:h-7 lg:w-7" />
                    )}
                  </div>
                  <span className={`ml-3 text-sm lg:text-base font-bold max-w-32 lg:max-w-40 ${
                    currentStep >= step.id ? 'text-blue-800' : 'text-purple-600'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 lg:w-12 h-2 ml-4 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Progress Indicator */}
            <div className="md:hidden mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 text-white shadow-lg shadow-blue-300 animate-pulse
                `}>
                  {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6" })}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-800">
                    🎯 Step {currentStep} of {steps.length} 🎯
                  </div>
                  <div className="text-sm font-bold text-purple-700">
                    {steps[currentStep - 1].title}
                  </div>
                </div>
              </div>
              
              {/* Mobile progress bar with bright colors */}
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 mb-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
              <div className="text-center text-sm text-green-800 font-bold">
                🌟 {Math.round((currentStep / steps.length) * 100)}% Complete! 🌟
              </div>
            </div>
            
            {/* Desktop progress bar */}
            <div className="hidden md:block w-full bg-gradient-to-r from-orange-200 to-yellow-300 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content with bright background */}
          <div className="min-h-[400px] sm:min-h-[500px] p-4 sm:p-6 bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300 shadow-inner">
            {renderStepContent()}
          </div>

          {/* Enhanced Navigation buttons - Mobile-first responsive */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-xl border-4 border-green-400 shadow-lg">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              className="order-2 sm:order-1 w-full sm:w-auto flex items-center justify-center gap-2 border-4 border-green-600 text-green-800 font-bold hover:bg-green-100 py-3 px-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-75"
            >
              ⬅️ Previous Step
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
              {enableVoiceSupport && (
                <Button
                  onClick={() => speakInstructions(voiceInstructions)}
                  variant="outline"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border-4 border-orange-500 text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100 font-bold hover:bg-orange-200 shadow-lg hover:shadow-xl transition-all py-3 px-6 text-lg"
                >
                  <Volume2 className="h-5 w-5" />
                  🔊 Repeat Instructions
                </Button>
              )}
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all py-3 px-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ⏳ Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      ✨ Complete Registration ✨
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all py-3 px-6 text-lg"
                >
                  Next Step ➡️
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

// Step Components
function PersonalInfoStep({ formData, setFormData, errors }: any) {
  const updatePersonalInfo = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const updateEmergencyContact = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        emergencyContact: {
          ...prev.personalInfo.emergencyContact,
          [field]: value
        }
      }
    }))
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Personal Information Header */}
      <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-xl border-4 border-blue-400 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">👤 Personal Information 👤</h2>
        <p className="text-blue-700 font-semibold text-sm sm:text-base">🌟 Tell us about yourself! Your information helps us verify your identity and ensure student safety. 🌟</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-blue-800 font-bold text-sm sm:text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Full Name * 
          </Label>
          <Input
            id="name"
            value={formData.personalInfo?.name || ''}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            className={`h-11 sm:h-12 text-base font-semibold border-2 ${errors.name ? 'border-red-500 bg-red-50' : 'border-blue-400 bg-blue-50'} focus:border-blue-600 focus:ring-2 focus:ring-blue-200`}
            placeholder="✨ Enter your full name"
          />
          {errors.name && <p className="text-red-600 text-sm font-bold mt-1 bg-red-100 p-2 rounded-lg">❌ {errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-green-800 font-bold text-sm sm:text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-green-600" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.personalInfo?.email || ''}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            className={`h-11 sm:h-12 text-base font-semibold border-2 ${errors.email ? 'border-red-500 bg-red-50' : 'border-green-400 bg-green-50'} focus:border-green-600 focus:ring-2 focus:ring-green-200`}
            placeholder="📧 your.email@example.com"
          />
          {errors.email && <p className="text-red-600 text-sm font-bold mt-1 bg-red-100 p-2 rounded-lg">❌ {errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-purple-800 font-bold text-sm sm:text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-purple-600" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.personalInfo?.phone || ''}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            className={`h-11 sm:h-12 text-base font-semibold border-2 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-purple-400 bg-purple-50'} focus:border-purple-600 focus:ring-2 focus:ring-purple-200`}
            placeholder="📞 +91 98765 43210"
          />
          {errors.phone && <p className="text-red-600 text-sm font-bold mt-1 bg-red-100 p-2 rounded-lg">❌ {errors.phone}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-orange-800 font-bold text-sm sm:text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            Date of Birth *
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.personalInfo?.dateOfBirth || ''}
            onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
            className={`h-11 sm:h-12 text-base font-semibold border-2 ${errors.dateOfBirth ? 'border-red-500 bg-red-50' : 'border-orange-400 bg-orange-50'} focus:border-orange-600 focus:ring-2 focus:ring-orange-200`}
          />
          {errors.dateOfBirth && <p className="text-red-600 text-sm font-bold mt-1 bg-red-100 p-2 rounded-lg">❌ {errors.dateOfBirth}</p>}
        </div>
        
        <div className="space-y-2">
          <Label className="text-pink-800 font-bold text-sm sm:text-base flex items-center gap-2">
            <User className="h-4 w-4 text-pink-600" />
            Gender
          </Label>
          <Select onValueChange={(value: string) => updatePersonalInfo('gender', value)}>
            <SelectTrigger className="h-11 sm:h-12 text-base font-semibold border-2 border-pink-400 bg-pink-50 focus:border-pink-600 focus:ring-2 focus:ring-pink-200">
              <SelectValue placeholder="🎯 Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">👨 Male</SelectItem>
              <SelectItem value="female">👩 Female</SelectItem>
              <SelectItem value="other">🌈 Other</SelectItem>
              <SelectItem value="prefer_not_to_say">🤐 Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t-4 border-green-600 pt-6 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Emergency Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyName">Contact Name</Label>
            <Input
              id="emergencyName"
              value={formData.personalInfo?.emergencyContact?.name || ''}
              onChange={(e) => updateEmergencyContact('name', e.target.value)}
              placeholder="Emergency contact name"
            />
          </div>
          
          <div>
            <Label htmlFor="emergencyPhone">Contact Phone</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={formData.personalInfo?.emergencyContact?.phone || ''}
              onChange={(e) => updateEmergencyContact('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          
          <div>
            <Label htmlFor="emergencyRelation">Relationship</Label>
            <Select onValueChange={(value: string) => updateEmergencyContact('relation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

function QualificationsStep({ formData, setFormData, errors, subjects, languages, educationLevels }: any) {
  const updateQualifications = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      qualifications: {
        ...prev.qualifications,
        [field]: value
      }
    }))
  }

  const toggleSubject = (subject: string) => {
    const current = formData.qualifications?.subjects || []
    const updated = current.includes(subject)
      ? current.filter((s: string) => s !== subject)
      : [...current, subject]
    updateQualifications('subjects', updated)
  }

  const toggleLanguage = (language: string) => {
    const current = formData.qualifications?.languagesKnown || []
    const updated = current.includes(language)
      ? current.filter((l: string) => l !== language)
      : [...current, language]
    updateQualifications('languagesKnown', updated)
  }

  const addEducation = () => {
    const current = formData.qualifications?.educationList || []
    const newEducation = {
      level: 'bachelors',
      institution: '',
      degree: '',
      year: new Date().getFullYear(),
      grade: ''
    }
    updateQualifications('educationList', [...current, newEducation])
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg border border-purple-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <Label className="text-lg font-semibold flex items-center gap-2 text-purple-800">
            🎓 Educational Qualifications *
          </Label>
          <Button 
            onClick={addEducation} 
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            ➕ Add Education
          </Button>
        </div>
        
        {formData.qualifications?.educationList?.map((edu: any, index: number) => (
          <Card key={index} className="p-4 sm:p-6 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-700 font-semibold">📚 Education Level</Label>
                <Select onValueChange={(value: string) => {
                  const updated = [...(formData.qualifications?.educationList || [])]
                  updated[index].level = value
                  updateQualifications('educationList', updated)
                }}>
                  <SelectTrigger className="border-2 border-blue-300 focus:border-purple-500 bg-white hover:bg-blue-50 transition-colors">
                    <SelectValue placeholder="🎯 Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level: any) => (
                      <SelectItem key={level.value} value={level.value}>
                        📖 {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-purple-700 font-semibold">🏫 Institution</Label>
                <Input
                  className="border-2 border-purple-300 focus:border-blue-500 bg-white hover:bg-purple-50 transition-colors font-medium"
                  value={edu.institution || ''}
                  onChange={(e) => {
                    const updated = [...(formData.qualifications?.educationList || [])]
                    updated[index].institution = e.target.value
                    updateQualifications('educationList', updated)
                  }}
                  placeholder="🏛️ Institution name"
                />
              </div>
              
              <div>
                <Label className="text-green-700 font-semibold">🎓 Degree/Course</Label>
                <Input
                  className="border-2 border-green-300 focus:border-blue-500 bg-white hover:bg-green-50 transition-colors font-medium"
                  value={edu.degree || ''}
                  onChange={(e) => {
                    const updated = [...(formData.qualifications?.educationList || [])]
                    updated[index].degree = e.target.value
                    updateQualifications('educationList', updated)
                  }}
                  placeholder="🎯 Degree or course name"
                />
              </div>
              
              <div>
                <Label className="text-orange-700 font-semibold">📅 Year of Completion</Label>
                <Input
                  className="border-2 border-orange-300 focus:border-blue-500 bg-white hover:bg-orange-50 transition-colors font-medium"
                  type="number"
                  value={edu.year || ''}
                  onChange={(e) => {
                    const updated = [...(formData.qualifications?.educationList || [])]
                    updated[index].year = parseInt(e.target.value)
                    updateQualifications('educationList', updated)
                  }}
                  placeholder="📆 Year"
                />
              </div>
            </div>
          </Card>
        ))}
        
        {errors.education && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.education}</p>}
      </div>

      <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg border border-green-200">
        <Label className="text-lg font-semibold flex items-center gap-2 text-green-800 mb-2">
          🌍 Language Proficiency *
        </Label>
        <p className="text-sm text-green-700 mb-4 font-medium">✨ Select languages you can read, write, and speak fluently</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {languages.map((language: any) => (
            <Badge
              key={language.value}
              variant={formData.qualifications?.languagesKnown?.includes(language.value) ? 'default' : 'outline'}
              className={`p-3 cursor-pointer justify-center font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                formData.qualifications?.languagesKnown?.includes(language.value) 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-0' 
                  : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-purple-400'
              }`}
              onClick={() => toggleLanguage(language.value)}
            >
              <Languages className="h-4 w-4 mr-1" />
              🗣️ {language.label}
            </Badge>
          ))}
        </div>
        {errors.languages && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.languages}</p>}
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border border-purple-200">
        <Label className="text-lg font-semibold flex items-center gap-2 text-purple-800 mb-2">
          📚 Subject Expertise *
        </Label>
        <p className="text-sm text-purple-700 mb-4 font-medium">🎯 Select subjects you are comfortable assisting with</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject: any) => (
            <div
              key={subject.value}
              onClick={() => toggleSubject(subject.value)}
              className={`
                p-4 sm:p-6 border-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${formData.qualifications?.subjects?.includes(subject.value)
                  ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-800 shadow-lg'
                  : 'border-purple-300 bg-white hover:border-pink-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <BookOpen className={`h-6 w-6 mt-1 ${formData.qualifications?.subjects?.includes(subject.value) ? 'text-purple-600' : 'text-purple-500'}`} />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">📖 {subject.label}</h3>
                  <p className="text-xs sm:text-sm mt-1 text-purple-700 font-medium">{subject.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.subjects && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.subjects}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg border border-orange-200">
        <div>
          <Label htmlFor="writingSpeed" className="text-orange-800 font-semibold flex items-center gap-2">
            ✍️ Writing Speed (words per minute)
          </Label>
          <Input
            id="writingSpeed"
            type="number"
            className="border-2 border-orange-300 focus:border-yellow-500 bg-white hover:bg-orange-50 transition-colors font-medium mt-2"
            value={formData.qualifications?.writingSpeed || ''}
            onChange={(e) => updateQualifications('writingSpeed', parseInt(e.target.value))}
            placeholder="📝 e.g., 25"
          />
          <p className="text-xs text-orange-700 mt-2 font-medium bg-orange-50 p-2 rounded">
            💡 Average handwriting speed is 20-25 words per minute
          </p>
        </div>
        
        <div>
          <Label htmlFor="typingSpeed" className="text-yellow-800 font-semibold flex items-center gap-2">
            ⌨️ Typing Speed (words per minute)
          </Label>
          <Input
            id="typingSpeed"
            type="number"
            className="border-2 border-yellow-300 focus:border-orange-500 bg-white hover:bg-yellow-50 transition-colors font-medium mt-2"
            value={formData.qualifications?.typingSpeed || ''}
            onChange={(e) => updateQualifications('typingSpeed', parseInt(e.target.value))}
            placeholder="💻 e.g., 40"
          />
          <p className="text-xs text-yellow-700 mt-2 font-medium bg-yellow-50 p-2 rounded">
            🖥️ For digital exam assistance
          </p>
        </div>
      </div>
    </div>
  )
}

function ExperienceStep({ formData, setFormData, errors, experienceLevels }: any) {
  const updateExperience = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 rounded-xl">
      <div className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-lg border border-green-200">
        <Label className="text-lg font-semibold flex items-center gap-2 text-green-800 mb-4">
          💼 Experience Level *
        </Label>
        <RadioGroup 
          value={formData.experience?.level || ''} 
          onValueChange={(value: string) => updateExperience('level', value)}
          className="space-y-3"
        >
          {experienceLevels.map((level: any) => (
            <div key={level.value} className="flex items-start space-x-3 p-4 border-2 border-green-300 rounded-lg bg-white hover:bg-green-50 hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md">
              <RadioGroupItem 
                value={level.value} 
                id={level.value} 
                className="mt-1 border-2 border-green-500 text-green-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-600" 
              />
              <div>
                <Label htmlFor={level.value} className="font-semibold text-green-800 cursor-pointer flex items-center gap-2">
                  🎯 {level.label}
                </Label>
                <p className="text-sm text-green-700 mt-1">{level.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        {errors.experienceLevel && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.experienceLevel}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3 p-4 border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-emerald-500 hover:scale-105">
          <Checkbox
            id="previousScribeWork"
            checked={formData.experience?.previousScribeWork || false}
            onCheckedChange={(checked: boolean) => updateExperience('previousScribeWork', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-green-600 data-[state=checked]:border-green-600 border-2 border-emerald-400 w-5 h-5"
          />
          <Label htmlFor="previousScribeWork" className="font-semibold text-emerald-800 cursor-pointer hover:text-green-700 flex items-center gap-2">
            ✅ I have previous experience as a scribe
          </Label>
        </div>
        
        <div>
          <Label htmlFor="yearsOfExperience" className="text-blue-800 font-semibold flex items-center gap-2">
            📅 Years of Experience
          </Label>
          <Input
            id="yearsOfExperience"
            className="border-2 border-blue-300 focus:border-teal-500 bg-white hover:bg-blue-50 transition-colors font-medium mt-2"
            type="number"
            value={formData.experience?.yearsOfExperience || ''}
            onChange={(e) => updateExperience('yearsOfExperience', parseInt(e.target.value))}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="motivation" className="text-sm font-bold text-purple-800 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-md shadow-sm">Why do you want to become a scribe?</Label>
        <Textarea
          id="motivation"
          value={formData.experience?.motivation || ''}
          onChange={(e) => updateExperience('motivation', e.target.value)}
          className="min-h-[60px] w-full rounded-md border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 text-sm shadow-lg placeholder:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-purple-600"
          placeholder="Tell us about your motivation to help students with disabilities..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="specialSkills" className="text-sm font-bold text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-md shadow-sm">Special Skills or Experience</Label>
        <Textarea
          id="specialSkills"
          value={formData.experience?.specialSkills || ''}
          onChange={(e) => updateExperience('specialSkills', e.target.value)}
          className="min-h-[60px] w-full rounded-md border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 text-sm shadow-lg placeholder:text-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:border-green-600"
          placeholder="Any special skills, experience with assistive technologies, or relevant background..."
          rows={3}
        />
      </div>
    </div>
  )
}

function AvailabilityLocationStep({ formData, setFormData, errors, timeSlots }: any) {
  const updateAvailability = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }))
  }

  const updateLocation = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const toggleTimeSlot = (slot: string) => {
    const current = formData.availability?.timeSlots || []
    const updated = current.includes(slot)
      ? current.filter((s: string) => s !== slot)
      : [...current, slot]
    updateAvailability('timeSlots', updated)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl">
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg border border-blue-200">
        <Label className="text-lg font-semibold flex items-center gap-2 text-blue-800 mb-2">
          🕒 Available Time Slots *
        </Label>
        <p className="text-sm text-blue-700 mb-4 font-medium">⏰ Select when you are generally available</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {timeSlots.map((slot: string) => (
            <Badge
              key={slot}
              variant={formData.availability?.timeSlots?.includes(slot) ? 'default' : 'outline'}
              className={`p-3 cursor-pointer justify-center capitalize font-semibold transition-all duration-300 hover:scale-105 ${
                formData.availability?.timeSlots?.includes(slot)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-0'
                  : 'bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-purple-400'
              }`}
              onClick={() => toggleTimeSlot(slot)}
            >
              <Clock className="h-4 w-4 mr-1" />
              🕐 {slot.replace('_', ' ')}
            </Badge>
          ))}
        </div>
        {errors.timeSlots && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.timeSlots}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border border-green-200">
          <Label htmlFor="maxExams" className="text-green-800 font-semibold flex items-center gap-2">
            📊 Maximum Exams per Week
          </Label>
          <Select onValueChange={(value: string) => updateAvailability('maxExamsPerWeek', parseInt(value))}>
            <SelectTrigger className="border-2 border-green-300 focus:border-emerald-500 bg-white hover:bg-green-50 transition-colors mt-2">
              <SelectValue placeholder="📈 Select max exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1️⃣ 1 exam per week</SelectItem>
              <SelectItem value="2">2️⃣ 2 exams per week</SelectItem>
              <SelectItem value="3">3️⃣ 3 exams per week</SelectItem>
              <SelectItem value="4">4️⃣ 4 exams per week</SelectItem>
              <SelectItem value="5">5️⃣ 5+ exams per week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg border border-orange-200">
          <Label htmlFor="travelRadius" className="text-orange-800 font-semibold flex items-center gap-2">
            🗺️ Travel Radius: {formData.availability?.maxDistanceWilling || 10} km
          </Label>
          <input
            type="range"
            id="travelRadius"
            min="5"
            max="50"
            step="5"
            value={formData.availability?.maxDistanceWilling || 10}
            onChange={(e) => updateAvailability('maxDistanceWilling', parseInt(e.target.value))}
            className="w-full mt-2 accent-orange-500 bg-orange-100 h-2 rounded-lg"
          />
          <div className="flex justify-between text-sm text-orange-700 mt-2 font-medium">
            <span className="bg-orange-100 px-2 py-1 rounded">🏃‍♂️ 5 km</span>
            <span className="bg-orange-100 px-2 py-1 rounded">🚗 50 km</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3 p-4 border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-500 hover:scale-105">
          <Checkbox
            id="remoteCapable"
            checked={formData.availability?.remoteCapable || false}
            onCheckedChange={(checked: boolean) => updateAvailability('remoteCapable', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-600 data-[state=checked]:border-cyan-600 border-2 border-blue-400 w-5 h-5"
          />
          <Label htmlFor="remoteCapable" className="font-semibold text-blue-800 cursor-pointer hover:text-cyan-700 flex items-center gap-2">
            💻 Can provide remote assistance (video calls)
          </Label>
        </div>
        
        <div className="flex items-center space-x-3 p-4 border-2 border-teal-400 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-teal-500 hover:scale-105">
          <Checkbox
            id="flexibleSchedule"
            checked={formData.availability?.flexibleSchedule || false}
            onCheckedChange={(checked: boolean) => updateAvailability('flexibleSchedule', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-emerald-600 data-[state=checked]:border-emerald-600 border-2 border-teal-400 w-5 h-5"
          />
          <Label htmlFor="flexibleSchedule" className="font-semibold text-teal-800 cursor-pointer hover:text-emerald-700 flex items-center gap-2">
            ⏰ Flexible with scheduling
          </Label>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg border border-pink-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-800">
          <MapPin className="h-5 w-5 text-pink-600" />
          🗺️ Location Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-pink-800 font-semibold flex items-center gap-2">
              🏠 Address *
            </Label>
            <Textarea
              id="address"
              value={formData.location?.address || ''}
              onChange={(e) => updateLocation('address', e.target.value)}
              className={`min-h-[60px] w-full rounded-md border-2 mt-2 font-medium transition-colors ${errors.address ? 'border-red-500 bg-red-50' : 'border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50 hover:bg-pink-50'} px-3 py-2 text-sm shadow-lg placeholder:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:border-pink-600`}
              placeholder="🏡 House/Flat number, Street, Area"
              rows={2}
            />
            {errors.address && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.address}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-purple-800 font-semibold flex items-center gap-2">
                🏙️ City *
              </Label>
              <Input
                id="city"
                value={formData.location?.city || ''}
                onChange={(e) => updateLocation('city', e.target.value)}
                className={`border-2 font-medium transition-colors mt-2 ${errors.city ? 'border-red-500 bg-red-50' : 'border-purple-400 bg-white hover:bg-purple-50 focus:border-pink-500'}`}
                placeholder="🌆 City name"
              />
              {errors.city && <p className="text-red-600 text-sm mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200">⚠️ {errors.city}</p>}
            </div>
            
            <div>
              <Label htmlFor="state" className="text-blue-800 font-semibold flex items-center gap-2">
                🏞️ State
              </Label>
              <Input
                id="state"
                value={formData.location?.state || ''}
                onChange={(e) => updateLocation('state', e.target.value)}
                className="border-2 border-blue-400 bg-white hover:bg-blue-50 focus:border-purple-500 font-medium transition-colors mt-2"
                placeholder="🗺️ State name"
              />
            </div>
            
            <div>
              <Label htmlFor="pincode" className="text-green-800 font-semibold flex items-center gap-2">
                📮 PIN Code
              </Label>
              <Input
                id="pincode"
                value={formData.location?.pincode || ''}
                onChange={(e) => updateLocation('pincode', e.target.value)}
                className="border-2 border-green-400 bg-white hover:bg-green-50 focus:border-purple-500 font-medium transition-colors mt-2"
                placeholder="📫 6-digit PIN code"
                maxLength={6}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VerificationTrainingStep({ formData }: any) {
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl">
      <div className="text-center bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg border border-green-200">
        <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2 text-green-800 flex items-center justify-center gap-2">
          🛡️ Final Steps
        </h3>
        <p className="text-green-700 font-medium">✨ Verification and training requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-blue-200">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <FileText className="h-5 w-5 text-blue-600" />
              📋 Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300 hover:shadow-md transition-all duration-300">
              <Upload className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">🆔 Government ID</p>
                <p className="text-sm text-green-700">Aadhaar, Passport, or Driver's License</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-300 hover:shadow-md transition-all duration-300">
              <Upload className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-800">🎓 Educational Certificates</p>
                <p className="text-sm text-purple-700">Highest qualification documents</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border border-orange-300 hover:shadow-md transition-all duration-300">
              <Upload className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-800">🏠 Address Proof</p>
                <p className="text-sm text-orange-700">Utility bill or bank statement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              <Star className="h-5 w-5 text-purple-600" />
              ⭐ Training Process
              Training Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-300 hover:shadow-md transition-all duration-300">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">📖 Scribe Guidelines</p>
                <p className="text-sm text-blue-700">⏰ 30 minutes • Required</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border border-green-300 hover:shadow-md transition-all duration-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">♿ Disability Awareness</p>
                <p className="text-sm text-green-700">⏱️ 45 minutes • Required</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-300 hover:shadow-md transition-all duration-300">
              <CheckCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">💬 Communication Skills</p>
                <p className="text-sm text-yellow-700">⌚ 20 minutes • Optional</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-6 shadow-lg">
        <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
          🔍 Verification Process
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            <span className="font-medium text-green-800">📄 Document verification (1-2 business days)</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            <span className="font-medium text-blue-800">🔍 Background check (3-5 business days)</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span className="font-medium text-purple-800">📚 Complete training modules</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
            <span className="font-medium text-orange-800">📞 Phone interview with coordinator</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
            <span className="font-medium text-teal-800">✅ Profile activation and matching begins</span>
          </div>
        </div>
      </div>

      <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg border border-blue-200">
        <p className="text-blue-800 font-medium text-sm sm:text-base">
          📧 After completing registration, you'll receive an email with next steps and document upload links.
        </p>
      </div>
    </div>
  )
}

export default ScribeRegistration