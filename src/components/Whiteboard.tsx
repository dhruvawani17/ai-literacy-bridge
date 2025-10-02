'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Palette,
  Move,
  ZoomIn,
  ZoomOut,
  Save,
  Share2,
  Users,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useFirebaseAuth } from '@/lib/firebase-auth-provider'
import { gamificationService } from '@/lib/gamification-service'

interface DrawingPath {
  id: string
  points: number[]
  color: string
  width: number
  tool: 'pen' | 'eraser'
  userId: string
  timestamp: Date
}

interface WhiteboardSession {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  collaborators: string[]
  isPublic: boolean
  thumbnail?: string
}

const Whiteboard: React.FC = () => {
  const { user } = useFirebaseAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'select' | 'text'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(2)
  const [paths, setPaths] = useState<DrawingPath[]>([])
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [sessions, setSessions] = useState<WhiteboardSession[]>([])
  const [currentSession, setCurrentSession] = useState<WhiteboardSession | null>(null)
  const [showSessionList, setShowSessionList] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ]

  useEffect(() => {
    if (user && db) {
      loadSessions()
    }
  }, [user])

  useEffect(() => {
    if (currentSession) {
      loadSessionData()
    }
  }, [currentSession])

  useEffect(() => {
    drawCanvas()
  }, [paths, zoom, panOffset])

  const loadSessions = async () => {
    if (!user || !db) return

    try {
      const q = query(
        collection(db, 'whiteboard-sessions'),
        where('createdBy', '==', user.uid),
        orderBy('updatedAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sessionsData: WhiteboardSession[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as WhiteboardSession[]

        setSessions(sessionsData)
      })

      return unsubscribe
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const loadSessionData = async () => {
    if (!currentSession || !db) return

    try {
      const q = query(
        collection(db, 'whiteboard-paths'),
        where('sessionId', '==', currentSession.id),
        orderBy('timestamp')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const pathsData: DrawingPath[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        })) as DrawingPath[]

        setPaths(pathsData)
      })

      return unsubscribe
    } catch (error) {
      console.error('Error loading session data:', error)
    }
  }

  const createNewSession = async () => {
    if (!user || !db) return

    try {
      const sessionData = {
        title: `Whiteboard Session ${new Date().toLocaleDateString()}`,
        description: 'New collaborative whiteboard session',
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        collaborators: [user.uid],
        isPublic: false
      }

      const docRef = await addDoc(collection(db, 'whiteboard-sessions'), sessionData)
      const newSession = { id: docRef.id, ...sessionData }

      setCurrentSession(newSession)
      setShowSessionList(false)

      // Award points for creating a session
      await gamificationService.awardPoints(user.uid, 15, 'whiteboard_session_created')
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const savePath = async (path: DrawingPath) => {
    if (!currentSession || !db) return

    try {
      await addDoc(collection(db, 'whiteboard-paths'), {
        ...path,
        sessionId: currentSession.id,
        timestamp: new Date()
      })

      // Update session timestamp
      await updateDoc(doc(db, 'whiteboard-sessions', currentSession.id), {
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error saving path:', error)
    }
  }

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(panOffset.x, panOffset.y)

    // Draw grid (optional)
    drawGrid(ctx)

    // Draw all paths
    paths.forEach(path => {
      drawPath(ctx, path)
    })

    // Draw current path being drawn
    if (currentPath.length > 0) {
      const tempPath: DrawingPath = {
        id: 'temp',
        points: currentPath,
        color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
        width: brushSize,
        tool: currentTool === 'eraser' ? 'eraser' : 'pen',
        userId: user?.uid || '',
        timestamp: new Date()
      }
      drawPath(ctx, tempPath)
    }

    ctx.restore()
  }, [paths, currentPath, zoom, panOffset, currentColor, brushSize, currentTool, user])

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 0.5

    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, ctx.canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }
  }

  const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length < 4) return

    ctx.strokeStyle = path.color
    ctx.lineWidth = path.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.beginPath()
    ctx.moveTo(path.points[0], path.points[1])

    for (let i = 2; i < path.points.length; i += 2) {
      ctx.lineTo(path.points[i], path.points[i + 1])
    }

    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  }

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select' || currentTool === 'text') return

    const { x, y } = getCanvasCoordinates(e)
    setIsDrawing(true)
    setCurrentPath([x, y])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool === 'select' || currentTool === 'text') return

    const { x, y } = getCanvasCoordinates(e)
    setCurrentPath(prev => [...prev, x, y])
  }

  const handleMouseUp = () => {
    if (!isDrawing || currentTool === 'select' || currentTool === 'text') return

    if (currentPath.length > 4) {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        points: [...currentPath],
        color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
        width: brushSize,
        tool: currentTool === 'eraser' ? 'eraser' : 'pen',
        userId: user?.uid || '',
        timestamp: new Date()
      }

      setPaths(prev => [...prev, newPath])
      savePath(newPath)
    }

    setIsDrawing(false)
    setCurrentPath([])
  }

  const clearCanvas = async () => {
    if (!currentSession || !db) return

    try {
      // Delete all paths for this session
      const q = query(
        collection(db, 'whiteboard-paths'),
        where('sessionId', '==', currentSession.id)
      )
      const snapshot = await getDocs(q)

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      setPaths([])
    } catch (error) {
      console.error('Error clearing canvas:', error)
    }
  }

  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard-${currentSession?.title || 'export'}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const undo = () => {
    if (paths.length === 0) return
    const lastPath = paths[paths.length - 1]
    setPaths(prev => prev.slice(0, -1))

    // Remove from database
    if (db && lastPath.id !== 'temp') {
      deleteDoc(doc(db, 'whiteboard-paths', lastPath.id))
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Pen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Please Sign In</h3>
          <p className="text-gray-600">Sign in to access the collaborative whiteboard.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-[600px] lg:h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-b lg:border-b-0 lg:border-r border-gray-200 transition-all duration-300 ${
        showSessionList ? 'h-64 lg:h-auto lg:w-80' : 'h-12 lg:h-auto lg:w-16'
      }`}>
        <div className="p-3 lg:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold text-gray-900 ${showSessionList ? '' : 'hidden lg:block'}`}>
              Sessions
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSessionList(!showSessionList)}
              className="lg:flex-shrink-0"
            >
              {showSessionList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {showSessionList && (
            <Button onClick={createNewSession} className="w-full mt-2" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          )}
        </div>

        {showSessionList && (
          <div className="p-3 lg:p-4 space-y-2 max-h-48 lg:max-h-none overflow-y-auto">
            {sessions.map(session => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all ${
                  currentSession?.id === session.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setCurrentSession(session)}
              >
                <CardContent className="p-2 lg:p-3">
                  <h3 className="font-medium text-sm mb-1 truncate">{session.title}</h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{session.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{session.updatedAt.toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-xs">
                      {session.collaborators.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-2 lg:p-4 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1 lg:flex-initial">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                {currentSession?.title || 'Whiteboard'}
              </h1>
              {currentSession && (
                <Badge variant="outline" className="hidden sm:flex">
                  {currentSession.collaborators.length} collaborators
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto lg:overflow-x-visible">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Drawing Tools */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2 flex-shrink-0">
                <Button
                  variant={currentTool === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('pen')}
                  title="Pen"
                >
                  <Pen className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentTool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('eraser')}
                  title="Eraser"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('select')}
                  title="Select"
                  className="hidden sm:flex"
                >
                  <Move className="h-4 w-4" />
                </Button>
              </div>

              {/* Color Picker */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2 flex-shrink-0">
                {colors.slice(0, 6).map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${
                      currentColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                    title={`Color: ${color}`}
                  />
                ))}
                <button
                  className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center text-xs font-bold"
                  onClick={() => setCurrentColor(colors[6] || '#000000')}
                  title="More colors"
                >
                  +
                </button>
              </div>

              {/* Brush Size */}
              <div className="hidden sm:flex items-center gap-2 border-r border-gray-200 pr-2 mr-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-sm text-gray-600 w-6">{brushSize}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={undo} title="Undo">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={clearCanvas} title="Clear">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={exportCanvas} title="Export">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: `
                radial-gradient(circle, #f0f0f0 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Whiteboard