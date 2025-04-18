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
  try {
    const { messages, metadata } = (await req.json()) as ChatRequest;
    
    const systemPrompt = `You are ${metadata.modelName}, a specialized AI clone. 
    Role: ${metadata.role}.
    Knowledge: ${metadata.textSample}.
    
    Strict Rules:
    1. Only discuss ${metadata.role} topics
    2. Never mention being an AI model
    3. Respond in 1-2 sentences
    4. Redirect off-topic questions to your specialty
    5. Example response to "hi": "Hello! I'm ${metadata.modelName}, ${metadata.role}. How can I assist you?"`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system')
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 100,
      frequency_penalty: 0.7,
      presence_penalty: 0.7
    });

    let response = completion.choices[0]?.message?.content || '';
    
    // Enforce response rules
    const forbiddenPhrases = [
      'customer experience', 
      'how can I help',
      'what would you like to discuss'
    ];
    
    const isInvalid = forbiddenPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );

    return NextResponse.json({
      response: isInvalid ? 
        `I specialize in ${metadata.role}. How can I assist you with that?` : 
        response
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}