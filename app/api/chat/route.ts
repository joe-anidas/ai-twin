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

    // Enhanced system prompt with completion guarantees
    const systemPrompt = `
    # Fitness Coach Identity
    You are ${metadata.modelName}, a professional ${metadata.role} coach.
    Specialization: ${metadata.textSample}

    # Response Rules
    1. ALWAYS complete your full response before ending
    2. When providing plans/lists, include ALL items completely
    3. Never stop mid-sentence or leave incomplete thoughts
    4. Match response length to question:
       - Short (1-5 words): 1-2 sentences max
       - Medium (6-12 words): 2-3 sentences
       - Complex (13+ words): 3-4 sentences
    5. For workout plans, use this format:
       "Day X: [Workout] - [Sets]x[Reps] (e.g., Day 1: Squats - 3x10)"

    # Example Complete Responses
    User: "cheatsheet for 30 days gym plan"
    Response: "Here's your 30-day plan:
    Day 1-5: Full-body basics 3x8
    Day 6-10: Push/Pull split 4x6
    ...(complete all 30 days)"`;

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const questionComplexity = lastUserMessage.split(' ').length;

    // Dynamic token allocation
    let maxTokens = 200;
    if (questionComplexity <= 5) maxTokens = 150;
    if (questionComplexity > 12) maxTokens = 300;

    // Generate initial completion
    let completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: systemPrompt.replace(/\s+/g, ' ').trim() 
        },
        ...messages.filter(m => m.role !== 'system').slice(-3)
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: maxTokens,
      frequency_penalty: 0.4,
      presence_penalty: 0.4
    });

    let response = completion.choices[0]?.message?.content?.trim() || '';

    // Completion validation and repair
    if (isIncomplete(response)) {
      const repairPrompt = `Complete this fitness response properly:\n\n"${response}"`;
      
      const repairCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: repairPrompt }],
        model: 'llama3-70b-8192',
        max_tokens: 150
      });
      
      response = response + ' ' + repairCompletion.choices[0]?.message?.content?.trim();
    }

    // Final validation
    const validationRegex = /cannot help|don'?t know|as an ai|language model/i;
    const requiresRedirect = !response || validationRegex.test(response);

    // Fitness-themed fallbacks
    const fallbackResponses = [
      `${metadata.modelName} here! Let's focus on your ${metadata.role} goals. What specifically do you need?`,
      `I live for ${metadata.role}! Ask me anything workout-related.`,
      `My specialty is ${metadata.textSample.split(',')[0]}. How can I help?`
    ];

    return NextResponse.json({
      response: requiresRedirect
        ? fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        : formatResponse(response, questionComplexity)
    });

  } catch (error) {
    console.error('[Fitness Coach Error]', error);
    return NextResponse.json(
      { error: `${metadata?.modelName || 'Your coach'} is catching their breath! Try again in 30 seconds.` },
      { status: 503 }
    );
  }
}

// Helper functions
function isIncomplete(response: string): boolean {
  return (
    response.endsWith(':') ||
    response.endsWith('-') ||
    !/[.!?]\s*$/.test(response) ||
    (response.includes('Day') && !/\bDay \d+/.test(response.split('\n').pop() || ''))
  );
}

function formatResponse(response: string, complexity: number): string {
  // Ensure workout plans have complete days
  if (response.includes('Day') && response.includes(':')) {
    const days = response.split('\n').filter(line => line.trim().startsWith('Day'));
    if (days.length > 0 && !days[days.length-1].includes('-')) {
      return response.replace(days[days.length-1], '');
    }
  }
  
  // Trim only if significantly over limit
  const sentences = response.split(/[.!?]+/).filter(s => s.trim());
  const maxSentences = complexity <= 5 ? 2 : complexity <= 12 ? 3 : 4;
  
  return sentences.length > maxSentences + 1
    ? sentences.slice(0, maxSentences).join('.') + '.'
    : response;
}