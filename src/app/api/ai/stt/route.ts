import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_STT_DEPLOYMENT || 'gpt-4o-transcribe';
    const apiVersion = process.env.AZURE_OPENAI_STT_API_VERSION || '2025-03-01-preview';

    const url = `${endpoint}/openai/deployments/${deployment}/audio/transcriptions?api-version=${apiVersion}`;

    const azureForm = new FormData();
    azureForm.append('file', audioFile, audioFile.name || 'audio.webm');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: azureForm,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Azure STT error:', response.status, errText);
      return NextResponse.json({ error: 'Transcription failed', details: errText }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error('STT API error:', error);
    return NextResponse.json({ error: error.message || 'STT failed' }, { status: 500 });
  }
}
