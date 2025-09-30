/**
 * Student Registration Component
 * Comprehensive registration form for blind/visually impaired students
 * Includes voice support and accessibility features
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
  Heart,
  Shield,
  FileText,
  Mic,
  Volume2,
  Eye,
  AlertCircle,
  CheckCircle,
  Upload,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react'
import type { 
  StudentProfile, 
  DisabilityType, 
  SubjectCategory, 
  LanguageOption,
  Location 
} from '@/types/scribe-system'
import RegistrationSuccess from './RegistrationSuccess'

interface StudentRegistrationProps {
  onRegistrationComplete: (profile: StudentProfile) => void
  enableVoiceSupport?: boolean
}

export function StudentRegistration({ 
  onRegistrationComplete, 
  enableVoiceSupport = true 
}: StudentRegistrationProps) {
  // Form state management
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedProfile, setCompletedProfile] = useState<StudentProfile | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Voice support
  const [isListening, setIsListening] = useState(false)
  const [voiceInstructions, setVoiceInstructions] = useState('')
  
  // Form data
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    },
    disability: {
      type: 'blind',
      severity: 'complete',
      details: '',
      accommodationsNeeded: []
    },
    academic: {
      institution: '',
      course: '',
      year: 1,
      previousExamExperience: false,
      preferredSubjects: [],
      languagePreference: []
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
    preferences: {
      maxTravelDistance: 10,
      specialRequirements: ''
    }
  })

  // Step configuration
  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Disability Details', icon: Eye },
    { id: 3, title: 'Academic Information', icon: BookOpen },
    { id: 4, title: 'Location & Preferences', icon: MapPin },
    { id: 5, title: 'Verification & Review', icon: Shield }
  ]

  // Constants
  const disabilityTypes: { value: DisabilityType; label: string; description: string }[] = [
    { 
      value: 'blind', 
      label: 'Complete Blindness', 
      description: 'No vision or light perception' 
    },
    { 
      value: 'visually_impaired', 
      label: 'Severe Visual Impairment', 
      description: 'Significant vision loss affecting daily activities' 
    },
    { 
      value: 'low_vision', 
      label: 'Low Vision', 
      description: 'Some usable vision but requires assistance' 
    }
  ]

  const subjects: { value: SubjectCategory; label: string }[] = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'social_studies', label: 'Social Studies' },
    { value: 'languages', label: 'Languages' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'arts', label: 'Arts' },
    { value: 'technical', label: 'Technical/Engineering' }
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

  const accommodations = [
    'Extra time (25% additional)',
    'Extra time (50% additional)', 
    'Separate room',
    'Large font materials',
    'Magnification device',
    'Computer with screen reader',
    'Audio instructions',
    'Tactile materials',
    'Braille materials',
    'Personal assistant',
    'Frequent breaks',
    'Special seating'
  ]

  // Voice support initialization
  useEffect(() => {
    if (enableVoiceSupport) {
      setVoiceInstructions(getStepInstructions(currentStep))
      speakInstructions(getStepInstructions(currentStep))
    }
  }, [currentStep, enableVoiceSupport])

  // Voice support functions
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
      1: 'Welcome to student registration. In this step, please provide your personal information including your name, email, phone number, date of birth, and emergency contact details. You can use voice commands or fill the form manually.',
      2: 'Now we need information about your visual impairment. Please specify your disability type, severity, and any special accommodations you need during exams.',
      3: 'Please provide your academic information including your educational institution, course of study, year, and subject preferences.',
      4: 'In this step, provide your location details and preferences for scribe matching, including maximum travel distance.',
      5: 'Final step: Review all your information and upload verification documents. Once submitted, your profile will be verified by our team.'
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
        if (!formData.personalInfo?.emergencyContact?.name) newErrors.emergencyName = 'Emergency contact name is required'
        if (!formData.personalInfo?.emergencyContact?.phone) newErrors.emergencyPhone = 'Emergency contact phone is required'
        break
        
      case 2:
        if (!formData.disability?.details) newErrors.disabilityDetails = 'Please describe your visual impairment'
        if (!formData.disability?.accommodationsNeeded?.length) newErrors.accommodations = 'Please select at least one accommodation'
        break
        
      case 3:
        if (!formData.academic?.institution) newErrors.institution = 'Institution name is required'
        if (!formData.academic?.course) newErrors.course = 'Course name is required'
        if (!formData.academic?.preferredSubjects?.length) newErrors.subjects = 'Please select at least one subject'
        if (!formData.academic?.languagePreference?.length) newErrors.languages = 'Please select at least one language'
        break
        
      case 4:
        if (!formData.location?.address) newErrors.address = 'Address is required'
        if (!formData.location?.city) newErrors.city = 'City is required'
        if (!formData.location?.state) newErrors.state = 'State is required'
        if (!formData.location?.pincode) newErrors.pincode = 'PIN code is required'
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
      // Create complete student profile
      const studentProfile: StudentProfile = {
        id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: `user_${Date.now()}`, // Would come from auth system
        personalInfo: formData.personalInfo!,
        disability: formData.disability!,
        academic: formData.academic!,
        location: formData.location!,
        preferences: formData.preferences!,
        verification: {
          isVerified: false,
          documents: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Show success screen first
      setCompletedProfile(studentProfile)
      setIsCompleted(true)
      
      if (enableVoiceSupport) {
        speakInstructions('Registration completed successfully! Your profile has been submitted for verification.')
      }

      // Call completion handler after delay
      setTimeout(() => {
        onRegistrationComplete(studentProfile)
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
        return <DisabilityInfoStep formData={formData} setFormData={setFormData} errors={errors} disabilityTypes={disabilityTypes} accommodations={accommodations} />
      case 3:
        return <AcademicInfoStep formData={formData} setFormData={setFormData} errors={errors} subjects={subjects} languages={languages} />
      case 4:
        return <LocationPreferencesStep formData={formData} setFormData={setFormData} errors={errors} />
      case 5:
        return <VerificationStep formData={formData} />
      default:
        return null
    }
  }

  // Show success screen if registration is completed
  if (isCompleted && completedProfile) {
    return (
      <RegistrationSuccess
        type="student"
        name={completedProfile?.personalInfo?.name || 'Student'}
        onComplete={() => {
          // This will be called after the countdown
          setIsCompleted(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-xl lg:shadow-2xl border-2 border-gradient-to-r from-blue-400 to-purple-400 overflow-hidden">
          <CardHeader className="text-center p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Student Registration
            </CardTitle>
            <p className="text-blue-700 mt-2 font-medium text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              Register to connect with qualified scribes for your exams
            </p>
            
            {enableVoiceSupport && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Voice Support Active</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-600 mt-1 text-center">
                  Listen for audio instructions or use voice commands to navigate
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-3 sm:p-4 lg:p-6">
            {/* Progress indicator */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              {/* Desktop step indicator */}
              <div className="hidden lg:flex justify-between items-center mb-6 overflow-x-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0 min-w-0">
                    <div className={`
                      flex items-center justify-center w-10 h-10 xl:w-12 xl:h-12 rounded-full border-2 transition-all duration-300
                      ${currentStep > step.id 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-500 text-white shadow-lg' 
                        : currentStep === step.id 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white shadow-lg animate-pulse' 
                          : 'bg-orange-200 border-orange-400 text-orange-600'
                      }
                    `}>
                      {currentStep > step.id ? (
                        <CheckCircle className="h-5 w-5 xl:h-6 xl:w-6" />
                      ) : (
                        <step.icon className="h-5 w-5 xl:h-6 xl:w-6" />
                      )}
                    </div>
                    <span className={`ml-2 xl:ml-3 text-sm xl:text-base font-bold truncate max-w-32 xl:max-w-40 ${
                      currentStep >= step.id ? 'text-blue-800' : 'text-purple-600'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-8 xl:w-12 h-1 ml-3 xl:ml-4 rounded-full transition-all duration-300 ${
                        currentStep > step.id ? 'bg-gradient-to-r from-emerald-400 to-green-400' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Tablet step indicator */}
              <div className="hidden sm:flex lg:hidden justify-center items-center mb-4 overflow-x-auto px-2">
                <div className="flex items-center gap-1 min-w-max">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                        ${currentStep > step.id 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-500 text-white' 
                          : currentStep === step.id 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white animate-pulse' 
                            : 'bg-orange-200 border-orange-400 text-orange-600'
                        }
                      `}>
                        {currentStep > step.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-4 h-0.5 mx-1 rounded-full transition-all duration-300 ${
                          currentStep > step.id ? 'bg-gradient-to-r from-emerald-400 to-green-400' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile step indicator */}
              <div className="sm:hidden mb-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white shadow-lg animate-pulse
                  `}>
                    {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-800">
                      Step {currentStep} of {steps.length}
                    </div>
                    <div className="text-xs font-bold text-purple-700">
                      {steps[currentStep - 1].title}
                    </div>
                  </div>
                </div>
                
                {/* Mobile progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
                <div className="text-center text-xs text-green-700 font-bold">
                  {Math.round((currentStep / steps.length) * 100)}% Complete
                </div>
              </div>
            </div>
            
            {/* Step content with responsive container */}
            <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] p-2 sm:p-4 lg:p-6">
              {renderStepContent()}
            </div>

            {/* Navigation buttons - Mobile-first responsive */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-2 border-blue-300">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="order-2 sm:order-1 w-full sm:w-auto flex items-center justify-center gap-2 border-blue-500 text-blue-700 hover:bg-blue-50 font-bold py-2 sm:py-3 px-4 sm:px-6 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Previous</span>
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg py-2 sm:py-3 px-4 sm:px-6"
                >
                  <span className="text-sm sm:text-base">Next</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-lg py-2 sm:py-3 px-4 sm:px-6 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-sm sm:text-base">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Complete Registration</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Main registration form - Call the main render function
  return renderMainForm()
}

function renderMainForm() {
  // This function was moved outside, we'll create step components below
  return null
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="name" className="text-sm font-bold text-blue-800 bg-gradient-to-r from-blue-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm">Full Name *</Label>
          <Input
            id="name"
            value={formData.personalInfo?.name || ''}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            className={`${errors.name ? 'border-red-500 bg-red-50 text-red-900' : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900'} font-medium`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <Label htmlFor="email" className="text-sm font-bold text-purple-800 bg-gradient-to-r from-purple-100 to-violet-100 px-2 py-1 rounded-md shadow-sm">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.personalInfo?.email || ''}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            className={`${errors.email ? 'border-red-500 bg-red-50 text-red-900' : 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-900'} font-medium`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <Label htmlFor="phone" className="text-sm font-bold text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-md shadow-sm">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.personalInfo?.phone || ''}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            className={`${errors.phone ? 'border-red-500 bg-red-50 text-red-900' : 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-900'} font-medium`}
            placeholder="+91 98765 43210"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div>
          <Label htmlFor="dateOfBirth" className="text-sm font-bold text-orange-800 bg-gradient-to-r from-orange-100 to-yellow-100 px-2 py-1 rounded-md shadow-sm">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.personalInfo?.dateOfBirth || ''}
            onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)}
            className={`${errors.dateOfBirth ? 'border-red-500 bg-red-50 text-red-900' : 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-900'} font-medium`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>
      </div>

      <div className="border-t-4 border-gradient-to-r from-rose-500 to-pink-500 pt-6 bg-gradient-to-r from-rose-50 to-pink-50 p-4 sm:p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-800">
          <Heart className="h-5 w-5 text-rose-600" />
          Emergency Contact Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyName" className="text-sm font-bold text-rose-800 bg-gradient-to-r from-rose-100 to-pink-100 px-2 py-1 rounded-md shadow-sm">Contact Name *</Label>
            <Input
              id="emergencyName"
              value={formData.personalInfo?.emergencyContact?.name || ''}
              onChange={(e) => updateEmergencyContact('name', e.target.value)}
              className={`${errors.emergencyName ? 'border-red-500 bg-red-50 text-red-900' : 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-900'} font-medium`}
              placeholder="Emergency contact name"
            />
            {errors.emergencyName && <p className="text-red-500 text-sm mt-1">{errors.emergencyName}</p>}
          </div>
          
          <div>
            <Label htmlFor="emergencyPhone" className="text-sm font-bold text-teal-800 bg-gradient-to-r from-teal-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm">Contact Phone *</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={formData.personalInfo?.emergencyContact?.phone || ''}
              onChange={(e) => updateEmergencyContact('phone', e.target.value)}
              className={`${errors.emergencyPhone ? 'border-red-500 bg-red-50 text-red-900' : 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-900'} font-medium`}
              placeholder="+91 98765 43210"
            />
            {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <Label htmlFor="emergencyRelation" className="text-sm font-bold text-indigo-800 bg-gradient-to-r from-indigo-100 to-purple-100 px-2 py-1 rounded-md shadow-sm">Relationship</Label>
            <Select onValueChange={(value: string) => updateEmergencyContact('relation', value)}>
              <SelectTrigger className="border-2 border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 font-medium">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
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

function DisabilityInfoStep({ formData, setFormData, errors, disabilityTypes, accommodations }: any) {
  const updateDisability = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      disability: {
        ...prev.disability,
        [field]: value
      }
    }))
  }

  const toggleAccommodation = (accommodation: string) => {
    const current = formData.disability?.accommodationsNeeded || []
    const updated = current.includes(accommodation)
      ? current.filter((a: string) => a !== accommodation)
      : [...current, accommodation]
    updateDisability('accommodationsNeeded', updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Type of Visual Impairment *</Label>
        <RadioGroup 
          value={formData.disability?.type || ''} 
          onValueChange={(value: string) => updateDisability('type', value)}
          className="mt-3"
        >
          {disabilityTypes.map((type: any) => (
            <div key={type.value} className="flex items-start space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
              <div>
                <Label htmlFor={type.value} className="font-medium">{type.label}</Label>
                <p className="text-sm text-purple-700 font-medium">{type.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="severity">Severity Level</Label>
        <Select onValueChange={(value: string) => updateDisability('severity', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select severity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complete">Complete - No vision or light perception</SelectItem>
            <SelectItem value="partial">Partial - Some vision remaining</SelectItem>
            <SelectItem value="progressive">Progressive - Vision loss over time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="disabilityDetails" className="text-sm font-bold text-blue-800 bg-gradient-to-r from-blue-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm">Detailed Description *</Label>
        <Textarea
          id="disabilityDetails"
          value={formData.disability?.details || ''}
          onChange={(e) => updateDisability('details', e.target.value)}
          className={`min-h-[60px] w-full rounded-md border-2 ${errors.disabilityDetails ? 'border-red-500 bg-red-50 text-red-900' : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900'} px-3 py-2 text-sm font-medium shadow-lg placeholder:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-600 disabled:cursor-not-allowed disabled:opacity-75`}
          placeholder="Please provide details about your visual impairment, when it occurred, and how it affects your daily activities and exam taking..."
          rows={4}
        />
        {errors.disabilityDetails && <p className="text-red-500 text-sm mt-1">{errors.disabilityDetails}</p>}
      </div>

      <div>
        <Label className="text-lg font-bold text-indigo-800 bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-2 rounded-md shadow-sm">Required Accommodations *</Label>
        <p className="text-sm text-indigo-700 mb-3 font-medium">Select all accommodations you need during exams</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accommodations.map((accommodation: string) => (
            <div key={accommodation} className="flex items-center space-x-3 p-3 border-2 border-gradient-to-r from-pink-400 to-purple-500 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:border-pink-500">
              <Checkbox
                id={accommodation}
                checked={formData.disability?.accommodationsNeeded?.includes(accommodation) || false}
                onCheckedChange={() => toggleAccommodation(accommodation)}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-purple-600 border-2 border-pink-400 w-5 h-5"
              />
              <Label htmlFor={accommodation} className="text-sm font-medium text-purple-800 cursor-pointer hover:text-pink-700">{accommodation}</Label>
            </div>
          ))}
        </div>
        {errors.accommodations && <p className="text-red-500 text-sm mt-1">{errors.accommodations}</p>}
      </div>
    </div>
  )
}

function AcademicInfoStep({ formData, setFormData, errors, subjects, languages }: any) {
  const updateAcademic = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      academic: {
        ...prev.academic,
        [field]: value
      }
    }))
  }

  const toggleSubject = (subject: string) => {
    const current = formData.academic?.preferredSubjects || []
    const updated = current.includes(subject)
      ? current.filter((s: string) => s !== subject)
      : [...current, subject]
    updateAcademic('preferredSubjects', updated)
  }

  const toggleLanguage = (language: string) => {
    const current = formData.academic?.languagePreference || []
    const updated = current.includes(language)
      ? current.filter((l: string) => l !== language)
      : [...current, language]
    updateAcademic('languagePreference', updated)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="institution" className="text-sm font-bold text-purple-800 bg-gradient-to-r from-purple-100 to-violet-100 px-2 py-1 rounded-md shadow-sm">Educational Institution *</Label>
          <Input
            id="institution"
            value={formData.academic?.institution || ''}
            onChange={(e) => updateAcademic('institution', e.target.value)}
            className={`${errors.institution ? 'border-red-500 bg-red-50 text-red-900' : 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-900'} font-medium`}
            placeholder="Name of your school/college/university"
          />
          {errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution}</p>}
        </div>
        
        <div>
          <Label htmlFor="course" className="text-sm font-bold text-indigo-800 bg-gradient-to-r from-indigo-100 to-blue-100 px-2 py-1 rounded-md shadow-sm">Course/Program *</Label>
          <Input
            id="course"
            value={formData.academic?.course || ''}
            onChange={(e) => updateAcademic('course', e.target.value)}
            className={`${errors.course ? 'border-red-500 bg-red-50 text-red-900' : 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900'} font-medium`}
            placeholder="e.g., B.Sc Computer Science, Class 12th Science"
          />
          {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
        </div>
        
        <div>
          <Label htmlFor="year" className="text-sm font-bold text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-md shadow-sm">Current Year/Class</Label>
          <Select onValueChange={(value: string) => updateAcademic('year', parseInt(value))}>
            <SelectTrigger className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 font-medium">
              <SelectValue placeholder="Select year/class" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year <= 12 ? `Class ${year}` : `Year ${year - 12}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-3 p-3 border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:border-orange-500">
          <Checkbox
            id="previousExperience"
            checked={formData.academic?.previousExamExperience || false}
            onCheckedChange={(checked: boolean) => updateAcademic('previousExamExperience', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-yellow-600 data-[state=checked]:border-yellow-600 border-2 border-orange-400 w-5 h-5"
          />
          <Label htmlFor="previousExperience" className="font-medium text-orange-800 cursor-pointer hover:text-yellow-700">I have previous experience with scribe-assisted exams</Label>
        </div>
      </div>

      <div>
        <Label className="text-lg font-bold text-cyan-800 bg-gradient-to-r from-cyan-100 to-teal-100 px-3 py-2 rounded-md shadow-sm">Preferred Subjects *</Label>
        <p className="text-sm text-cyan-700 mb-3 font-medium">Select subjects you commonly take exams in</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subjects.map((subject: any) => (
            <div
              key={subject.value}
              onClick={() => toggleSubject(subject.value)}
              className={`
                p-3 border-2 rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg
                ${formData.academic?.preferredSubjects?.includes(subject.value)
                  ? 'border-cyan-500 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800'
                  : 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-teal-50 hover:border-cyan-400 text-cyan-700'
                }
              `}
            >
              <div className="text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-1" />
                <p className="text-sm font-bold">{subject.label}</p>
              </div>
            </div>
          ))}
        </div>
        {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
      </div>

      <div>
        <Label className="text-lg font-bold text-rose-800 bg-gradient-to-r from-rose-100 to-pink-100 px-3 py-2 rounded-md shadow-sm">Language Preferences *</Label>
        <p className="text-sm text-rose-700 mb-3 font-medium">Select languages you prefer for exam instructions and assistance</p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {languages.map((language: any) => (
            <Badge
              key={language.value}
              variant={formData.academic?.languagePreference?.includes(language.value) ? 'default' : 'outline'}
              className={`p-3 cursor-pointer justify-center font-bold shadow-md hover:shadow-lg transition-all ${
                formData.academic?.languagePreference?.includes(language.value) 
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-2 border-rose-500' 
                  : 'border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-800 hover:border-rose-400'
              }`}
              onClick={() => toggleLanguage(language.value)}
            >
              {language.label}
            </Badge>
          ))}
        </div>
        {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
      </div>
    </div>
  )
}

function LocationPreferencesStep({ formData, setFormData, errors }: any) {
  const updateLocation = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const updatePreferences = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-800 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-2 rounded-md shadow-sm">
          <MapPin className="h-5 w-5 text-emerald-600" />
          Address Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-sm font-bold text-emerald-800 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-1 rounded-md shadow-sm">Full Address *</Label>
            <Textarea
              id="address"
              value={formData.location?.address || ''}
              onChange={(e) => updateLocation('address', e.target.value)}
              className={`min-h-[60px] w-full rounded-md border-2 ${errors.address ? 'border-red-500 bg-red-50 text-red-900' : 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-900'} px-3 py-2 text-sm font-medium shadow-lg placeholder:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-600`}
              placeholder="House/Flat number, Street, Area"
              rows={2}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-bold text-blue-800 bg-gradient-to-r from-blue-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm">City *</Label>
              <Input
                id="city"
                value={formData.location?.city || ''}
                onChange={(e) => updateLocation('city', e.target.value)}
                className={`${errors.city ? 'border-red-500 bg-red-50 text-red-900' : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900'} font-medium`}
                placeholder="City name"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            
            <div>
              <Label htmlFor="state" className="text-sm font-bold text-purple-800 bg-gradient-to-r from-purple-100 to-violet-100 px-2 py-1 rounded-md shadow-sm">State *</Label>
              <Input
                id="state"
                value={formData.location?.state || ''}
                onChange={(e) => updateLocation('state', e.target.value)}
                className={`${errors.state ? 'border-red-500 bg-red-50 text-red-900' : 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-900'} font-medium`}
                placeholder="State name"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
            
            <div>
              <Label htmlFor="pincode" className="text-sm font-bold text-orange-800 bg-gradient-to-r from-orange-100 to-yellow-100 px-2 py-1 rounded-md shadow-sm">PIN Code *</Label>
              <Input
                id="pincode"
                value={formData.location?.pincode || ''}
                onChange={(e) => updateLocation('pincode', e.target.value)}
                className={`${errors.pincode ? 'border-red-500 bg-red-50 text-red-900' : 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-900'} font-medium`}
                placeholder="6-digit PIN code"
                maxLength={6}
              />
              {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="landmark" className="text-sm font-bold text-teal-800 bg-gradient-to-r from-teal-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={formData.location?.landmark || ''}
              onChange={(e) => updateLocation('landmark', e.target.value)}
              className="border-2 border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-900 font-medium"
              placeholder="Nearby landmark for easy identification"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 text-indigo-800 bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-2 rounded-md shadow-sm">Scribe Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="maxDistance" className="text-sm font-bold text-pink-800 bg-gradient-to-r from-pink-100 to-rose-100 px-2 py-1 rounded-md shadow-sm">Maximum Travel Distance: {formData.preferences?.maxTravelDistance || 10} km</Label>
            <input
              type="range"
              id="maxDistance"
              min="5"
              max="50"
              step="5"
              value={formData.preferences?.maxTravelDistance || 10}
              onChange={(e) => updatePreferences('maxTravelDistance', parseInt(e.target.value))}
              className="w-full mt-2 h-3 bg-gradient-to-r from-pink-200 to-rose-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-sm text-pink-700 font-medium mt-1">
              <span>5 km</span>
              <span>50 km</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="scribeGender" className="text-sm font-bold text-violet-800 bg-gradient-to-r from-violet-100 to-purple-100 px-2 py-1 rounded-md shadow-sm">Preferred Scribe Gender</Label>
            <Select onValueChange={(value: string) => updatePreferences('scribeGender', value)}>
              <SelectTrigger className="border-2 border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-900 font-medium">
                <SelectValue placeholder="Any gender preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">No preference</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="specialRequirements" className="text-sm font-bold text-rose-800 bg-gradient-to-r from-rose-100 to-pink-100 px-2 py-1 rounded-md shadow-sm">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={formData.preferences?.specialRequirements || ''}
              onChange={(e) => updatePreferences('specialRequirements', e.target.value)}
              className="min-h-[60px] w-full rounded-md border-2 border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-900 px-3 py-2 text-sm font-medium shadow-lg placeholder:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:border-rose-600"
              placeholder="Any specific requirements or preferences for your scribe (e.g., experience with specific subjects, communication style, etc.)"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function VerificationStep({ formData }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Review Your Information</h3>
        <p className="text-emerald-700 font-medium">Please review all details before submitting your registration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-4 border-blue-600 bg-gradient-to-r from-blue-200 to-cyan-200 shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <User className="h-7 w-7" />
              👤 Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 bg-gradient-to-r from-blue-100 to-cyan-100">
            <p className="text-blue-900 font-bold text-base bg-blue-50 p-3 rounded-lg border-2 border-blue-400"><strong className="text-blue-800">Name:</strong> <span className="text-blue-900">{formData.personalInfo?.name || 'Not provided'}</span></p>
            <p className="text-blue-900 font-bold text-base bg-blue-50 p-3 rounded-lg border-2 border-blue-400"><strong className="text-blue-800">Email:</strong> <span className="text-blue-900">{formData.personalInfo?.email || 'Not provided'}</span></p>
            <p className="text-blue-900 font-bold text-base bg-blue-50 p-3 rounded-lg border-2 border-blue-400"><strong className="text-blue-800">Phone:</strong> <span className="text-blue-900">{formData.personalInfo?.phone || 'Not provided'}</span></p>
            <p className="text-blue-900 font-bold text-base bg-blue-50 p-3 rounded-lg border-2 border-blue-400"><strong className="text-blue-800">Date of Birth:</strong> <span className="text-blue-900">{formData.personalInfo?.dateOfBirth || 'Not provided'}</span></p>
            <p className="text-blue-900 font-bold text-base bg-blue-50 p-3 rounded-lg border-2 border-blue-400"><strong className="text-blue-800">Emergency Contact:</strong> <span className="text-blue-900">{formData.personalInfo?.emergencyContact?.name || 'Not provided'}</span></p>
            <p className="text-blue-900 font-bold text-base bg-blue-50 p-3 rounded-lg border-2 border-blue-400"><strong className="text-blue-800">Emergency Phone:</strong> <span className="text-blue-900">{formData.personalInfo?.emergencyContact?.phone || 'Not provided'}</span></p>
          </CardContent>
        </Card>

        <Card className="border-4 border-purple-600 bg-gradient-to-r from-purple-200 to-violet-200 shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Eye className="h-7 w-7" />
              👁️ Disability Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 bg-gradient-to-r from-purple-100 to-violet-100">
            <p className="text-purple-900 font-bold text-base bg-purple-50 p-3 rounded-lg border-2 border-purple-400"><strong className="text-purple-800">Type:</strong> <span className="text-purple-900">{formData.disability?.type || 'Not specified'}</span></p>
            <p className="text-purple-900 font-bold text-base bg-purple-50 p-3 rounded-lg border-2 border-purple-400"><strong className="text-purple-800">Severity:</strong> <span className="text-purple-900">{formData.disability?.severity || 'Not specified'}</span></p>
            <p className="text-purple-900 font-bold text-base bg-purple-50 p-3 rounded-lg border-2 border-purple-400"><strong className="text-purple-800">Details:</strong> <span className="text-purple-900">{formData.disability?.details ? formData.disability.details.substring(0, 50) + '...' : 'Not provided'}</span></p>
            <p className="text-purple-900 font-bold text-base bg-purple-50 p-3 rounded-lg border-2 border-purple-400"><strong className="text-purple-800">Accommodations:</strong> <span className="text-purple-900">{formData.disability?.accommodationsNeeded?.length || 0} selected</span></p>
            {formData.disability?.accommodationsNeeded?.length > 0 && (
              <div className="mt-3 bg-purple-50 p-3 rounded-lg border-2 border-purple-400">
                <p className="text-purple-800 text-base font-bold mb-2">Selected Accommodations:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.disability.accommodationsNeeded.slice(0, 3).map((acc: string, idx: number) => (
                    <span key={idx} className="text-sm bg-purple-300 text-purple-900 px-3 py-2 rounded-lg font-bold border-2 border-purple-500">
                      {acc}
                    </span>
                  ))}
                  {formData.disability.accommodationsNeeded.length > 3 && (
                    <span className="text-sm text-purple-700 font-bold bg-purple-200 px-3 py-2 rounded-lg">+{formData.disability.accommodationsNeeded.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-4 border-green-600 bg-gradient-to-r from-green-200 to-emerald-200 shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <BookOpen className="h-7 w-7" />
              📚 Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 bg-gradient-to-r from-green-100 to-emerald-100">
            <p className="text-green-900 font-bold text-base bg-green-50 p-3 rounded-lg border-2 border-green-400"><strong className="text-green-800">Institution:</strong> <span className="text-green-900">{formData.academic?.institution || 'Not provided'}</span></p>
            <p className="text-green-900 font-bold text-base bg-green-50 p-3 rounded-lg border-2 border-green-400"><strong className="text-green-800">Course:</strong> <span className="text-green-900">{formData.academic?.course || 'Not provided'}</span></p>
            <p className="text-green-900 font-bold text-base bg-green-50 p-3 rounded-lg border-2 border-green-400"><strong className="text-green-800">Year/Class:</strong> <span className="text-green-900">{formData.academic?.year || 'Not provided'}</span></p>
            <p className="text-green-900 font-bold text-base bg-green-50 p-3 rounded-lg border-2 border-green-400"><strong className="text-green-800">Subjects:</strong> <span className="text-green-900">{formData.academic?.preferredSubjects?.length || 0} selected</span></p>
            {formData.academic?.preferredSubjects?.length > 0 && (
              <div className="mt-3 bg-green-50 p-3 rounded-lg border-2 border-green-400">
                <p className="text-green-800 text-base font-bold mb-2">Selected Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.academic.preferredSubjects.slice(0, 4).map((subject: string, idx: number) => (
                    <span key={idx} className="text-sm bg-green-300 text-green-900 px-3 py-2 rounded-lg font-bold border-2 border-green-500">
                      {subject}
                    </span>
                  ))}
                  {formData.academic.preferredSubjects.length > 4 && (
                    <span className="text-sm text-green-700 font-bold bg-green-200 px-3 py-2 rounded-lg">+{formData.academic.preferredSubjects.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
            <p className="text-green-900 font-bold text-base bg-green-50 p-3 rounded-lg border-2 border-green-400"><strong className="text-green-800">Languages:</strong> <span className="text-green-900">{formData.academic?.languagePreference?.length || 0} selected</span></p>
            {formData.academic?.languagePreference?.length > 0 && (
              <div className="mt-3 bg-green-50 p-3 rounded-lg border-2 border-green-400">
                <p className="text-green-800 text-base font-bold mb-2">Preferred Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.academic.languagePreference.slice(0, 3).map((lang: string, idx: number) => (
                    <span key={idx} className="text-sm bg-green-300 text-green-900 px-3 py-2 rounded-lg font-bold border-2 border-green-500">
                      {lang}
                    </span>
                  ))}
                  {formData.academic.languagePreference.length > 3 && (
                    <span className="text-sm text-green-700 font-bold bg-green-200 px-3 py-2 rounded-lg">+{formData.academic.languagePreference.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-4 border-orange-600 bg-gradient-to-r from-orange-200 to-yellow-200 shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <MapPin className="h-7 w-7" />
              📍 Location & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 bg-gradient-to-r from-orange-100 to-yellow-100">
            <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">Address:</strong> <span className="text-orange-900">{formData.location?.address || 'Not provided'}</span></p>
            <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">City:</strong> <span className="text-orange-900">{formData.location?.city || 'Not provided'}, {formData.location?.state || 'Not provided'}</span></p>
            <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">PIN Code:</strong> <span className="text-orange-900">{formData.location?.pincode || 'Not provided'}</span></p>
            <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">Landmark:</strong> <span className="text-orange-900">{formData.location?.landmark || 'Not provided'}</span></p>
            <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">Max Travel Distance:</strong> <span className="text-orange-900">{formData.preferences?.maxTravelDistance || 10} km</span></p>
            <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">Scribe Gender Preference:</strong> <span className="text-orange-900">{formData.preferences?.scribeGender || 'No preference'}</span></p>
            {formData.preferences?.specialRequirements && (
              <p className="text-orange-900 font-bold text-base bg-orange-50 p-3 rounded-lg border-2 border-orange-400"><strong className="text-orange-800">Special Requirements:</strong> <span className="text-orange-900">{formData.preferences.specialRequirements.substring(0, 60)}...</span></p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-lg p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <AlertCircle className="h-8 w-8 text-yellow-600 mt-0.5 flex-shrink-0 animate-bounce" />
          <div className="w-full">
            <h4 className="font-bold text-yellow-800 text-xl mb-3 flex items-center gap-2">
              🎉 Registration Almost Complete!
            </h4>
            <div className="bg-gradient-to-r from-orange-200 to-red-200 border-4 border-orange-500 rounded-xl p-4 mb-4 shadow-xl">
              <h5 className="font-bold text-orange-900 text-2xl mb-3 flex items-center gap-2">
                � Next Steps - Your Journey Ahead!
              </h5>
              <ul className="text-base text-orange-900 space-y-4 font-bold">
                <li className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-400 shadow-md">
                  <span className="text-orange-600 font-bold text-2xl bg-orange-200 rounded-full w-10 h-10 flex items-center justify-center">1️⃣</span>
                  <div>
                    <p className="text-orange-900 font-bold">Lightning Fast Review!</p>
                    <p className="text-orange-800 text-sm">Your registration will be reviewed by our verification team within 24 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-400 shadow-md">
                  <span className="text-blue-600 font-bold text-2xl bg-blue-200 rounded-full w-10 h-10 flex items-center justify-center">2️⃣</span>
                  <div>
                    <p className="text-blue-900 font-bold">Possible Contact</p>
                    <p className="text-blue-800 text-sm">You may be contacted for additional documentation via email or phone</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border-2 border-purple-400 shadow-md">
                  <span className="text-purple-600 font-bold text-2xl bg-purple-200 rounded-full w-10 h-10 flex items-center justify-center">3️⃣</span>
                  <div>
                    <p className="text-purple-900 font-bold">Quick Approval</p>
                    <p className="text-purple-800 text-sm">Verification typically takes 2-3 business days for complete approval</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-400 shadow-md">
                  <span className="text-green-600 font-bold text-2xl bg-green-200 rounded-full w-10 h-10 flex items-center justify-center">4️⃣</span>
                  <div>
                    <p className="text-green-900 font-bold">Welcome Email!</p>
                    <p className="text-green-800 text-sm">You'll receive an email confirmation with login credentials once approved</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-200 to-green-200 border-4 border-emerald-500 rounded-xl p-4 shadow-xl">
              <h5 className="font-bold text-emerald-900 text-2xl mb-3 flex items-center gap-2">
                🌟 Amazing Benefits Waiting For You!
              </h5>
              <ul className="text-base text-emerald-900 space-y-3 font-bold">
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-400 shadow-md">
                  <span className="text-emerald-600 text-2xl bg-emerald-200 rounded-full w-10 h-10 flex items-center justify-center">🎯</span>
                  <span className="text-emerald-900">Access to AI-powered personalized tutoring</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-400 shadow-md">
                  <span className="text-blue-600 text-2xl bg-blue-200 rounded-full w-10 h-10 flex items-center justify-center">👥</span>
                  <span className="text-blue-900">Instant scribe matching for your exams</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border-2 border-purple-400 shadow-md">
                  <span className="text-purple-600 text-2xl bg-purple-200 rounded-full w-10 h-10 flex items-center justify-center">🔊</span>
                  <span className="text-purple-900">Voice-first learning experience</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-2 border-pink-400 shadow-md">
                  <span className="text-pink-600 text-2xl bg-pink-200 rounded-full w-10 h-10 flex items-center justify-center">📱</span>
                  <span className="text-pink-900">Mobile app access for learning on-the-go</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Registration Summary */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 rounded-lg p-4 sm:p-6 shadow-lg">
        <h4 className="font-bold text-blue-800 text-xl mb-3 flex items-center gap-2">
          📊 Registration Summary
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
            <p className="text-2xl font-bold text-blue-700">✅</p>
            <p className="text-sm font-bold text-blue-800">Personal Info</p>
            <p className="text-xs text-blue-600">Complete</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border-2 border-purple-300">
            <p className="text-2xl font-bold text-purple-700">✅</p>
            <p className="text-sm font-bold text-purple-800">Disability Info</p>
            <p className="text-xs text-purple-600">Complete</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-green-300">
            <p className="text-2xl font-bold text-green-700">✅</p>
            <p className="text-sm font-bold text-green-800">Academic Info</p>
            <p className="text-xs text-green-600">Complete</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border-2 border-orange-300">
            <p className="text-2xl font-bold text-orange-700">✅</p>
            <p className="text-sm font-bold text-orange-800">Location Info</p>
            <p className="text-xs text-orange-600">Complete</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentRegistration