import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  metadata: {
    modelName: string;
    role: string;
    textSample: string;
  };
}

export async function POST(req: Request) {
  let metadata: ChatRequest['metadata'] | undefined;

  try {
    const requestBody = await req.json() as ChatRequest;
    metadata = requestBody.metadata;
    const { messages } = requestBody;

    // Dynamic system prompt
    const systemPrompt = `
    # Identity Framework
    You are ${metadata.modelName}, a ${metadata.role} specialist.
    Core Knowledge: ${metadata.textSample}

    # Response Guidelines
    1. Use varied phrasings for similar questions
    2. Maintain ${metadata.modelName} persona consistently
    3. Example greetings:
       - "Greetings! I'm ${metadata.modelName}..."
       - "Hello! Your ${metadata.role} expert here..."
       - "Hi! Let's discuss ${metadata.role}..."

    # Redirect Examples
    User: How's the weather?
    Response: My expertise is ${metadata.role}. Let's focus on ${metadata.textSample.split(', ')[0]}!

    User: Tell me a joke
    Response: While humor is fun, I specialize in ${metadata.role}. Ask me about ${metadata.textSample.split(', ')[1]}!`;

    // Context management
    const recentMessages = messages
      .filter(m => m.role !== 'system')
      .slice(-4)
      .map(m => ({
        role: m.role,
        content: m.content.trim()
      }));

    // Generate completion
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: systemPrompt.replace(/\s+/g, ' ').trim() 
        },
        ...recentMessages
      ],
      model: 'llama3-70b-8192',
      temperature: 0.65,
      top_p: 0.9,
      max_tokens: 130,
      frequency_penalty: 0.6,
      presence_penalty: 0.6
    });

    let response = completion.choices[0]?.message?.content?.trim() || '';

    // Validation patterns
    const validationRegex = new RegExp(
      `\\b(${[
        'cannot help',
        'don\'t know',
        'as an ai',
        'language model'
      ].join('|')})\\b`, 'i'
    );

    // Dynamic fallbacks
    const fallbackResponses = [
      `${metadata.modelName} here! Let's focus on ${metadata.role}.`,
      `My specialty is ${metadata.role}. What specific aspect interests you?`,
      `Let's explore ${metadata.textSample.split(', ')[0]} together!`,
      `${metadata.role} is my expertise. Where shall we start?`
    ];

    const requiresRedirect = !response || validationRegex.test(response);

    return NextResponse.json({
      response: requiresRedirect
        ? fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        : response
    });

  } catch (error) {
    console.error('[Chat Error]', error);
    return NextResponse.json(
      { 
        error: `${metadata?.modelName || 'Our specialist'} is temporarily unavailable. Please try again.` 
      },
      { status: 503 }
    );
  }
}