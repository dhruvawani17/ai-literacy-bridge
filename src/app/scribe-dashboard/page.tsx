/**
 * Scribe Dashboard Page
 * Main dashboard for scribes after successful registration
 */

'use client'

import ScribeDashboard from '@/components/ScribeDashboard'
import { useUserStore } from '@/store'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ScribeDashboardPage() {
  const { user: appUser } = useUserStore()
  const { user: firebaseUser, isLoading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !firebaseUser && !appUser) {
      router.push('/auth')
    }
  }, [firebaseUser, appUser, isLoading, router])

  if (isLoading || (!firebaseUser && !appUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your scribe dashboard...</p>
        </div>
      </div>
    )
  }

  return <ScribeDashboard />
}