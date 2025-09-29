'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Volume2, 
  Accessibility, 
  Globe, 
  BookOpen,
  Users,
  Shield,
  LogIn,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  Mail
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/auth0-provider'
import { useUserStore } from '@/store'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const { 
    user, 
    appUser, 
    isLoading, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail 
  } = useFirebaseAuth()
  const { setUser } = useUserStore()
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (appUser) {
      setUser(appUser)
      router.push('/')
    }
  }, [appUser, setUser, router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password, name)
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || 'Google authentication failed')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                AI Literacy Bridge
              </h1>
              <p className="text-sm text-muted-foreground">
                Powered by Cerebras Wafer-Scale Engine
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accessibility First
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Revolutionizing Education for{' '}
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Everyone
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AI-powered personalized learning with accessibility-first design, 
                powered by Cerebras for massive-scale educational intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Volume2 className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Voice-First Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Complete voice navigation and audio descriptions for visually impaired students
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Globe className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-2">Multi-Language Support</h3>
                <p className="text-sm text-muted-foreground">
                  Available in 12+ Indian languages and dialects
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Users className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2">AI Scribe Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Instant connection with qualified scribes for exams
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Shield className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="font-semibold mb-2">Long-term Memory</h3>
                <p className="text-sm text-muted-foreground">
                  AI tutor remembers your learning journey
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-lg text-white">
              <h3 className="font-semibold mb-2 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Impact So Far
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">10K+</p>
                  <p className="text-sm opacity-90">Students</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm opacity-90">Languages</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm opacity-90">Scribes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Firebase Auth */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Revolution'}
              </h3>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Continue your personalized learning journey'
                  : 'Start your accessible education experience'
                }
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full py-6 text-base"
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline text-sm"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="text-xs text-center text-muted-foreground space-y-2">
                <p>🔒 Secure authentication powered by Firebase</p>
                <p>♿ Accessibility-first design</p>
                <p>🤖 AI-powered by Cerebras Wafer-Scale Engine</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}