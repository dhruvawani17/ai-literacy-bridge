/**
 * Firebase Setup Banner
 * Displays a helpful notification when Firebase is not properly configured
 */

'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, X, Terminal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FirebaseSetupBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if Firebase is properly configured by looking for permission errors in console
    const checkFirebaseErrors = () => {
      // Clear any previous error flags on component mount
      localStorage.removeItem('firebase_permission_error')
      
      const hasFirebaseError = localStorage.getItem('firebase_permission_error')
      const bannerDismissed = sessionStorage.getItem('firebase_banner_dismissed')
      
      // Only show banner if there's a real config error and Firebase is supposed to be configured
      const hasValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      
      if (hasFirebaseError && !bannerDismissed && hasValidConfig) {
        setShowBanner(true)
      }
    }

    // Listen for Firebase permission errors (but exclude expected auth errors)
    const originalError = console.error
    console.error = function(...args) {
      const errorMessage = args.join(' ')
      
      // Only flag permission errors that are likely configuration issues
      // Exclude common authentication-related errors that are expected
      const isConfigError = errorMessage.includes('permission-denied') && 
                           !errorMessage.includes('auth') && 
                           !errorMessage.includes('authentication') &&
                           !errorMessage.includes('sign-in') &&
                           !errorMessage.includes('Please sign in')
      
      if (isConfigError) {
        localStorage.setItem('firebase_permission_error', 'true')
        setShowBanner(true)
      }
      
      originalError.apply(console, args)
    }

    checkFirebaseErrors()

    // Cleanup
    return () => {
      console.error = originalError
    }
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setShowBanner(false)
    sessionStorage.setItem('firebase_banner_dismissed', 'true')
  }

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm run firebase:deploy:rules')
    alert('Command copied to clipboard!')
  }

  if (!showBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base">
                Firebase Permissions Not Configured
              </div>
              <div className="text-xs sm:text-sm text-orange-100 mt-1">
                The app is running in <strong>development mode</strong> with mock data. 
                Deploy security rules to enable database features.
              </div>
              
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={handleCopyCommand}
                  className="bg-white text-orange-600 hover:bg-orange-50 text-xs sm:text-sm"
                >
                  <Terminal className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  Copy Fix Command
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('/FIREBASE_SETUP.md', '_blank')}
                  className="border-white text-white hover:bg-white hover:text-orange-600 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  Setup Guide
                </Button>
              </div>

              <details className="mt-2 text-xs">
                <summary className="cursor-pointer opacity-80 hover:opacity-100">
                  Show command
                </summary>
                <code className="block mt-1 bg-black/20 px-2 py-1 rounded font-mono text-xs">
                  npm run firebase:deploy:rules
                </code>
              </details>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white hover:text-orange-200 transition-colors flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Compact version for inline use
export function FirebaseSetupAlert() {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const checkError = () => {
      const hasFirebaseError = localStorage.getItem('firebase_permission_error')
      setHasError(!!hasFirebaseError)
    }

    checkError()
    const interval = setInterval(checkError, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!hasError) return null

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-orange-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-orange-700">
            <strong>Development Mode:</strong> Using mock data. 
            <button
              onClick={() => window.open('/QUICKSTART.md', '_blank')}
              className="ml-1 underline hover:text-orange-900"
            >
              Configure Firebase
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
