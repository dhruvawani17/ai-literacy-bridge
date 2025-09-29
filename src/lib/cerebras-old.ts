import { CerebrasConfig, CerebrasResponse } from '@/types'
import { localLlamaClient } from './local-llama'

export class CerebrasClient {
  private config: CerebrasConfig
  private baseURL: string

  constructor(config: CerebrasConfig) {
    this.config = config
    // Use Ollama local endpoint or fallback to OpenAI-compatible endpoint
    this.baseURL = config.endpoint || 'http://localhost:11434/v1'
  }

  async generateResponse(
    prompt: string,
    options?: {
      maxTokens?: number
      temperature?: number
      systemPrompt?: string
      context?: string[]
    }
  ): Promise<CerebrasResponse> {
    const messages = []
    
    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      })
    }

    if (options?.context && options.context.length > 0) {
      messages.push({
        role: 'system',
        content: `Context from previous interactions: ${options.context.join('\n')}`
      })
    }

    messages.push({
      role: 'user',
      content: prompt
    })

    try {
      // First try Ollama local endpoint
      let response;
      try {
        response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model || 'llama3.1:8b',
            messages,
            max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
            temperature: options?.temperature || this.config.temperature || 0.7,
            stream: false
          })
        })
      } catch (ollamaError) {
        console.warn('Ollama not available, trying OpenAI-compatible endpoint...')
        // Fallback to OpenAI-compatible API
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'fallback-key'}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: options?.maxTokens || 1000,
            temperature: options?.temperature || 0.7,
            stream: false
          })
        })
      }

      if (!response || !response.ok) {
        // Final fallback - return a mock response for development
        return {
          content: `I'm an AI tutor here to help you learn. Due to API connectivity issues, I'm running in demo mode. How can I assist you with your studies today?`,
          usage: {
            promptTokens: 50,
            completionTokens: 30,
            totalTokens: 80
          },
          metadata: {
            model: 'demo-mode',
            finishReason: 'stop'
          }
        }
      }

      const data = await response.json()
      
      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        metadata: {
          model: data.model || 'unknown',
          finishReason: data.choices[0].finish_reason || 'stop'
        }
      }
    } catch (error) {
      console.error('AI API call failed:', error)
      // Return a helpful fallback response instead of throwing
      return {
        content: `I apologize, but I'm having trouble connecting to my AI services right now. However, I can still help you! Please ask me about ${prompt.includes('math') ? 'mathematics' : prompt.includes('science') ? 'science' : 'your studies'} and I'll do my best to provide helpful information.`,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        metadata: {
          model: 'fallback',
          finishReason: 'error'
        }
      }
    }
  }

  async generateEducationalContent(
    topic: string,
    subject: string,
    grade: number,
    language: string = 'en',
    accessibilityNeeds: string[] = []
  ): Promise<string> {
    const accessibilityPrompt = accessibilityNeeds.length > 0 
      ? `Make this content accessible for students with: ${accessibilityNeeds.join(', ')}. `
      : ''

    const systemPrompt = `You are an expert AI tutor specializing in personalized education for underserved communities. 
    You have deep knowledge of NCERT curriculum, Khan Academy content, and UNESCO educational standards.
    
    Subject: ${subject} (Grade ${grade})
    Topic: ${topic}
    Language: ${language}
    ${accessibilityPrompt}
    
    Provide clear, engaging educational content that:
    1. Breaks down complex concepts into simple steps
    2. Uses relatable examples from Indian/local context when possible
    3. Includes practical applications
    4. Accommodates different learning styles
    5. Provides audio-friendly descriptions for visual concepts
    
    Be encouraging and supportive, especially for students who may lack educational resources.`

    const prompt = `Please explain ${topic} in ${subject} for a grade ${grade} student. Make it engaging and easy to understand.`

    try {
      // First try the main API
      const response = await this.generateResponse(prompt, {
        systemPrompt,
        maxTokens: 1000,
        temperature: 0.7
      })
      return response.content
    } catch (error) {
      console.warn('Main API failed, trying local Llama client...')
      // Fallback to local Llama client
      try {
        return await localLlamaClient.generateEducationalContent(topic, subject, grade, language)
      } catch (localError) {
        console.error('Local Llama client failed:', localError)
        // Final fallback with educational response
        return this.generateOfflineEducationalContent(topic, subject, grade)
      }
    }
  }

  private generateOfflineEducationalContent(topic: string, subject: string, grade: number): string {
    const subjectMap: { [key: string]: string } = {
      mathematics: `Let's explore ${topic} in mathematics! This concept is fundamental to understanding numbers and problem-solving.`,
      science: `${topic} is a fascinating area of science! Let's discover how this concept works in our daily lives.`,
      english: `In English, ${topic} helps us communicate more effectively and express our thoughts clearly.`,
      history: `Understanding ${topic} in history helps us learn from the past and make sense of our world today.`,
      geography: `${topic} in geography shows us how our world is connected and how places influence each other.`
    }

    const baseContent = subjectMap[subject.toLowerCase()] || `Let's learn about ${topic} together!`
    
    return `${baseContent}

    Since I'm currently working offline, I encourage you to:
    
    📚 **For Grade ${grade} students:**
    - Break this topic into smaller parts and study them one by one
    - Try to connect ${topic} to things you see in daily life
    - Practice with examples and ask questions
    - Don't hesitate to review the basics if needed
    
  private generateOfflineEducationalContent(topic: string, subject: string, grade: number): string {
    const subjectMap: { [key: string]: string } = {
      mathematics: `Let's explore ${topic} in mathematics! This concept is fundamental to understanding numbers and problem-solving.`,
      science: `${topic} is a fascinating area of science! Let's discover how this concept works in our daily lives.`,
      english: `In English, ${topic} helps us communicate more effectively and express our thoughts clearly.`,
      history: `Understanding ${topic} in history helps us learn from the past and make sense of our world today.`,
      geography: `${topic} in geography shows us how our world is connected and how places influence each other.`
    }

    const baseContent = subjectMap[subject.toLowerCase()] || `Let's learn about ${topic} together!`
    
    return `${baseContent}

    Since I'm currently working offline, I encourage you to:
    
    📚 **For Grade ${grade} students:**
    - Break this topic into smaller parts and study them one by one
    - Try to connect ${topic} to things you see in daily life
    - Practice with examples and ask questions
    - Don't hesitate to review the basics if needed
    
    🎯 **Study Tips:**
    - Write down key points as you learn
    - Explain the concept to someone else (teaching helps learning!)
    - Look for patterns and connections
    - Take breaks when you feel overwhelmed
    
    I'm here to help guide your learning journey, even when offline. What specific part of ${topic} would you like to focus on first?`
  }
  }

  async generateVisualizationCode(
    topic: string,
    type: 'animation' | 'interactive' | 'chart' | 'diagram',
    framework: 'manim' | 'threejs' | 'p5js' = 'threejs'
  ): Promise<{ code: string, audioDescription: string }> {
    const systemPrompt = `You are an expert in creating educational visualizations using ${framework}. 
    Generate clean, well-commented code that creates engaging visual learning experiences.
    Also provide detailed audio descriptions for blind/visually impaired students.`

    const prompt = `Create a ${type} visualization for "${topic}" using ${framework}. 
    Return both the complete code and a detailed audio description of what the visualization shows.
    Format your response as JSON with 'code' and 'audioDescription' fields.`

    const response = await this.generateResponse(prompt, {
      systemPrompt,
      maxTokens: 2000
    })

    try {
      return JSON.parse(response.content)
    } catch {
      return {
        code: response.content,
        audioDescription: 'Generated visualization with interactive elements'
      }
    }
  }

  async generatePersonalizedLearningPath(
    studentHistory: any[],
    currentTopic: string,
    weaknesses: string[],
    strengths: string[]
  ): Promise<string> {
    const context = studentHistory.map(h => 
      `Session: ${h.topic}, Performance: ${h.score}, Issues: ${h.issues?.join(', ') || 'none'}`
    )

    const systemPrompt = `You are an AI tutor with perfect memory of this student's learning journey.
    Use the context to provide personalized guidance that builds on their strengths and addresses weaknesses.`

    const prompt = `Based on the student's learning history and current performance:
    Strengths: ${strengths.join(', ')}
    Weaknesses: ${weaknesses.join(', ')}
    Current topic: ${currentTopic}
    
    Provide a personalized learning strategy and next steps.`

    const response = await this.generateResponse(prompt, {
      systemPrompt,
      context,
      maxTokens: 1000
    })

    return response.content
  }
}

// Singleton instance
let cerebrasClient: CerebrasClient | null = null

export function getCerebrasClient(): CerebrasClient {
  if (!cerebrasClient) {
    const config: CerebrasConfig = {
      apiKey: process.env.CEREBRAS_API_KEY || '',
      endpoint: process.env.CEREBRAS_ENDPOINT || 'https://api.cerebras.ai/v1',
      model: process.env.CEREBRAS_MODEL || 'llama3.1-8b',
      maxTokens: 2048,
      temperature: 0.7
    }
    cerebrasClient = new CerebrasClient(config)
  }
  return cerebrasClient
}

// Fallback to OpenAI if Cerebras is not available
export async function generateWithFallback(
  prompt: string,
  options?: any
): Promise<string> {
  try {
    const client = getCerebrasClient()
    const response = await client.generateResponse(prompt, options)
    return response.content
  } catch (error) {
    console.warn('Cerebras failed, falling back to alternative:', error)
    // Here you would implement OpenAI fallback
    return `AI Response: ${prompt} (Generated with fallback model)`
  }
}