/**
 * Direct Llama Integration - Simple offline-first approach
 * No external APIs required - works with local models or provides intelligent fallbacks
 */

interface LlamaResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata: {
    model: string
    finishReason: string
  }
}

export class DirectLlamaClient {
  private model: string
  private isOnline: boolean = false

  constructor(model: string = 'llama3.1:8b') {
    this.model = model
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<LlamaResponse> {
    // Try to use local Llama if available
    try {
      const localResponse = await this.tryLocalLlama(prompt, systemPrompt)
      if (localResponse) {
        return localResponse
      }
    } catch (error) {
      console.log('Local Llama not available, using intelligent fallback')
    }

    // Use intelligent fallback system
    const content = this.generateIntelligentResponse(prompt, systemPrompt)
    
    return {
      content,
      usage: {
        promptTokens: prompt.length / 4, // Rough token estimate
        completionTokens: content.length / 4,
        totalTokens: (prompt.length + content.length) / 4
      },
      metadata: {
        model: 'offline-llama',
        finishReason: 'stop'
      }
    }
  }

  private async tryLocalLlama(prompt: string, systemPrompt?: string): Promise<LlamaResponse | null> {
    try {
      // Try Ollama first
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:` : prompt,
          stream: false,
          options: { temperature: 0.7, top_p: 0.9 }
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json()
        return {
          content: data.response || '',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          metadata: { model: 'ollama-' + this.model, finishReason: 'stop' }
        }
      }
    } catch (error) {
      // Ollama not available, continue to fallback
    }

    return null
  }

  private generateIntelligentResponse(prompt: string, systemPrompt?: string): string {
    const lowerPrompt = prompt.toLowerCase()
    const isQuestion = prompt.includes('?')
    
    // Analyze the prompt to determine context
    const context = this.analyzeContext(lowerPrompt, systemPrompt)
    
    // Generate contextual response
    switch (context.type) {
      case 'mathematics':
        return this.generateMathResponse(prompt, context)
      case 'science':
        return this.generateScienceResponse(prompt, context)
      case 'english':
        return this.generateEnglishResponse(prompt, context)
      case 'history':
        return this.generateHistoryResponse(prompt, context)
      case 'greeting':
        return this.generateGreetingResponse(context)
      case 'help':
        return this.generateHelpResponse(context)
      default:
        return this.generateGeneralResponse(prompt, context)
    }
  }

  private analyzeContext(prompt: string, systemPrompt?: string) {
    const context = {
      type: 'general',
      subject: '',
      grade: 8,
      isQuestion: prompt.includes('?'),
      keywords: [],
      difficulty: 'medium'
    }

    // Extract subject from system prompt or prompt
    const fullText = `${systemPrompt || ''} ${prompt}`.toLowerCase()
    
    if (fullText.includes('math') || fullText.includes('algebra') || fullText.includes('geometry') || 
        fullText.includes('calculus') || fullText.includes('equation') || fullText.includes('number')) {
      context.type = 'mathematics'
      context.subject = 'Mathematics'
    } else if (fullText.includes('science') || fullText.includes('physics') || fullText.includes('chemistry') || 
               fullText.includes('biology') || fullText.includes('atom') || fullText.includes('cell')) {
      context.type = 'science'
      context.subject = 'Science'
    } else if (fullText.includes('english') || fullText.includes('grammar') || fullText.includes('writing') || 
               fullText.includes('literature') || fullText.includes('essay')) {
      context.type = 'english'
      context.subject = 'English'
    } else if (fullText.includes('history') || fullText.includes('ancient') || fullText.includes('war') || 
               fullText.includes('civilization') || fullText.includes('empire')) {
      context.type = 'history'
      context.subject = 'History'
    } else if (fullText.includes('hello') || fullText.includes('hi ') || fullText.includes('help')) {
      context.type = prompt.includes('help') ? 'help' : 'greeting'
    }

    // Extract grade level
    const gradeMatch = fullText.match(/grade (\d+)|class (\d+)|(\d+)th grade/)
    if (gradeMatch) {
      context.grade = parseInt(gradeMatch[1] || gradeMatch[2] || gradeMatch[3])
    }

    return context
  }

  private generateMathResponse(prompt: string, context: any): string {
    const examples = [
      "Let's break this down step by step.",
      "In mathematics, we solve problems by identifying what we know and what we need to find.",
      "This is a great question! Let's work through it together.",
      "Mathematics is all about patterns and relationships. Let's explore this concept."
    ]

    const intro = examples[Math.floor(Math.random() * examples.length)]
    
    if (prompt.includes('algebra')) {
      return `${intro}

In algebra, we work with variables (like x and y) to represent unknown numbers. Here's how to approach this:

1. **Identify** what the problem is asking for
2. **Set up** equations using the given information  
3. **Solve** step by step using algebraic rules
4. **Check** your answer by substituting back

For grade ${context.grade} students, remember that algebra is like solving puzzles - each step gets you closer to the answer. Would you like me to walk through a specific example?`
    }

    if (prompt.includes('geometry')) {
      return `${intro}

Geometry helps us understand shapes, sizes, and spatial relationships. Here's what's important:

🔺 **Key Concepts:**
- Points, lines, and angles are the building blocks
- Area tells us how much space is inside a shape
- Perimeter is the distance around the outside
- Volume measures how much a 3D shape can hold

For your grade level, focus on visualizing the shapes and understanding how they relate to real objects around you. What specific geometry topic would you like to explore?`
    }

    return `${intro}

Mathematics is a powerful tool for solving real-world problems. Whether we're working with:
- **Numbers and Operations** (addition, subtraction, multiplication, division)
- **Patterns and Algebra** (finding unknowns, working with variables)
- **Geometry** (shapes, measurement, spatial reasoning)
- **Data and Statistics** (collecting, organizing, and interpreting information)

Each area builds on the others. What specific math topic can I help you with today?`
  }

  private generateScienceResponse(prompt: string, context: any): string {
    const intro = "Science helps us understand how the world works! Let's explore this together."

    if (prompt.includes('physics')) {
      return `${intro}

Physics studies matter, energy, and how they interact. Key concepts include:

⚡ **Energy**: The ability to do work or cause change
🏃 **Motion**: How objects move through space and time  
🔋 **Forces**: Pushes and pulls that change motion
🌊 **Waves**: How energy travels (sound, light, etc.)

Real-world connections: Physics explains everything from why balls bounce to how smartphones work! What physics concept interests you most?`
    }

    if (prompt.includes('chemistry')) {
      return `${intro}

Chemistry is the study of matter and how it changes. Think of it as the "recipe book" of the universe!

🧪 **Key Ideas:**
- **Atoms**: The tiny building blocks of everything
- **Elements**: Pure substances made of one type of atom
- **Reactions**: When substances combine or break apart
- **States of Matter**: Solid, liquid, gas (and plasma!)

You see chemistry everywhere - cooking, cleaning, even breathing! What chemical process would you like to understand better?`
    }

    return `${intro}

Science is all about asking questions and finding answers through observation and experimentation. Whether we're studying:
- **Life Science** (plants, animals, ecosystems)
- **Physical Science** (matter, energy, forces)  
- **Earth Science** (weather, rocks, space)

The scientific method helps us learn: observe, question, hypothesis, experiment, analyze, conclude. What scientific mystery shall we investigate today?`
  }

  private generateEnglishResponse(prompt: string, context: any): string {
    if (prompt.includes('grammar')) {
      return `Great question about grammar! Grammar is like the roadmap of language - it helps us communicate clearly.

📝 **Grammar Basics:**
- **Nouns**: People, places, things, or ideas
- **Verbs**: Action words or states of being
- **Adjectives**: Words that describe nouns
- **Adverbs**: Words that describe verbs, adjectives, or other adverbs

Think of grammar as the rules that help everyone understand each other. Just like games have rules to make them fun and fair, language has rules to make communication clear and effective.

What specific grammar concept would you like to practice?`
    }

    if (prompt.includes('writing')) {
      return `Writing is a powerful way to share your thoughts and ideas! Let's make your writing stronger.

✍️ **Good Writing Tips:**
1. **Plan First**: Think about your main idea before you start
2. **Organize**: Put your thoughts in logical order
3. **Be Clear**: Use simple, direct language
4. **Show, Don't Tell**: Use specific details and examples
5. **Revise**: Read your work and make it better

Remember: Every great writer started as a beginner. The more you practice, the better you'll become! What kind of writing are you working on?`
    }

    return `English language arts helps us communicate effectively and understand the world through literature.

📚 **Key Areas:**
- **Reading Comprehension**: Understanding what you read
- **Writing Skills**: Expressing your ideas clearly
- **Speaking & Listening**: Communicating with others
- **Literature**: Learning from stories and poems

Language is your superpower - it lets you share ideas, tell stories, and connect with people everywhere! How can I help you strengthen your English skills today?`
  }

  private generateHistoryResponse(prompt: string, context: any): string {
    return `History is the story of humanity! It helps us understand how we got to where we are today.

🏛️ **Why Study History:**
- Learn from past successes and mistakes
- Understand different cultures and perspectives  
- See how societies change over time
- Connect past events to current situations

🔍 **Historical Thinking:**
- **Cause and Effect**: What led to major events?
- **Change and Continuity**: What changed and what stayed the same?
- **Perspective**: How did different people experience events?
- **Evidence**: What sources tell us about the past?

History isn't just memorizing dates - it's about understanding people and their choices. What historical period or event interests you most?`
  }

  private generateGreetingResponse(context: any): string {
    const greetings = [
      "Hello! I'm your AI tutor, ready to help you learn and grow.",
      "Hi there! Welcome to your personalized learning experience.",
      "Greetings! I'm here to make learning fun and accessible for everyone.",
      "Hello! Ready to explore new knowledge together?"
    ]

    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    
    return `${greeting}

🎯 **I can help you with:**
- Mathematics (algebra, geometry, arithmetic)
- Science (physics, chemistry, biology)
- English (grammar, writing, literature)
- History (world events, cultures, civilizations)
- And much more!

🔊 **Accessibility Features:**
- Voice-friendly explanations
- Step-by-step breakdowns
- Visual descriptions for all concepts
- Multiple learning approaches

I'm designed especially for students who need extra support and accessible learning materials. What subject would you like to explore today?`
  }

  private generateHelpResponse(context: any): string {
    return `I'm here to help you succeed in your learning journey! Here's how I can assist:

📚 **Academic Support:**
- Explain difficult concepts in simple terms
- Break down complex problems step-by-step
- Provide examples and practice opportunities
- Connect learning to real-world applications

♿ **Accessibility Features:**
- Audio-friendly explanations for all visual content
- Clear, structured responses for screen readers
- Multiple ways to understand each concept
- Patient, encouraging guidance

🎯 **Learning Strategies:**
- Identify your learning style
- Suggest study techniques that work for you
- Help build confidence in challenging subjects
- Celebrate your progress along the way

🤝 **How to Get Help:**
- Ask specific questions about topics you're studying
- Request explanations when something is unclear
- Ask for examples or practice problems
- Let me know if you need information presented differently

What can I help you learn today? Just ask me about any subject you're studying!`
  }

  private generateGeneralResponse(prompt: string, context: any): string {
    return `Thank you for your question! I'm your AI tutor, designed to help students learn in an accessible, engaging way.

Based on your question, I can see you're interested in learning more. Here's how I can help:

🎓 **Personalized Learning:**
- Adapt explanations to your grade level and learning style
- Provide multiple ways to understand concepts
- Break down complex ideas into manageable steps
- Connect new learning to things you already know

🔊 **Accessibility First:**
- All explanations work well with screen readers
- Visual concepts include detailed audio descriptions
- Content designed for diverse learning needs
- Patient, encouraging support

Could you tell me more about what you're studying or what specific topic you'd like help with? I'm here to make learning easier and more enjoyable for you!`
  }

  // Educational content generation
  async generateEducationalContent(
    topic: string,
    subject: string,
    grade: number,
    language: string = 'en'
  ): Promise<string> {
    const systemPrompt = `You are an expert tutor for ${subject}, grade ${grade}. Create accessible, engaging educational content about ${topic}.`
    const prompt = `Explain ${topic} in ${subject} for grade ${grade} students. Make it clear, engaging, and accessible.`
    
    const response = await this.generateResponse(prompt, systemPrompt)
    return response.content
  }
}

// Export singleton instance
export const directLlamaClient = new DirectLlamaClient()
export default DirectLlamaClient