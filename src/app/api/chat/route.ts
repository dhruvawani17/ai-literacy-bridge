import { NextRequest, NextResponse } from 'next/server'

interface ChatRequest {
  message: string
  subject?: string
  gradeLevel?: number
  language?: string
  context?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { message, subject = 'general', gradeLevel = 8, language = 'en', context = [] }: ChatRequest = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get Cerebras configuration from environment
    const cerebrasApiKey = process.env.CEREBRAS_API_KEY
    const cerebrasEndpoint = process.env.CEREBRAS_ENDPOINT || 'https://api.cerebras.ai/v1'
    const cerebrasModel = process.env.CEREBRAS_MODEL || 'llama3.1-8b'

    if (!cerebrasApiKey) {
      return NextResponse.json(
        { error: 'Cerebras API key not configured' },
        { status: 500 }
      )
    }

    // Create system prompt for educational content
    const systemPrompt = `You are an AI tutor specialized in ${subject} for grade ${gradeLevel} students. 
    Provide clear, age-appropriate explanations that are engaging and educational. 
    Focus on helping students understand concepts through examples and analogies.
    Be encouraging and supportive. Keep responses concise but informative.
    If the student seems to have accessibility needs, be extra descriptive and clear.`

    // Prepare request body for Cerebras API
    const requestBody = {
      model: cerebrasModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...context.map((msg, index) => ({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: msg
        })),
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    }

    console.log('Making Cerebras API request:', {
      endpoint: cerebrasEndpoint,
      model: cerebrasModel,
      messageLength: message.length
    })

    // Call Cerebras API
    const response = await fetch(cerebrasEndpoint + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cerebrasApiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cerebras API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })

      // Return fallback response for API errors
      return NextResponse.json({
        content: "I'm having trouble connecting to my knowledge base right now. Let me try to help you with what I know: " + 
                "Could you please rephrase your question? I want to make sure I give you the best educational guidance possible.",
        fallback: true,
        error: `API Error: ${response.status}`
      })
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Cerebras API')
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      metadata: {
        model: data.model || cerebrasModel,
        subject,
        gradeLevel
      }
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    
    // Return educational fallback response
    return NextResponse.json({
      content: "I'm experiencing some technical difficulties, but I'm still here to help! " +
              "Could you try asking your question in a different way? I want to make sure I can assist you with your learning.",
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}