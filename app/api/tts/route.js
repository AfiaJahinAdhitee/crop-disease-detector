import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const maxTextLength = 10000;
    const truncatedText = text.slice(0, maxTextLength);

    const chunks = await googleTTS.getAllAudioBase64(truncatedText, {
      lang: 'bn',
      slow: false,
      host: 'https://translate.google.com',
      timeout: 15000,
      splitPunct: ',.?!;:-—।', // Including bangla dari '।' for proper splitting
    });

    const buffers = chunks.map(chunk => Buffer.from(chunk.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': finalBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
