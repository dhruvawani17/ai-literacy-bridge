'use client'

import { StudentDashboard } from '@/components/StudentDashboard'
import { CommunityForum } from '@/components/CommunityForum'
import Calendar from '@/components/Calendar'
import Whiteboard from '@/components/Whiteboard'
import Analytics from '@/components/Analytics'
import { useUserStore } from '@/store'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Users,
  Mic,
  Eye,
  Brain,
  Zap,
  Heart,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Award,
  Globe,
  Sparkles,
  ChevronDown,
  GraduationCap,
  Accessibility,
  Shield,
  TrendingUp,
  Target,
  Lightbulb,
  Moon,
  Sun,
  Search,
  Volume2,
  Contrast,
  Type,
  MessageCircle,
  Languages,
  HelpCircle
} from 'lucide-react'

// Landing Page Component
function LandingPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    students: 0,
    scribes: 0,
    exams: 0,
    rating: 4.9
  })
  const [isVisible, setIsVisible] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [showVoiceSearch, setShowVoiceSearch] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! How can I help you learn more about AI Literacy Bridge?", sender: 'bot', time: new Date() }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [language, setLanguage] = useState('en')
  const [showFAQ, setShowFAQ] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const animatedElements = document.querySelectorAll('.animate-on-scroll')
    animatedElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Dark mode persistence
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedFontSize = localStorage.getItem('fontSize')
    const savedHighContrast = localStorage.getItem('highContrast')
    const savedLanguage = localStorage.getItem('language')

    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode))
    if (savedFontSize) setFontSize(savedFontSize)
    if (savedHighContrast) setHighContrast(JSON.parse(savedHighContrast))
    if (savedLanguage) setLanguage(savedLanguage)
  }, [])

  // Apply theme classes
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  // Apply font size
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-xl')
    root.classList.add(`font-${fontSize}`)
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  // Apply high contrast
  useEffect(() => {
    const root = document.documentElement
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    localStorage.setItem('highContrast', JSON.stringify(highContrast))
  }, [highContrast])

  // Apply language
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Scroll event for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Change font size
  const changeFontSize = (size: string) => {
    setFontSize(size)
  }

  // Toggle high contrast
  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
  }

  // Voice search functionality
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === 'en' ? 'en-US' : 'hi-IN'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        setShowVoiceSearch(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      alert('Voice search is not supported in your browser.')
    }
  }

  // Newsletter submission
  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      // Simulate API call
      setTimeout(() => {
        setNewsletterSubmitted(true)
        setTimeout(() => {
          setShowNewsletter(false)
          setNewsletterSubmitted(false)
          setNewsletterEmail('')
        }, 2000)
      }, 1000)
    }
  }

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'user',
        time: new Date()
      }
      setChatMessages([...chatMessages, message])
      setNewMessage('')

      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          text: "Thank you for your message! Our team will get back to you soon. In the meantime, feel free to explore our platform features.",
          sender: 'bot',
          time: new Date()
        }
        setChatMessages(prev => [...prev, botResponse])
      }, 1000)
    }
  }

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: "How does the AI scribe matching work?",
      answer: "Our advanced AI algorithms analyze subject expertise, location, availability, and past performance to match students with the most suitable scribes for their specific exam requirements."
    },
    {
      id: 2,
      question: "Is the platform accessible for all visually impaired students?",
      answer: "Yes! We prioritize accessibility with screen reader support, voice navigation, high contrast modes, and multiple input methods to ensure equal access for all users."
    },
    {
      id: 3,
      question: "What subjects and exams are supported?",
      answer: "We support a wide range of academic subjects including engineering, medical, competitive exams, and university courses. Our network covers major examination boards across India."
    },
    {
      id: 4,
      question: "How do I become a volunteer scribe?",
      answer: "Simply sign up through our platform, complete a background verification process, and specify your subject expertise and availability. We match you with students based on your preferences."
    },
    {
      id: 5,
      question: "What languages are supported?",
      answer: "Currently, we support English and Hindi, with plans to expand to more regional languages. Our AI voice assistants can communicate in multiple Indian languages."
    }
  ]

  // Animated counter effect
  useEffect(() => {
    const targetStats = { students: 1250, scribes: 340, exams: 890, rating: 4.9 }
    const duration = 2000
    const steps = 60
    const increment = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        students: Math.floor(targetStats.students * progress),
        scribes: Math.floor(targetStats.scribes * progress),
        exams: Math.floor(targetStats.exams * progress),
        rating: Number((targetStats.rating * progress).toFixed(1))
      })

      if (currentStep >= steps) clearInterval(timer)
    }, increment)

    return () => clearInterval(timer)
  }, [])

  // Handle mobile menu close on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector('nav')
      if (nav && !nav.contains(event.target as Node) && showMobileMenu) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileMenu])

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-blue-200 rounded-full opacity-20 animate-bounce transition-all duration-1000 ${isVisible ? 'translate-y-0' : '-translate-y-10'}`} style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className={`absolute top-32 sm:top-40 right-4 sm:right-20 w-12 h-12 sm:w-16 sm:h-16 bg-purple-200 rounded-full opacity-20 animate-bounce transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`} style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className={`absolute bottom-32 sm:bottom-40 left-4 sm:left-20 w-10 h-10 sm:w-12 sm:h-12 bg-pink-200 rounded-full opacity-20 animate-bounce transition-all duration-1000 ${isVisible ? 'translate-y-0' : '-translate-y-10'}`} style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className={`absolute bottom-16 sm:bottom-20 right-4 sm:right-10 w-20 h-20 sm:w-24 sm:h-24 bg-green-200 rounded-full opacity-20 animate-bounce transition-all duration-1000 ${isVisible ? 'translate-y-0' : 'translate-y-10'}`} style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>

        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Literacy
              </span>
            </div>

            {/* Skip to content link */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
            >
              Skip to main content
            </a>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Accessibility Controls */}
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => changeFontSize('small')}
                    className={`p-1 rounded text-xs ${fontSize === 'small' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-red-800'}`}
                    aria-label="Small font size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => changeFontSize('normal')}
                    className={`p-1 rounded text-sm ${fontSize === 'normal' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    aria-label="Normal font size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => changeFontSize('large')}
                    className={`p-1 rounded text-base ${fontSize === 'large' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    aria-label="Large font size"
                  >
                    A
                  </button>
                </div>

                <button
                  onClick={toggleHighContrast}
                  className={`p-2 rounded-lg transition-colors ${highContrast ? 'bg-yellow-100 dark:bg-yellow-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  aria-label="Toggle high contrast mode"
                >
                  <Contrast className="h-4 w-4" />
                </button>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-6 lg:space-x-8">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('calendar')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Calendar
                </button>
                <button
                  onClick={() => scrollToSection('whiteboard')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Whiteboard
                </button>
                <button
                  onClick={() => scrollToSection('analytics')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Analytics
                </button>
                <button
                  onClick={() => scrollToSection('impact')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Impact
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Stories
                </button>
                <button
                  onClick={() => scrollToSection('community')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Community
                </button>
                <button
                  onClick={() => setShowFAQ(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  FAQ
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowVoiceSearch(true)}
                  className="hidden sm:flex border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 text-sm lg:text-base"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Voice Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth')}
                  className="hidden sm:flex border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 text-sm lg:text-base px-3 lg:px-4"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/auth')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm lg:text-base px-3 lg:px-4"
                >
                  Get Started
                </Button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-transform duration-300 ${showMobileMenu ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                    <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-opacity duration-300 ${showMobileMenu ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-transform duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-2 px-4">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'} Mode</span>
                  </button>
                  <button
                    onClick={toggleHighContrast}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Contrast className="h-4 w-4" />
                    <span className="text-sm">High Contrast</span>
                  </button>
                  <button
                    onClick={() => setShowVoiceSearch(true)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm">Voice Search</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 px-4">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => { scrollToSection('features'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Features
                    </button>
                    <button
                      onClick={() => { scrollToSection('calendar'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => { scrollToSection('whiteboard'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Whiteboard
                    </button>
                    <button
                      onClick={() => { scrollToSection('analytics'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => { scrollToSection('impact'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Impact
                    </button>
                    <button
                      onClick={() => { scrollToSection('testimonials'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Stories
                    </button>
                    <button
                      onClick={() => { scrollToSection('community'); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      Community
                    </button>
                    <button
                      onClick={() => { setShowFAQ(true); setShowMobileMenu(false) }}
                      className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
                    >
                      FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-25 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute top-1/3 right-10 w-8 h-8 bg-green-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-lg animate-pulse">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Powered by Advanced AI Technology
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 transition-all duration-1000 opacity-100 translate-y-0">
              <span className="text-blue-600 font-extrabold drop-shadow-lg animate-pulse">
                Empowering Students with
              </span>
              <span className="block text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text font-extrabold drop-shadow-lg animate-pulse relative">
                Visual Disabilities
                <div className="absolute inset-0 text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text animate-pulse opacity-75 blur-sm transform scale-105"></div>
              </span>
            </h1>

            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 opacity-100 translate-y-0">
              <span className="text-gray-800 font-semibold hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:bg-clip-text transition-all duration-500">
                AI-powered scribe matching and personalized learning platform that connects
              </span>
              <span className="block text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-bold animate-pulse drop-shadow-sm">
                blind and visually impaired students with skilled scribes for exam success and educational excellence.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 transition-all duration-1000 delay-500 opacity-100 translate-y-0">
              <Button
                onClick={() => router.push('/auth')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Find Your Scribe
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/scribe-matching')}
                className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Become a Volunteer
              </Button>
            </div>

            {/* Demo Video Placeholder */}
            <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-2xl overflow-hidden relative group cursor-pointer transform hover:scale-105 transition-all duration-500">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 animate-pulse"></div>
                  <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/10 transition-all duration-300">
                  <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                      <Play className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 ml-1 group-hover:text-blue-700 transition-colors duration-300" />
                    </div>
                    <p className="text-gray-700 font-semibold text-sm sm:text-base group-hover:text-gray-800 transition-colors duration-300">Watch how it works</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">See AI matching in action</p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-xs sm:text-sm font-medium">AI-powered scribe matching in action</p>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{stats.students.toLocaleString()}+</div>
              <div className="text-gray-600 text-sm sm:text-base">Students Helped</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">{stats.scribes}+</div>
              <div className="text-gray-600 text-sm sm:text-base">Volunteer Scribes</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">{stats.exams}+</div>
              <div className="text-gray-600 text-sm sm:text-base">Exams Supported</div>
            </div>
            <div className="text-center animate-on-scroll opacity-0">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">{stats.rating}</div>
              <div className="text-gray-600 flex items-center justify-center text-sm sm:text-base">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4 shadow-lg">
              <Zap className="h-4 w-4 mr-2" />
              Comprehensive Learning Support
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Academic Success
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides end-to-end support for visually impaired students,
              from scribe matching to personalized learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg animate-on-scroll opacity-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">AI-Powered Matching</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Advanced algorithms match students with the perfect scribe based on subject expertise,
                  location, and exam requirements.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Subject compatibility analysis
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Location optimization
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Experience matching
                  </li>
                </ul>
                {/* Progress bar animation */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg animate-on-scroll opacity-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 shadow-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-purple-600 transition-colors">Voice-Enabled Learning</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Interactive voice tutors and real-time audio support for comprehensive learning
                  experiences.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    AI voice assistants
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Live scribe communication
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Audio exam support
                  </li>
                </ul>
                {/* Progress bar animation */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg animate-on-scroll opacity-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">Accessibility First</h3>
                <p className="text-gray-600 mb-4">
                  Designed specifically for visually impaired students with screen readers,
                  voice commands, and tactile interfaces.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Screen reader compatible
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Voice navigation
                  </li>
                  <li className="flex items-center text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Braille support
                  </li>
                </ul>
                {/* Progress bar animation */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-orange-600 transition-colors">Personalized Learning</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Adaptive learning paths and AI tutors that understand each student's
                  unique learning style and pace.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Adaptive difficulty
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Progress tracking
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Custom study plans
                  </li>
                </ul>
                {/* Progress bar animation */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-red-600 transition-colors">Secure & Verified</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  All scribes undergo thorough background checks and verification to ensure
                  the highest standards of trust and reliability.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Background verification
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Quality assurance
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Secure communication
                  </li>
                </ul>
                {/* Progress bar animation */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors">Nationwide Network</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Connect with verified scribes across India, ensuring availability for
                  exams in any location.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Pan-India coverage
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Local scribe matching
                  </li>
                  <li className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                    Multiple language support
                  </li>
                </ul>
                {/* Progress bar animation */}
                <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Forum Section */}
      <section id="community" className="py-16 sm:py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Forum
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Connect with fellow students, share experiences, and get support from our community
            </p>
          </div>
          <CommunityForum />
        </div>
      </section>

      {/* Calendar Section */}
      <section id="calendar" className="py-16 sm:py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Study Calendar
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Schedule exams, study sessions, and appointments with your scribe
            </p>
          </div>
          <Calendar />
        </div>
      </section>

      {/* Whiteboard Section */}
      <section id="whiteboard" className="py-16 sm:py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Collaborative Whiteboard
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Draw, sketch, and collaborate visually with your scribe and peers
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <Whiteboard />
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-16 sm:py-20 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Analytics Dashboard
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Track progress, view insights, and monitor educational outcomes
            </p>
          </div>
          <Analytics />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Hear from students and scribes who have transformed education through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 italic">
                  "The AI matching system found me the perfect scribe for my engineering entrance exam.
                  The voice support made studying so much easier. I scored 95%!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-white font-semibold text-sm sm:text-base">R</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Rahul S.</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Engineering Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 italic">
                  "Being a volunteer scribe has been incredibly rewarding. The platform makes it easy to
                  connect with students who need my help. Technology that makes a real difference!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-white font-semibold text-sm sm:text-base">P</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Priya M.</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Volunteer Scribe</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 italic">
                  "The accessibility features are outstanding. Voice navigation and AI tutors helped me
                  excel in my medical entrance exam. This platform levels the playing field."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                    <span className="text-white font-semibold text-sm sm:text-base">A</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Ananya K.</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Medical Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Education?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">
            Join thousands of students and volunteers who are making education accessible for everyone
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth')}
              className="bg-white text-blue-600 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/scribe-matching')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Volunteer as Scribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold">AI Literacy Bridge</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Empowering visually impaired students through AI-powered scribe matching and personalized learning.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Find Scribes</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Become a Scribe</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">AI Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Connect</h3>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2025 AI Literacy Bridge. All rights reserved. Made with ❤️ for inclusive education.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 transform rotate-180" />
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const { user: appUser } = useUserStore()
  const { user: firebaseUser, isLoading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !firebaseUser && !appUser) {
      // Show landing page for unauthenticated users
      return
    }
  }, [firebaseUser, appUser, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Loading your personalized learning environment...</p>
        </div>
      </div>
    )
  }

  // Show landing page for unauthenticated users
  if (!firebaseUser && !appUser) {
    return <LandingPage />
  }

  // Show dashboard for authenticated users
  return (
    <>
      <StudentDashboard />
    </>
  )
}