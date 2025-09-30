'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, User, UserCheck, Clock, ArrowRight } from 'lucide-react'

interface RegistrationSuccessProps {
  type: 'student' | 'scribe'
  name: string
  onComplete?: () => void
  redirectDelay?: number
}

export function RegistrationSuccess({ 
  type, 
  name, 
  onComplete, 
  redirectDelay = 3000 
}: RegistrationSuccessProps) {
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000))

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onComplete) onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete, redirectDelay])

  const isStudent = type === 'student'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <Card className="max-w-4xl w-full bg-gradient-to-r from-green-500 to-blue-600 border-0 shadow-2xl transform animate-pulse overflow-hidden">
        <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
          {/* Success Animation - Responsive sizing */}
          <div className="mb-6 sm:mb-8 lg:mb-10 relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-green-500 animate-bounce" />
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-green-200 rounded-full opacity-30 animate-ping"></div>
          </div>

          {/* Success Message - Responsive text sizing */}
          <div className="text-white space-y-4 sm:space-y-6 lg:space-y-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
              🎉 Registration Successful! 🎉
            </h1>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 lg:space-y-6 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
                {isStudent ? (
                  <User className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-yellow-300 flex-shrink-0" />
                ) : (
                  <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-yellow-300 flex-shrink-0" />
                )}
                <span className="text-center break-words">Welcome, {name}!</span>
              </div>
              
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-green-100 leading-relaxed">
                {isStudent ? (
                  'Your student profile has been created successfully. You can now browse and book scribes for your exams.'
                ) : (
                  'Thank you for volunteering as a scribe! Your application is being reviewed and you will be contacted soon.'
                )}
              </p>
            </div>

            {/* Next Steps - Responsive layout */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-800 rounded-xl p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 lg:space-y-6 max-w-3xl mx-auto">
              <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0" />
                <span>What's Next?</span>
              </h3>
              
              {isStudent ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 text-lg sm:text-xl">✅</span>
                    <span>Browse available scribes</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 text-lg sm:text-xl">✅</span>
                    <span>Book scribes for your exams</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 text-lg sm:text-xl">✅</span>
                    <span>Manage your bookings</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 text-lg sm:text-xl">✅</span>
                    <span>Track your exam schedule</span>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold">
                  <p className="flex items-center gap-2">
                    <span className="text-blue-600 text-lg sm:text-xl">✅</span>
                    <span>Profile verification in progress</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-600 text-lg sm:text-xl">✅</span>
                    <span>Background check (if applicable)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-600 text-lg sm:text-xl">✅</span>
                    <span>Training materials will be sent</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-600 text-lg sm:text-xl">✅</span>
                    <span>You'll be notified when approved</span>
                  </p>
                </div>
              )}
            </div>

            {/* Countdown - Responsive sizing */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-300 animate-spin flex-shrink-0" />
                <span className="text-center">
                  Redirecting to dashboard in {countdown} seconds...
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegistrationSuccess