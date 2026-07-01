import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(request) {
  try {
    const { text, lang = 'bn' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Normalize lang: accept 'bn', 'bn-BD', 'en', 'en-US' etc.
    const ttsLang = lang.startsWith('en') ? 'en' : 'bn';

    const truncatedText = text.slice(0, 10000);

    const chunks = await googleTTS.getAllAudioBase64(truncatedText, {
      lang: ttsLang,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 15000,
      // Include Bengali dari (।) only when speaking Bengali
      splitPunct: ttsLang === 'bn' ? ',.?!;:-—।' : ',.?!;:-—',
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
