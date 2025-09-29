'use client'

import { StudentDashboard } from '@/components/StudentDashboard'
import { useUserStore } from '@/store'
import { useAuth0 } from '@/lib/auth0-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user: appUser } = useUserStore()
  const { user: auth0User, isLoading } = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !auth0User && !appUser) {
      router.push('/auth')
    }
  }, [auth0User, appUser, isLoading, router])

  if (isLoading || (!auth0User && !appUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your personalized learning environment...</p>
        </div>
      </div>
    )
  }

  return <StudentDashboard />
}