// Client-side API helper for secure Cerebras calls

export interface ChatAPIRequest {
  message: string
  subject?: string
  gradeLevel?: number
  language?: string
  context?: string[]
}

export interface ChatAPIResponse {
  content: string
  fallback?: boolean
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: {
    model: string
    subject: string
    gradeLevel: number
  }
}

export class SecureChatAPI {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async generateEducationalContent(
    message: string,
    subject: string = 'general',
    gradeLevel: number = 8,
    language: string = 'en',
    context: string[] = []
  ): Promise<string> {
    try {
      const requestBody: ChatAPIRequest = {
        message: message.trim(),
        subject,
        gradeLevel,
        language,
        context
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data: ChatAPIResponse = await response.json()
      
      if (data.fallback) {
        console.warn('Using fallback response:', data.error)
      }

      return data.content

    } catch (error) {
      console.error('Error calling chat API:', error)
      
      // Return educational fallback response
      return `I'm having trouble processing your question right now, but I'm still here to help! 
              Could you try rephrasing your question about ${subject}? 
              I want to make sure I provide you with the best educational support possible.`
    }
  }

  async generateResponse(
    prompt: string,
    options?: {
      maxTokens?: number
      temperature?: number
      systemPrompt?: string
      context?: string[]
    }
  ): Promise<{ content: string; usage?: any; metadata?: any }> {
    try {
      const content = await this.generateEducationalContent(
        prompt,
        'general',
        8,
        'en',
        options?.context || []
      )

      return {
        content,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        metadata: { model: 'cerebras-secure', subject: 'general' }
      }
    } catch (error) {
      console.error('Error in generateResponse:', error)
      return {
        content: "I'm experiencing some technical difficulties. Could you please try asking your question again?",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        metadata: { model: 'fallback', subject: 'general', error: true }
      }
    }
  }

  async generateVisualizationCode(
    subject: string,
    topic: string,
    type: 'chart' | 'diagram' | 'animation' | 'interactive' = 'interactive',
    framework: 'react' | 'd3' | 'threejs' | 'p5js' = 'react'
  ): Promise<{ code: string; audioDescription: string }> {
    try {
      const prompt = `Create an interactive ${type} visualization for teaching ${topic} in ${subject} using ${framework}. 
                     The visualization should be educational, accessible, and engaging for students.
                     Include code and a detailed audio description for accessibility.`
      
      const content = await this.generateEducationalContent(prompt, subject, 8, 'en', [])
      
      // Extract code and description (this is a simplified approach)
      const lines = content.split('\n')
      const codeStart = lines.findIndex(line => line.includes('```') || line.includes('code'))
      const code = codeStart >= 0 ? lines.slice(codeStart).join('\n') : content
      
      return {
        code,
        audioDescription: `Interactive visualization of ${topic} in ${subject}. ${content.substring(0, 200)}...`
      }
    } catch (error) {
      console.error('Error generating visualization:', error)
      return {
        code: `// Visualization for ${topic}\nconsole.log("Educational visualization would appear here");`,
        audioDescription: `This would be an interactive visualization of ${topic} showing key concepts and relationships.`
      }
    }
  }
}

// Create and export a singleton instance
export const getSecureChatAPI = () => {
  return new SecureChatAPI()
}

export default SecureChatAPI