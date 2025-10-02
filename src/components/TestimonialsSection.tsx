'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  ThumbsUp,
  Share2,
  MessageSquare,
  Heart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  TrendingUp,
  X
} from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  shortTestimonial: string
  fullTestimonial: string
  examType: string
  score?: string
  likes: number
  shares: number
  comments: number
  tags: string[]
  date: string
  featured: boolean
}

const testimonialsData: Testimonial[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Engineering Student',
    avatar: 'R',
    rating: 5,
    shortTestimonial: 'The AI matching system found me the perfect scribe for my engineering entrance exam. The voice support made studying so much easier. I scored 95%!',
    fullTestimonial: 'I was struggling with my JEE preparation due to visual impairment, but this platform completely changed my approach. The AI matching system found me Priya, who was not only an excellent scribe but also understood the technical concepts deeply. The voice support feature allowed me to study hands-free, and the real-time collaboration tools helped us solve complex physics problems together. I scored 95% in JEE Main and got into IIT Delhi. This platform doesn\'t just provide accessibility - it enhances the learning experience!',
    examType: 'JEE Main',
    score: '95%',
    likes: 47,
    shares: 23,
    comments: 12,
    tags: ['JEE', 'Engineering', 'Success Story', 'Voice Support'],
    date: '2 weeks ago',
    featured: true
  },
  {
    id: '2',
    name: 'Priya Mehta',
    role: 'Volunteer Scribe',
    avatar: 'P',
    rating: 5,
    shortTestimonial: 'Being a volunteer scribe has been incredibly rewarding. The platform makes it easy to connect with students who need my help. Technology that makes a real difference!',
    fullTestimonial: 'As a computer science student, I wanted to give back to the community. This platform made it incredibly easy to volunteer as a scribe. The matching system ensures I work with students whose subjects align with my expertise. I\'ve helped 15 students so far, from JEE aspirants to medical entrance exam candidates. The real-time collaboration tools make the sessions engaging and productive. Seeing students succeed because of our joint efforts is the most rewarding feeling. If you\'re considering volunteering, don\'t hesitate - your skills can transform lives!',
    examType: 'Multiple',
    likes: 38,
    shares: 19,
    comments: 8,
    tags: ['Volunteer', 'Community', 'Impact', 'Technology'],
    date: '1 month ago',
    featured: false
  },
  {
    id: '3',
    name: 'Ananya Kumar',
    role: 'Medical Student',
    avatar: 'A',
    rating: 5,
    shortTestimonial: 'The accessibility features are outstanding. Voice navigation and AI tutors helped me excel in my medical entrance exam. This platform levels the playing field.',
    fullTestimonial: 'Born with congenital visual impairment, I always dreamed of becoming a doctor. Traditional study methods were challenging, but AI Literacy Bridge changed everything. The voice navigation system lets me explore the platform independently, while the AI tutor provides instant explanations for complex medical concepts. During my NEET exam, my scribe was able to describe diagrams and equations perfectly. I scored in the 98th percentile and secured admission to AIIMS Delhi. This platform doesn\'t just provide access - it creates equal opportunities for visually impaired students to pursue their dreams.',
    examType: 'NEET',
    score: '98th Percentile',
    likes: 52,
    shares: 31,
    comments: 15,
    tags: ['NEET', 'Medical', 'Accessibility', 'AI Tutor'],
    date: '3 weeks ago',
    featured: true
  },
  {
    id: '4',
    name: 'Vikram Singh',
    role: 'CA Student',
    avatar: 'V',
    rating: 5,
    shortTestimonial: 'The collaborative features made complex accounting problems so much easier to understand. My scribe and I solved problems together in real-time.',
    fullTestimonial: 'Preparing for CA exams with visual impairment was daunting, but this platform made it manageable. The real-time collaboration tools allowed my scribe to share diagrams and flowcharts while explaining complex accounting concepts. The voice chat feature meant I could ask questions instantly without typing. We spent hours working through practice problems together, and I cleared all three levels of CA exams in my first attempt. The platform\'s accessibility features and the dedication of volunteer scribes made all the difference.',
    examType: 'CA Exams',
    score: 'All Levels Cleared',
    likes: 29,
    shares: 14,
    comments: 6,
    tags: ['CA', 'Accounting', 'Collaboration', 'Real-time'],
    date: '1 week ago',
    featured: false
  },
  {
    id: '5',
    name: 'Kavita Joshi',
    role: 'UPSC Aspirant',
    avatar: 'K',
    rating: 5,
    shortTestimonial: 'The platform\'s comprehensive accessibility tools helped me prepare for UPSC with confidence. From voice search to Braille-compatible materials.',
    fullTestimonial: 'UPSC preparation requires extensive reading and note-taking, which was challenging with my visual impairment. AI Literacy Bridge provided everything I needed: voice search to find relevant study materials, AI-powered summarization of long articles, and scribes who could help with complex diagrams and maps. The gamification elements kept me motivated throughout the 18-month preparation period. I successfully cleared the prelims and mains, and now serve as a role model for other visually impaired aspirants. This platform proves that with the right technology, no dream is out of reach.',
    examType: 'UPSC',
    score: 'Prelims & Mains Cleared',
    likes: 41,
    shares: 27,
    comments: 11,
    tags: ['UPSC', 'Civil Services', 'Motivation', 'Accessibility'],
    date: '2 months ago',
    featured: false
  },
  {
    id: '6',
    name: 'Arjun Reddy',
    role: 'MBA Student',
    avatar: 'A',
    rating: 5,
    shortTestimonial: 'The personalized scribe matching and real-time collaboration helped me track my progress and identify weak areas. It was a game-changer.',
    fullTestimonial: 'Pursuing an MBA with visual impairment seemed impossible until I found this platform. The AI matching system connected me with scribes who specialized in business studies and could explain complex case studies effectively. The collaborative study sessions with my scribe improved my understanding of business concepts significantly. I graduated with a 3.8 GPA and now work as a business analyst. This platform doesn\'t just help you study - it helps you succeed.',
    examType: 'MBA Entrance',
    score: '99th Percentile',
    likes: 35,
    shares: 18,
    comments: 9,
    tags: ['MBA', 'Business', 'Collaboration', 'Success Story'],
    date: '6 weeks ago',
    featured: false
  }
]

export function TestimonialsSection() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [likedTestimonials, setLikedTestimonials] = useState<Set<string>>(new Set())
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'featured' | 'students' | 'scribes'>('all')
  const [showModal, setShowModal] = useState(false)

  const handleLike = (testimonialId: string) => {
    setLikedTestimonials(prev => {
      const newSet = new Set(prev)
      if (newSet.has(testimonialId)) {
        newSet.delete(testimonialId)
      } else {
        newSet.add(testimonialId)
      }
      return newSet
    })
  }

  const toggleExpanded = (testimonialId: string) => {
    setExpandedTestimonials(prev => {
      const newSet = new Set(prev)
      if (newSet.has(testimonialId)) {
        newSet.delete(testimonialId)
      } else {
        newSet.add(testimonialId)
      }
      return newSet
    })
  }

  const filteredTestimonials = testimonialsData.filter(testimonial => {
    switch (filter) {
      case 'featured':
        return testimonial.featured
      case 'students':
        return testimonial.role.includes('Student')
      case 'scribes':
        return testimonial.role.includes('Scribe')
      default:
        return true
    }
  })

  const featuredTestimonials = testimonialsData.filter(t => t.featured)

  return (
    <div className="space-y-8">
      {/* Featured Testimonial Carousel */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 text-yellow-500 mr-2" />
          Featured Success Stories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{testimonial.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>

                <p className="text-gray-700 mb-4 italic">"{testimonial.shortTestimonial}"</p>

                {testimonial.score && (
                  <div className="bg-white/50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-900">
                      🎯 {testimonial.examType}: {testimonial.score}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(testimonial.id)}
                      className={`text-gray-600 hover:text-red-500 ${likedTestimonials.has(testimonial.id) ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${likedTestimonials.has(testimonial.id) ? 'fill-current' : ''}`} />
                      {testimonial.likes + (likedTestimonials.has(testimonial.id) ? 1 : 0)}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Share2 className="h-4 w-4 mr-1" />
                      {testimonial.shares}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTestimonial(testimonial)
                      setShowModal(true)
                    }}
                  >
                    Read Full Story
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Stories
        </Button>
        <Button
          variant={filter === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('featured')}
        >
          Featured
        </Button>
        <Button
          variant={filter === 'students' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('students')}
        >
          Students
        </Button>
        <Button
          variant={filter === 'scribes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('scribes')}
        >
          Volunteers
        </Button>
      </div>

      {/* All Testimonials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${
                    testimonial.role.includes('Student')
                      ? 'from-blue-500 to-purple-500'
                      : 'from-green-500 to-teal-500'
                  } rounded-full flex items-center justify-center text-white font-semibold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 italic line-clamp-4">
                "{expandedTestimonials.has(testimonial.id) ? testimonial.fullTestimonial : testimonial.shortTestimonial}"
              </p>

              {testimonial.score && (
                <div className="bg-gray-50 rounded-lg p-2 mb-3">
                  <p className="text-xs font-medium text-gray-900 text-center">
                    {testimonial.examType}: {testimonial.score}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mb-4">
                {testimonial.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {testimonial.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{testimonial.tags.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(testimonial.id)}
                    className={`text-gray-600 hover:text-red-500 text-xs ${likedTestimonials.has(testimonial.id) ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-3 w-3 mr-1 ${likedTestimonials.has(testimonial.id) ? 'fill-current' : ''}`} />
                    {testimonial.likes + (likedTestimonials.has(testimonial.id) ? 1 : 0)}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 text-xs">
                    <Share2 className="h-3 w-3 mr-1" />
                    {testimonial.shares}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {testimonial.comments}
                  </Button>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(testimonial.id)}
                    className="text-gray-600 text-xs"
                  >
                    {expandedTestimonials.has(testimonial.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 text-xs"
                    onClick={() => {
                      setSelectedTestimonial(testimonial)
                      setShowModal(true)
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Testimonial Modal */}
      {showModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${
                    selectedTestimonial.role.includes('Student')
                      ? 'from-blue-500 to-purple-500'
                      : 'from-green-500 to-teal-500'
                  } rounded-full flex items-center justify-center text-white font-bold`}>
                    {selectedTestimonial.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTestimonial.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTestimonial.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedTestimonial(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {[...Array(selectedTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600">• {selectedTestimonial.date}</span>
                </div>

                {selectedTestimonial.score && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">
                      🎯 {selectedTestimonial.examType}: {selectedTestimonial.score}
                    </p>
                  </div>
                )}

                <p className="text-gray-700 leading-relaxed">
                  {selectedTestimonial.fullTestimonial}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedTestimonial.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      onClick={() => handleLike(selectedTestimonial.id)}
                      className={`text-gray-600 hover:text-red-500 ${likedTestimonials.has(selectedTestimonial.id) ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${likedTestimonials.has(selectedTestimonial.id) ? 'fill-current' : ''}`} />
                      {selectedTestimonial.likes + (likedTestimonials.has(selectedTestimonial.id) ? 1 : 0)}
                    </Button>
                    <Button variant="ghost" className="text-gray-600">
                      <Share2 className="h-4 w-4 mr-2" />
                      {selectedTestimonial.shares}
                    </Button>
                    <Button variant="ghost" className="text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {selectedTestimonial.comments}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setShowModal(false)
                    setSelectedTestimonial(null)
                  }}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}