import { CerebrasConfig, CerebrasResponse } from '@/types'
import { directLlamaClient } from './direct-llama'

export class CerebrasClient {
  private config: CerebrasConfig

  constructor(config: CerebrasConfig) {
    this.config = config
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
    try {
      // Use the direct Llama client which handles all fallbacks internally
      const response = await directLlamaClient.generateResponse(prompt, options?.systemPrompt)
      
      return {
        content: response.content,
        usage: response.usage,
        metadata: response.metadata
      }
    } catch (error) {
      console.error('Direct Llama client failed:', error)
      
      // Final emergency fallback
      return {
        content: `I'm here to help you learn! While I'm having some technical difficulties, I can still provide guidance. You asked about: "${prompt}". Let me know what specific aspect you'd like to focus on, and I'll do my best to help you understand it step by step.`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        metadata: { model: 'emergency-fallback', finishReason: 'stop' }
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
    try {
      // Use the direct Llama client for educational content
      return await directLlamaClient.generateEducationalContent(topic, subject, grade, language)
    } catch (error) {
      console.error('Educational content generation failed:', error)
      return this.generateOfflineEducationalContent(topic, subject, grade)
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

🎯 **Study Tips:**
- Write down key points as you learn
- Explain the concept to someone else (teaching helps learning!)
- Look for patterns and connections
- Take breaks when you feel overwhelmed

I'm here to help guide your learning journey, even when offline. What specific part of ${topic} would you like to focus on first?`
  }

  async generateVisualizationCode(
    topic: string,
    type: 'animation' | 'interactive' | 'chart' | 'diagram',
    framework: 'manim' | 'threejs' | 'p5js' = 'threejs'
  ): Promise<{ code: string, audioDescription: string }> {
    const systemPrompt = `You are an expert in creating educational visualizations using ${framework}.
    Create accessible visualizations with detailed audio descriptions for visually impaired students.
    Include proper alt text and descriptive comments in the code.`

    const prompt = `Create a ${type} visualization for "${topic}" using ${framework}.
    Provide both the complete code and a detailed audio description of what the visualization shows.
    Make sure the visualization is educational and engaging for students.`

    try {
      const response = await this.generateResponse(prompt, {
        systemPrompt,
        maxTokens: 2000
      })

      // Parse response to extract code and audio description
      const content = response.content
      const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/)
      const code = codeMatch ? codeMatch[1] : content

      // Extract audio description (usually after "Audio Description:" or similar)
      const audioMatch = content.match(/(?:Audio Description|Description):?\s*([\s\S]*?)(?:```|$)/i)
      const audioDescription = audioMatch ? audioMatch[1].trim() : 
        `This visualization demonstrates ${topic} through interactive ${type} elements. The visual representation helps students understand the concept through dynamic movement and clear visual relationships.`

      return { code, audioDescription }
    } catch (error) {
      console.error('Visualization generation failed:', error)
      return {
        code: `// Fallback ${framework} visualization for ${topic}\n// Direct Llama mode - placeholder code\nconsole.log("${topic} visualization would appear here");`,
        audioDescription: `This would be an interactive visualization of ${topic} showing key concepts through ${type} animation. Students would be able to see how different elements interact and change over time.`
      }
    }
  }
}

// Create and export a singleton instance
export const getCerebrasClient = () => {
  const config: CerebrasConfig = {
    apiKey: 'direct-llama', // Not used in direct mode
    endpoint: 'direct', // Using direct Llama client
    model: 'llama3.1:8b',
    maxTokens: 1000,
    temperature: 0.7
  }
  
  return new CerebrasClient(config)
}

export default CerebrasClient