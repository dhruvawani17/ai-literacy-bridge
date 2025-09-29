'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Code, 
  Volume2, 
  Eye, 
  EyeOff,
  Loader2,
  Download,
  Share2
} from 'lucide-react'
import { useAccessibilityStore } from '@/store'
import { getCerebrasClient } from '@/lib/cerebras'
import { getVoiceManager } from '@/lib/accessibility'
import { cn } from '@/lib/utils'

interface VisualizationEngineProps {
  topic: string
  subject: string
  onVisualizationGenerated?: (code: string, audioDescription: string) => void
}

// Pre-built visualization templates for common topics
const VISUALIZATION_TEMPLATES = {
  'Water Cycle': {
    code: `
// Three.js Water Cycle Animation
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Create water particles
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create particle material
const particleMaterial = new THREE.PointsMaterial({
  color: 0x0077ff,
  size: 0.1
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Animate water particles rising (evaporation)
  const positions = particleSystem.geometry.attributes.position.array;
  
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] += 0.01; // Move particles up
    
    if (positions[i] > 5) {
      positions[i] = -5; // Reset to bottom
    }
  }
  
  particleSystem.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

animate();
    `,
    audioDescription: 'This animation shows the water cycle in action. Blue particles represent water molecules. They start at the bottom representing water in oceans and lakes. As the animation plays, you can hear the particles gradually rising upward, simulating evaporation caused by the sun\'s heat. When particles reach the top, they reset to the bottom, representing precipitation - rain falling back to earth. The continuous cycle demonstrates how water constantly moves between the earth\'s surface and the atmosphere.'
  },
  'Solar System': {
    code: `
// Three.js Solar System Animation  
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create Sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create Earth
const earthGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);

// Create orbit path
const earthOrbit = new THREE.Group();
earthOrbit.add(earth);
earth.position.x = 4;
scene.add(earthOrbit);

// Animation
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate Earth around Sun
  earthOrbit.rotation.y += 0.01;
  
  // Rotate Earth on its axis
  earth.rotation.y += 0.05;
  
  renderer.render(scene, camera);
}
    `,
    audioDescription: 'This visualization shows our solar system with the Sun at the center as a large yellow sphere. Earth appears as a smaller blue sphere orbiting around the Sun. As the animation progresses, you can observe two types of movement: Earth revolving around the Sun in a circular path, which takes one year in real life, and Earth rotating on its own axis, which creates day and night cycles every 24 hours. The relative sizes help students understand the scale difference between the Sun and Earth.'
  },
  'Photosynthesis': {
    code: `
// Interactive Photosynthesis Diagram
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create leaf structure
const leafGeometry = new THREE.PlaneGeometry(3, 2);
const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
scene.add(leaf);

// Create CO2 molecules (red spheres)
const co2Group = new THREE.Group();
for (let i = 0; i < 10; i++) {
  const co2Geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const co2Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const co2 = new THREE.Mesh(co2Geometry, co2Material);
  co2.position.set(Math.random() * 4 - 2, Math.random() * 2 + 3, 0);
  co2Group.add(co2);
}
scene.add(co2Group);

// Create oxygen molecules (blue spheres)  
const o2Group = new THREE.Group();
for (let i = 0; i < 8; i++) {
  const o2Geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const o2Material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
  const o2 = new THREE.Mesh(o2Geometry, o2Material);
  o2.position.set(Math.random() * 4 - 2, -3, 0);
  o2Group.add(o2);
}
scene.add(o2Group);

// Animation
function animate() {
  requestAnimationFrame(animate);
  
  // Move CO2 toward leaf
  co2Group.children.forEach(co2 => {
    if (co2.position.y > 0) {
      co2.position.y -= 0.02;
    } else {
      co2.position.y = Math.random() * 2 + 3;
    }
  });
  
  // Move O2 away from leaf
  o2Group.children.forEach(o2 => {
    o2.position.y -= 0.02;
    if (o2.position.y < -5) {
      o2.position.y = -1;
    }
  });
  
  renderer.render(scene, camera);
}
    `,
    audioDescription: 'This animation demonstrates photosynthesis, the process plants use to make food. The green rectangle represents a leaf. Red spheres represent carbon dioxide molecules from the air, moving downward toward the leaf. Inside the leaf, with energy from sunlight, carbon dioxide combines with water to produce glucose and oxygen. Blue spheres represent oxygen molecules being released from the leaf, moving away as a byproduct. This process is essential for life on Earth as plants produce the oxygen we breathe while removing carbon dioxide from the atmosphere.'
  }
}

export function VisualizationEngine({ topic, subject, onVisualizationGenerated }: VisualizationEngineProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [audioDescription, setAudioDescription] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const { voiceSettings, accessibilityPreferences } = useAccessibilityStore()
  const [voiceManager, setVoiceManager] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVoiceManager(getVoiceManager(voiceSettings))
    }
  }, [voiceSettings])

  // Check if we have a pre-built template
  const hasTemplate = topic in VISUALIZATION_TEMPLATES

  useEffect(() => {
    if (hasTemplate) {
      const template = VISUALIZATION_TEMPLATES[topic as keyof typeof VISUALIZATION_TEMPLATES]
      setGeneratedCode(template.code)
      setAudioDescription(template.audioDescription)
      onVisualizationGenerated?.(template.code, template.audioDescription)
    }
  }, [topic, hasTemplate, onVisualizationGenerated])

  const generateVisualization = async () => {
    setIsGenerating(true)
    
    try {
      const cerebras = getCerebrasClient()
      const prompt = customPrompt || `Create an educational visualization for "${topic}" in ${subject}`
      
      const result = await cerebras.generateVisualizationCode(
        prompt,
        'interactive',
        'threejs'
      )

      setGeneratedCode(result.code)
      setAudioDescription(result.audioDescription)
      onVisualizationGenerated?.(result.code, result.audioDescription)

    } catch (error) {
      console.error('Visualization generation failed:', error)
      
      // Fallback to a basic template
      const fallbackCode = `
// Basic ${topic} Visualization
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Create a simple geometric representation
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
      `
      
      setGeneratedCode(fallbackCode)
      setAudioDescription(`This is a basic 3D visualization for ${topic}. It shows a rotating green cube that helps demonstrate fundamental concepts in ${subject}.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const playAudioDescription = async () => {
    if (!voiceManager || !audioDescription) return

    try {
      setIsPlaying(true)
      await voiceManager.speak(audioDescription)
    } catch (error) {
      console.error('Audio playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (voiceManager) {
      voiceManager.synth?.cancel()
      setIsPlaying(false)
    }
  }

  const executeVisualization = () => {
    if (!canvasRef.current || !generatedCode) return

    try {
      // In a real implementation, you would safely execute the Three.js code
      // For demo purposes, we'll show a placeholder
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      
      // Simple demo animation
      let frame = 0
      const animate = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        
        // Draw a simple representation
        ctx.fillStyle = '#00ff00'
        const x = (Math.sin(frame * 0.02) * 100) + canvasRef.current!.width / 2
        const y = canvasRef.current!.height / 2
        
        ctx.beginPath()
        ctx.arc(x, y, 20, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#333'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(topic, canvasRef.current!.width / 2, 50)
        
        frame++
        animationRef.current = requestAnimationFrame(animate)
      }
      
      animate()
    } catch (error) {
      console.error('Visualization execution failed:', error)
    }
  }

  const resetVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  return (
    <div className={cn(
      "max-w-6xl mx-auto p-6",
      accessibilityPreferences.highContrast && "high-contrast",
      `font-size-${accessibilityPreferences.fontSize}`
    )}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interactive Learning Visualization</h1>
        <p className="text-muted-foreground">
          AI-generated educational visualization for <strong>{topic}</strong> in {subject}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {!hasTemplate && (
            <Button 
              onClick={generateVisualization} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  Generate Visualization
                </>
              )}
            </Button>
          )}
          
          {generatedCode && (
            <>
              <Button onClick={executeVisualization} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Run Animation
              </Button>
              
              <Button onClick={resetVisualization} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}

          <Button 
            onClick={isPlaying ? stopAudio : playAudioDescription}
            disabled={!audioDescription}
            variant="outline"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Play Description
              </>
            )}
          </Button>

          <Button 
            onClick={() => setShowCode(!showCode)}
            variant="ghost"
            disabled={!generatedCode}
          >
            {showCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
        </div>

        {hasTemplate && (
          <Badge variant="secondary" className="mb-4">
            <span className="mr-1">⚡</span> Pre-built template available
          </Badge>
        )}

        {!hasTemplate && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Visualization Request (Optional)
            </label>
            <Textarea
              placeholder="Describe specific aspects of the topic you want to visualize..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mb-2"
            />
          </div>
        )}
      </div>

      {/* Visualization Canvas */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-4">Visualization Output</h3>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full border rounded-lg bg-gray-50"
            aria-label={`Interactive visualization for ${topic}`}
          />
          {!generatedCode && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-2" />
                <p>Visualization will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Description */}
      {audioDescription && (
        <div className="bg-card p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            Audio Description
          </h3>
          <p className="text-sm leading-relaxed mb-4" role="region" aria-label="Audio description">
            {audioDescription}
          </p>
          <Button 
            onClick={playAudioDescription} 
            disabled={isPlaying}
            className="w-full md:w-auto"
          >
            {isPlaying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Listen to Description
              </>
            )}
          </Button>
        </div>
      )}

      {/* Generated Code */}
      {showCode && generatedCode && (
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generated Code</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  )
}