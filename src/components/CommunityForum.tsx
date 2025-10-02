'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Flag,
  Search,
  Filter,
  Plus,
  Heart,
  Lightbulb,
  Users,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, doc, updateDoc, increment, where } from 'firebase/firestore'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { gamificationService } from '@/lib/gamification-service'

interface ForumPost {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  category: 'general' | 'study-tips' | 'exam-prep' | 'accessibility' | 'success-stories'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  likes: number
  replies: number
  isSticky?: boolean
  isAnnouncement?: boolean
}

interface ForumReply {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  likes: number
}

const CATEGORIES = [
  { id: 'general', name: 'General Discussion', icon: MessageSquare, color: 'bg-blue-100 text-blue-800' },
  { id: 'study-tips', name: 'Study Tips', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'exam-prep', name: 'Exam Preparation', icon: BookOpen, color: 'bg-green-100 text-green-800' },
  { id: 'accessibility', name: 'Accessibility', icon: Users, color: 'bg-purple-100 text-purple-800' },
  { id: 'success-stories', name: 'Success Stories', icon: TrendingUp, color: 'bg-pink-100 text-pink-800' }
]

export function CommunityForum({ onClose }: { onClose?: () => void }) {
  const { user } = useFirebaseAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as ForumPost['category'],
    tags: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [selectedCategory])

  const loadPosts = async () => {
    if (!db) return
    setIsLoading(true)
    try {
      let q = query(collection(db, 'forum-posts'), orderBy('createdAt', 'desc'), limit(50))

      if (selectedCategory !== 'all') {
        q = query(collection(db, 'forum-posts'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData: ForumPost[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as ForumPost[]

        setPosts(postsData)
        setIsLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error('Error loading posts:', error)
      setIsLoading(false)
    }
  }

  const createPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim() || !db) return

    try {
      await addDoc(collection(db, 'forum-posts'), {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous User',
        authorAvatar: user.photoURL,
        category: newPost.category,
        tags: newPost.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        replies: 0,
        isSticky: false,
        isAnnouncement: false
      })

      // Award points for creating a post
      await gamificationService.updateUserStats(user.uid, 'communityPosts', 1)
      await gamificationService.awardPoints(user.uid, 10, 'Created community forum post')

      setNewPost({ title: '', content: '', category: 'general', tags: [] })
      setShowCreatePost(false)
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const likePost = async (postId: string) => {
    if (!user || !db) return

    try {
      const postRef = doc(db, 'forum-posts', postId)
      await updateDoc(postRef, {
        likes: increment(1)
      })
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[0]
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Community Forum</h1>
              <p className="text-gray-600 mt-2">
                Connect with fellow students and scribes. Share tips, ask questions, and celebrate successes together.
              </p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {user && (
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>

        {/* Categories Overview */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {CATEGORIES.map(category => {
            const categoryPosts = posts.filter(post => post.category === category.id).length
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <category.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">{categoryPosts} posts</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Textarea
                placeholder="Share your thoughts, ask questions, or share your experiences..."
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                className="min-h-[120px]"
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value as ForumPost['category']})}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add tags (comma separated)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const tag = e.currentTarget.value.trim()
                      if (tag && !newPost.tags.includes(tag)) {
                        setNewPost({...newPost, tags: [...newPost.tags, tag]})
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              {newPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newPost.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => setNewPost({...newPost, tags: newPost.tags.filter(t => t !== tag)})}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
                <Button onClick={createPost} disabled={!newPost.title.trim() || !newPost.content.trim()}>
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to start a discussion!'}
                </p>
                {user && !searchQuery && (
                  <Button onClick={() => setShowCreatePost(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map(post => {
              const categoryInfo = getCategoryInfo(post.category)
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{post.authorName}</p>
                          <p className="text-xs text-gray-500">
                            {post.createdAt.toLocaleDateString()} • {post.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={categoryInfo.color}>
                        <categoryInfo.icon className="h-3 w-3 mr-1" />
                        {categoryInfo.name}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePost(post.id)}
                          className="text-gray-600 hover:text-red-500"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.replies}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}