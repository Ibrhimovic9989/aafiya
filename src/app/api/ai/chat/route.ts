import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { getGutaSystemPrompt } from '@/lib/prompts';

function getAzureClient() {
  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_CHAT_API_VERSION || '2024-04-01-preview',
    deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-5.2-chat',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, context } = body as {
      message: string;
      history?: Array<{ role: string; content: string }>;
      context?: {
        symptoms?: any[];
        sleep?: any[];
        food?: any[];
        mood?: any[];
        cycle?: any[];
      };
    };

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const client = getAzureClient();
    const systemPrompt = getGutaSystemPrompt(context);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (history?.length) {
      for (const msg of history) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-5.2-chat',
      max_completion_tokens: 1024,
      messages,
    });

    const reply = response.choices[0]?.message?.content || '';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
