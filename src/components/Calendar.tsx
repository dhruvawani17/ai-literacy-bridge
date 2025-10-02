'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Target,
  Bell,
  MapPin
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { gamificationService } from '@/lib/gamification-service'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: Date
  startTime: string
  endTime: string
  type: 'exam' | 'study-session' | 'appointment' | 'reminder'
  location?: string
  participants?: string[]
  isRecurring?: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const Calendar: React.FC = () => {
  const { user } = useFirebaseAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [isLoading, setIsLoading] = useState(true)

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: selectedDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'study-session' as CalendarEvent['type'],
    location: '',
    isRecurring: false,
    recurringPattern: 'weekly' as CalendarEvent['recurringPattern']
  })

  useEffect(() => {
    if (user && db) {
      loadEvents()
    }
  }, [user, currentDate])

  const loadEvents = async () => {
    if (!user || !db) return
    setIsLoading(true)

    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const q = query(
        collection(db, 'calendar-events'),
        where('createdBy', '==', user.uid),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth),
        orderBy('date'),
        orderBy('startTime')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const eventsData: CalendarEvent[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as CalendarEvent[]

        setEvents(eventsData)
        setIsLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error('Error loading events:', error)
      setIsLoading(false)
    }
  }

  const createEvent = async () => {
    if (!user || !db || !newEvent.title.trim()) return

    try {
      const eventData = {
        ...newEvent,
        date: new Date(newEvent.date),
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: [user.uid]
      }

      await addDoc(collection(db, 'calendar-events'), eventData)

      // Award points for creating events
      await gamificationService.awardPoints(user.uid, 10, 'calendar_event_created')

      setShowEventForm(false)
      setNewEvent({
        title: '',
        description: '',
        date: selectedDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        type: 'study-session',
        location: '',
        isRecurring: false,
        recurringPattern: 'weekly'
      })
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const updateEvent = async () => {
    if (!editingEvent || !db) return

    try {
      const eventRef = doc(db, 'calendar-events', editingEvent.id)
      await updateDoc(eventRef, {
        ...editingEvent,
        updatedAt: new Date()
      })

      setEditingEvent(null)
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!db) return

    try {
      await deleteDoc(doc(db, 'calendar-events', eventId))
      await gamificationService.awardPoints(user?.uid || '', -5, 'calendar_event_deleted')
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.date.toDateString() === date.toDateString()
    )
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'bg-red-500'
      case 'study-session': return 'bg-blue-500'
      case 'appointment': return 'bg-green-500'
      case 'reminder': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return <Target className="h-3 w-3" />
      case 'study-session': return <BookOpen className="h-3 w-3" />
      case 'appointment': return <Users className="h-3 w-3" />
      case 'reminder': return <Bell className="h-3 w-3" />
      default: return <CalendarIcon className="h-3 w-3" />
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Please Sign In</h3>
          <p className="text-gray-600">Sign in to access your calendar and schedule events.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600">Schedule exams, study sessions, and appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Week
            </Button>
          </div>
          <Button onClick={() => setShowEventForm(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="flex-shrink-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="flex-shrink-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="w-full sm:w-auto"
            >
              Today
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-2 sm:p-0">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-2 sm:p-4 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 1)}</span>
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth(currentDate).map((date, index) => (
              <div
                key={index}
                className={`bg-white min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100 touch-manipulation ${
                  date?.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                      date.toDateString() === new Date().toDateString()
                        ? 'text-blue-600 font-bold'
                        : date.getMonth() !== currentDate.getMonth()
                        ? 'text-gray-400'
                        : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {getEventsForDate(date).slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-0.5 sm:p-1 rounded text-white ${getEventTypeColor(event.type)} flex items-center gap-1 truncate`}
                          title={event.title}
                        >
                          {getEventTypeIcon(event.type)}
                          <span className="truncate text-xs">{event.title}</span>
                        </div>
                      ))}
                      {getEventsForDate(date).length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{getEventsForDate(date).length - 2}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="mt-4 sm:mt-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Events for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No events scheduled for this date.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                        <h3 className="font-semibold text-sm sm:text-base">{event.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
                        >
                          <Edit className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEvent(event.id)}
                          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Form Modal */}
      {(showEventForm || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={editingEvent?.title || newEvent.title}
                  onChange={(e) => editingEvent
                    ? setEditingEvent({...editingEvent, title: e.target.value})
                    : setNewEvent({...newEvent, title: e.target.value})
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editingEvent?.description || newEvent.description}
                  onChange={(e) => editingEvent
                    ? setEditingEvent({...editingEvent, description: e.target.value})
                    : setNewEvent({...newEvent, description: e.target.value})
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={editingEvent ? editingEvent.date.toISOString().split('T')[0] : newEvent.date}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({...editingEvent, date: new Date(e.target.value)})
                      : setNewEvent({...newEvent, date: e.target.value})
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editingEvent?.type || newEvent.type}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({...editingEvent, type: e.target.value as CalendarEvent['type']})
                      : setNewEvent({...newEvent, type: e.target.value as CalendarEvent['type']})
                    }
                  >
                    <option value="exam">Exam</option>
                    <option value="study-session">Study Session</option>
                    <option value="appointment">Appointment</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md"
                    value={editingEvent?.startTime || newEvent.startTime}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({...editingEvent, startTime: e.target.value})
                      : setNewEvent({...newEvent, startTime: e.target.value})
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md"
                    value={editingEvent?.endTime || newEvent.endTime}
                    onChange={(e) => editingEvent
                      ? setEditingEvent({...editingEvent, endTime: e.target.value})
                      : setNewEvent({...newEvent, endTime: e.target.value})
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Online, Library, Exam Center"
                  value={editingEvent?.location || newEvent.location}
                  onChange={(e) => editingEvent
                    ? setEditingEvent({...editingEvent, location: e.target.value})
                    : setNewEvent({...newEvent, location: e.target.value})
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingEvent ? updateEvent : createEvent}
                  className="flex-1"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEventForm(false)
                    setEditingEvent(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Calendar