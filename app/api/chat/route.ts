// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client safely
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }
  return new Groq({ apiKey });
};

export async function POST(req: Request) {
  try {
    const groq = getGroqClient();
    const { messages, metadata } = await req.json();

    // Validate request payload
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Create system prompt from metadata
    const systemPrompt = `You are an AI clone twin named ${metadata.modelName}. 
      Your role is: ${metadata.role}. 
      Your knowledge base: ${metadata.textSample}.
      Always respond in-character as the AI clone twin.`;

    // Create the chat completion
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system')
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024
    });

    return NextResponse.json({
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}