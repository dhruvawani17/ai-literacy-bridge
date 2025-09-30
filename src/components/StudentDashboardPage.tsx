'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Calendar,
  BookOpen,
  Star,
  MapPin,
  Clock,
  Search,
  Settings,
  Bell,
  Home,
  MessageSquare,
  Trophy,
  Heart,
  Shield
} from 'lucide-react'

interface StudentDashboardPageProps {
  studentName?: string
}

export function StudentDashboardPage({ studentName = 'Student' }: StudentDashboardPageProps) {
  const router = useRouter()

  const upcomingExams = [
    {
      id: 1,
      subject: 'Mathematics',
      date: '2025-10-15',
      time: '09:00 AM',
      scribe: 'Priya Sharma',
      status: 'confirmed'
    },
    {
      id: 2,
      subject: 'Physics',
      date: '2025-10-20',
      time: '02:00 PM',
      scribe: 'Pending Assignment',
      status: 'pending'
    }
  ]

  const availableScribes = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      subjects: ['Chemistry', 'Biology'],
      rating: 4.9,
      distance: '2.5 km',
      available: 'Today'
    },
    {
      id: 2,
      name: 'Anita Patel',
      subjects: ['English', 'History'],
      rating: 4.8,
      distance: '3.2 km',
      available: 'Tomorrow'
    },
    {
      id: 3,
      name: 'Mohammed Ali',
      subjects: ['Mathematics', 'Physics'],
      rating: 4.7,
      distance: '1.8 km',
      available: 'This Week'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      activity: 'Scribe Priya Sharma confirmed for Mathematics exam',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 2,
      activity: 'Profile verification completed',
      time: '1 day ago',
      type: 'info'
    },
    {
      id: 3,
      activity: 'Registration completed successfully',
      time: '2 days ago',
      type: 'success'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {studentName}! 👋
            </h1>
            <p className="text-blue-700 text-lg mt-2">
              Manage your exam scribes and track your progress
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Upcoming Exams</p>
                  <p className="text-3xl font-bold">2</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Confirmed Scribes</p>
                  <p className="text-3xl font-bold">1</p>
                </div>
                <User className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Available Scribes</p>
                  <p className="text-3xl font-bold">{availableScribes.length}</p>
                </div>
                <Search className="h-12 w-12 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Profile Status</p>
                  <p className="text-xl font-bold">Verified ✓</p>
                </div>
                <Shield className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Exams */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
                  <Calendar className="h-6 w-6" />
                  Upcoming Exams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingExams.map((exam) => (
                  <div 
                    key={exam.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-blue-800">{exam.subject}</h3>
                        <div className="flex items-center gap-4 mt-2 text-blue-700">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {exam.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {exam.time}
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Scribe: <span className="font-semibold">{exam.scribe}</span>
                        </p>
                      </div>
                      <Badge 
                        variant={exam.status === 'confirmed' ? 'default' : 'secondary'}
                        className={exam.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {exam.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  onClick={() => router.push('/scribe-matching')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Find More Scribes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Available Scribes & Recent Activity */}
          <div className="space-y-6">
            {/* Available Scribes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-green-700">
                  <User className="h-5 w-5" />
                  Available Scribes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableScribes.map((scribe) => (
                  <div 
                    key={scribe.id}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-800">{scribe.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{scribe.rating}</span>
                      </div>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>Subjects: {scribe.subjects.join(', ')}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {scribe.distance}
                        </span>
                        <span className="text-green-600 font-medium">{scribe.available}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-purple-700">
                  <MessageSquare className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  >
                    <p className="text-sm text-blue-800">{activity.activity}</p>
                    <p className="text-xs text-purple-600 mt-1">{activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary" 
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  onClick={() => router.push('/scribe-matching')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Book a Scribe
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Exam
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Rate Experience
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboardPage