'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Mail,
  Lock,
  User
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { useUserStore } from '@/store'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const { user, appUser, isLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useFirebaseAuth()
  const { setUser } = useUserStore()
  const router = useRouter()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && appUser) {
      setUser(appUser)
      router.push('/')
    }
  }, [user, appUser, setUser, router])

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

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    setError('')
    
    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed')
    } finally {
      setAuthLoading(false)
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
              <p className="text-sm text-gray-600">
                Powered by Llama
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
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
              <p className="text-xl text-gray-700 leading-relaxed">
                AI-powered personalized learning with accessibility-first design, 
                powered by Llama for intelligent educational assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Volume2 className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2 text-gray-900">Voice-First Learning</h3>
                <p className="text-sm text-gray-600">
                  Complete voice navigation and audio descriptions for visually impaired students
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Globe className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-2 text-gray-900">Multi-Language Support</h3>
                <p className="text-sm text-gray-600">
                  Available in 12+ Indian languages and dialects
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Users className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2 text-gray-900">AI Scribe Matching</h3>
                <p className="text-sm text-gray-600">
                  Instant connection with qualified scribes for exams
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Shield className="h-8 w-8 text-orange-500 mb-3" />
                <h3 className="font-semibold mb-2 text-gray-900">Long-term Memory</h3>
                <p className="text-sm text-gray-600">
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
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Welcome to AI Literacy Bridge
              </h3>
              <p className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        className="pl-10 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  disabled={authLoading || isLoading}
                >
                  {authLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {isLogin ? (
                        <LogIn className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-600">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full py-6 text-base bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                disabled={authLoading || isLoading}
              >
                {authLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">Continue with Google</span>
                  </div>
                )}
              </Button>

              {/* Toggle between login/signup */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setEmail('')
                    setPassword('')
                    setName('')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                >
                  {isLogin 
                    ? "Don't have an account? Create one" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium text-gray-900">Students</p>
                  <p className="text-xs text-gray-600">Personalized learning</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium text-gray-900">Educators</p>
                  <p className="text-xs text-gray-600">Teaching tools</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium text-gray-900">Scribes</p>
                  <p className="text-xs text-gray-600">Exam assistance</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Accessibility className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium text-gray-900">Accessible</p>
                  <p className="text-xs text-gray-600">For everyone</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="text-xs text-center text-gray-600 space-y-2">
                <p>🔒 Secure authentication powered by Firebase</p>
                <p>♿ Accessibility-first design</p>
                <p>🤖 AI-powered by Direct Llama Integration</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}