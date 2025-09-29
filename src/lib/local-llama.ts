/**
 * Local Llama Client - Direct integration with Llama models
 * This provides a fallback when external APIs are not available
 */

export class LocalLlamaClient {
  private model: string
  private isReady: boolean = false

  constructor(model: string = 'llama3.1:8b') {
    this.model = model
    this.initialize()
  }

  private async initialize() {
    try {
      // Check if Ollama is available locally
      const response = await fetch('http://localhost:11434/api/version', {
        method: 'GET',
      })
      if (response.ok) {
        this.isReady = true
        console.log('Ollama service detected and ready')
      }
    } catch (error) {
      console.warn('Ollama not available, using fallback responses')
      this.isReady = false
    }
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.isReady) {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt: systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
              max_tokens: 1000
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          return data.response || 'I apologize, but I could not generate a response.'
        }
      } catch (error) {
        console.error('Ollama API error:', error)
      }
    }

    // Fallback educational responses based on prompt content
    return this.generateFallbackResponse(prompt)
  }

  private generateFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()
    
    if (lowerPrompt.includes('math') || lowerPrompt.includes('algebra') || lowerPrompt.includes('geometry')) {
      return `I'd be happy to help you with mathematics! ${prompt.includes('?') ? 'For this problem' : 'In general'}, let's break it down step by step. Mathematics is all about understanding patterns and relationships. What specific part would you like me to explain more clearly?`
    }
    
    if (lowerPrompt.includes('science') || lowerPrompt.includes('physics') || lowerPrompt.includes('chemistry') || lowerPrompt.includes('biology')) {
      return `Science is fascinating! ${prompt.includes('?') ? 'To answer your question' : 'Regarding your topic'}, let's explore this concept together. Science helps us understand the world around us through observation and experimentation. What would you like to learn more about?`
    }
    
    if (lowerPrompt.includes('english') || lowerPrompt.includes('literature') || lowerPrompt.includes('writing')) {
      return `Language and literature are powerful tools for communication and expression! ${prompt.includes('?') ? 'For your question' : 'In this area'}, we can explore grammar, vocabulary, and literary techniques. What specific aspect of English would you like to focus on?`
    }
    
    if (lowerPrompt.includes('history') || lowerPrompt.includes('social')) {
      return `History helps us understand how we got to where we are today! ${prompt.includes('?') ? 'Regarding your question' : 'In this subject'}, we can examine causes, effects, and the experiences of people in different time periods. What historical topic interests you most?`
    }
    
    // General educational response
    return `Thank you for your question! While I'm currently running in offline mode, I'm still here to help you learn. Could you tell me more about what you're studying? I can provide guidance on mathematics, science, English, history, and many other subjects. What would you like to explore together?`
  }

  async generateEducationalContent(
    topic: string, 
    subject: string, 
    grade: number, 
    language: string = 'en-US'
  ): Promise<string> {
    const systemPrompt = `You are an expert AI tutor specializing in ${subject} for grade ${grade} students. 
    Provide educational content about ${topic} in a clear, engaging way suitable for the student's level.
    Use simple language and provide examples when helpful.
    If the student has accessibility needs, describe visual concepts clearly.`

    return this.generateResponse(`Please teach me about ${topic} in ${subject}`, systemPrompt)
  }
}

// Export singleton instance
export const localLlamaClient = new LocalLlamaClient()