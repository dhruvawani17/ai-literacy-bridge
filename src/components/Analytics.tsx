'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Calendar,
  Award,
  Clock,
  Activity,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'

interface AnalyticsData {
  totalStudents: number
  totalScribes: number
  totalExams: number
  totalStudySessions: number
  averageScore: number
  completionRate: number
  popularSubjects: Array<{ subject: string; count: number }>
  monthlyStats: Array<{ month: string; exams: number; sessions: number }>
  userProgress: Array<{ userId: string; name: string; progress: number; score: number }>
  gamificationStats: {
    totalPoints: number
    totalAchievements: number
    activeUsers: number
  }
}

const Analytics: React.FC = () => {
  const { user } = useFirebaseAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadAnalyticsData()
    }
  }, [user, timeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // This would typically fetch from multiple collections
      // For now, we'll simulate with mock data
      const mockData: AnalyticsData = {
        totalStudents: 1247,
        totalScribes: 89,
        totalExams: 2156,
        totalStudySessions: 5432,
        averageScore: 78.5,
        completionRate: 89.2,
        popularSubjects: [
          { subject: 'Mathematics', count: 456 },
          { subject: 'Physics', count: 387 },
          { subject: 'Chemistry', count: 298 },
          { subject: 'Biology', count: 234 },
          { subject: 'English', count: 189 }
        ],
        monthlyStats: [
          { month: 'Jan', exams: 145, sessions: 234 },
          { month: 'Feb', exams: 167, sessions: 289 },
          { month: 'Mar', exams: 198, sessions: 345 },
          { month: 'Apr', exams: 223, sessions: 387 },
          { month: 'May', exams: 256, sessions: 423 },
          { month: 'Jun', exams: 289, sessions: 456 }
        ],
        userProgress: [
          { userId: '1', name: 'Rahul S.', progress: 95, score: 92 },
          { userId: '2', name: 'Priya M.', progress: 88, score: 87 },
          { userId: '3', name: 'Amit K.', progress: 82, score: 84 },
          { userId: '4', name: 'Sneha R.', progress: 76, score: 79 },
          { userId: '5', name: 'Vikram P.', progress: 71, score: 75 }
        ],
        gamificationStats: {
          totalPoints: 45678,
          totalAchievements: 1234,
          activeUsers: 892
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (!analyticsData) return

    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `analytics-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-gray-600">Analytics dashboard is available for administrators and educators.</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-600">Unable to load analytics data at this time.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStudents.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalExams.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.averageScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+2.1%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+5.7%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'performance', label: 'Performance', icon: Target },
          { id: 'engagement', label: 'Engagement', icon: Activity }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedTab(id)}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              selectedTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{label}</span>
            <span className="xs:hidden">{label.slice(0, 3)}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analyticsData.monthlyStats.map((stat, index) => (
                      <div key={stat.month} className="flex flex-col items-center flex-1">
                        <div className="w-full bg-gray-200 rounded-t h-32 relative">
                          <div
                            className="bg-blue-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                            style={{ height: `${(stat.exams / 300) * 100}%` }}
                          />
                        </div>
                        <div className="w-full bg-gray-200 rounded-t h-32 relative mt-1">
                          <div
                            className="bg-green-500 rounded-t absolute bottom-0 w-full transition-all duration-500"
                            style={{ height: `${(stat.sessions / 500) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{stat.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span className="text-sm text-gray-600">Exams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-sm text-gray-600">Study Sessions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Popular Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.popularSubjects.map((subject, index) => (
                      <div key={subject.subject} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'][index]
                          }`} />
                          <span className="text-sm font-medium">{subject.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'][index]
                              }`}
                              style={{ width: `${(subject.count / 500) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{subject.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gamification Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Gamification Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {analyticsData.gamificationStats.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Points Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {analyticsData.gamificationStats.totalAchievements.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Achievements Unlocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {analyticsData.gamificationStats.activeUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Progress Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {analyticsData.userProgress.map((student, index) => (
                  <div key={student.userId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{student.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">ID: {student.userId}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:gap-6 gap-4">
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-blue-600">{student.progress}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-green-600">{student.score}%</div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Study Session Completion</span>
                  <span className="text-sm text-gray-600">89.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89.2%' }} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Exam Preparation Success</span>
                  <span className="text-sm text-gray-600">76.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '76.8%' }} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Scribe Matching Accuracy</span>
                  <span className="text-sm text-gray-600">94.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94.5%' }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-lg font-bold text-blue-600">4.2h</div>
                    <div className="text-xs text-gray-600">Avg Study Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold text-green-600">12</div>
                    <div className="text-xs text-gray-600">Sessions/Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'engagement' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Daily Active Users</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">892</div>
                  <div className="text-sm text-gray-600">+15% from yesterday</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Session Duration</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">42m</div>
                  <div className="text-sm text-gray-600">Average per user</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Feature Usage</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                  <div className="text-sm text-gray-600">Of users engage weekly</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-center gap-4">
                  {[65, 78, 82, 75, 88, 92, 85].map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t"
                           style={{ height: `${value * 2}px` }} />
                      <span className="text-xs text-gray-600 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics