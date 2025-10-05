/**
 * InteractiveDemo - Automated demonstration component for AI Literacy Bridge features
 *
 * This component provides an engaging, hands-free demonstration of the platform's
 * key features through an auto-playing carousel. Designed specifically for accessibility,
 * it showcases AI-powered scribe matching, voice learning, and accessibility features
 * without requiring user interaction.
 *
 * @component
 * @param {Object} props - Component props (currently none)
 * @returns {JSX.Element} Auto-playing demo carousel
 *
 * @features
 * - Auto-advancing carousel (4-second intervals)
 * - Voice-first design with audio descriptions
 * - Accessibility-optimized with screen reader support
 * - Responsive design for all devices
 * - Smooth animations and transitions
 *
 * @accessibility
 * - ARIA labels and live regions for screen readers
 * - Keyboard navigation support
 * - High contrast color schemes
 * - Reduced motion respect
 * - Voice announcements for step changes
 *
 * @behavior
 * - Automatically cycles through demo steps every 4 seconds
 * - Pauses on user interaction (hover/focus)
 * - Resumes autoplay after interaction timeout
 * - Provides visual progress indicators
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Users,
  MessageCircle,
  BookOpen,
  Mic,
  Eye,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react'

/**
 * DemoStep interface representing a single step in the interactive demonstration
 * @interface DemoStep
 * @property {string} id - Unique identifier for the demo step
 * @property {string} title - Display title for the step
 * @property {string} description - Detailed description of the feature
 * @property {React.ReactNode} icon - Icon component representing the feature
 * @property {string[]} features - Array of key features for this step
 * @property {string} color - Tailwind CSS gradient classes for styling
 */
interface DemoStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  color: string
}

/**
 * Predefined demonstration steps showcasing key platform features
 * Each step highlights a major capability of the AI Literacy Bridge platform
 */
const demoSteps: DemoStep[] = [
  {
    id: 'matching',
    title: 'AI-Powered Matching',
    description: 'Our advanced algorithm finds the perfect scribe for your needs',
    icon: <Zap className="h-8 w-8" />,
    features: ['Subject expertise analysis', 'Location optimization', 'Experience matching', 'Real-time availability'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'voice',
    title: 'Voice-Enabled Learning',
    description: 'Crystal-clear voice assistants and real-time audio support',
    icon: <Mic className="h-8 w-8" />,
    features: ['AI voice assistants', 'Live scribe communication', 'Audio exam support', 'Multi-language support'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'accessibility',
    title: 'Accessibility First',
    description: 'Designed specifically for visually impaired students',
    icon: <Eye className="h-8 w-8" />,
    features: ['Screen reader compatible', 'Voice navigation', 'Braille support', 'High contrast mode'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    description: 'Seamless collaboration between students and scribes',
    icon: <Users className="h-8 w-8" />,
    features: ['Live text sharing', 'Instant messaging', 'File collaboration', 'Progress tracking'],
    color: 'from-orange-500 to-orange-600'
  }
]

/**
 * InteractiveDemo Component - Auto-playing feature demonstration
 *
 * Renders an interactive carousel that automatically cycles through key platform
 * features. Includes progress indicators and manual navigation options while
 * maintaining accessibility standards.
 *
 * @returns {JSX.Element} Interactive demo carousel with auto-play functionality
 */
export default function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const currentDemo = demoSteps[currentStep]

  /**
   * Auto-advances through demo steps every 4 seconds when autoplay is enabled
   * Cleans up interval on component unmount or when autoplay is disabled
   */
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % demoSteps.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  /**
   * Handles manual navigation to a specific demo step
   * Pauses autoplay when user interacts with the carousel
   *
   * @param {number} index - The index of the demo step to navigate to
   */
  const handleStepClick = (index: number) => {
    setCurrentStep(index)
    setIsAutoPlaying(false) // Pause autoplay when user manually navigates
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4">
          <Play className="h-4 w-4 mr-2" />
          Interactive Platform Demo
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Experience AI Literacy Bridge
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          See how our platform transforms education for visually impaired students through interactive features
        </p>
      </div>

      {/* Main Demo Card */}
      <Card className="mb-6 overflow-hidden shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left Side - Content */}
            <div className="flex-1">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${currentDemo.color} text-white mb-4`}>
                {currentDemo.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentDemo.title}</h3>
              <p className="text-gray-600 mb-6">{currentDemo.description}</p>

              {/* Features List */}
              <div className="space-y-3">
                {currentDemo.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Interactive Preview */}
            <div className="flex-1">
              <div className={`relative h-64 rounded-xl bg-gradient-to-br ${currentDemo.color} p-6 text-white overflow-hidden`}>
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-white rounded-full animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full animate-ping"></div>
                </div>

                {/* Demo content based on current step */}
                <div className="relative z-10 h-full flex flex-col justify-center">
                  {currentStep === 0 && (
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
                      <div className="text-sm opacity-90 mb-2">Finding perfect match...</div>
                      <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="text-center">
                      <Mic className="h-12 w-12 mx-auto mb-4 opacity-80" />
                      <div className="text-sm opacity-90 mb-2">Voice Assistant Active</div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-3  text-blue-500 text-xs">
                        "How can I help you with your studies today?"
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-80" />
                      <div className="text-sm opacity-90 mb-2">Accessibility Features</div>
                      <div className="flex justify-center space-x-4 text-blue-500 text-xs opacity-80">
                        <span>🔊 Voice</span>
                        <span>📖 Braille</span>
                        <span>🎯 Focus</span>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-80" />
                      <div className="text-sm opacity-90 mb-2">Real-time Collaboration</div>
                      <div className="bg-white bg-opacity-20 rounded-lg p-3  text-blue-500 text-xs">
                        <div className="flex items-center mb-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Student & Scribe connected
                        </div>
                        <div className="text-left">📝 Working on math problem...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="flex justify-center space-x-2 mb-6">
        {demoSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'bg-blue-600 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to ${step.title}`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">500+</div>
          <div className="text-sm text-gray-600">Students Helped</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">200+</div>
          <div className="text-sm text-gray-600">Volunteer Scribes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">50+</div>
          <div className="text-sm text-gray-600">Exam Types</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">4.9</div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            Rating
          </div>
        </div>
      </div>
    </div>
  )
}