import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { getFoodParsingPrompt, getFlareAnalysisPrompt } from '@/lib/prompts';

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
    const { description, type, riskScore, factors } = body as {
      description?: string;
      type: 'food_parse' | 'flare_analysis';
      riskScore?: number;
      factors?: Array<{ factor: string; detail: string; direction: string }>;
    };

    if (!type) {
      return NextResponse.json(
        { error: 'Analysis type is required' },
        { status: 400 }
      );
    }

    const client = getAzureClient();

    if (type === 'food_parse') {
      if (!description) {
        return NextResponse.json(
          { error: 'Food description is required' },
          { status: 400 }
        );
      }

      const completion = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-5.2-chat',
        messages: [
          { role: 'system', content: getFoodParsingPrompt(description) },
          { role: 'user', content: description },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content || '[]';

      let parsed;
      try {
        const result = JSON.parse(content);
        parsed = Array.isArray(result) ? result : result.items || result.foods || [result];
      } catch {
        parsed = [];
      }

      return NextResponse.json({ items: parsed });
    }

    if (type === 'flare_analysis') {
      if (riskScore === undefined || !factors) {
        return NextResponse.json(
          { error: 'Risk score and factors are required for flare analysis' },
          { status: 400 }
        );
      }

      let prompt = getFlareAnalysisPrompt(riskScore, factors);
      if (description) {
        prompt += `\n\nAdditional context: ${description}`;
      }

      const response = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-5.2-chat',
        max_completion_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const analysis = response.choices[0]?.message?.content || '';

      return NextResponse.json({ analysis });
    }

    return NextResponse.json(
      { error: 'Invalid analysis type. Use "food_parse" or "flare_analysis".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    );
  }
}
