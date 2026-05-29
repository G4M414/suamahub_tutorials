import { NextRequest, NextResponse } from 'next/server';
import { uploadToDrive } from '@/lib/google-drive';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, clientName, placeholderId, aspectRatio, model } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    // Nano Banana 2 = imagen-3.0-generate-001, GPT Image usa OpenAI (pendiente)
    const geminiModel = model === 'nanobanana' || !model
      ? 'imagen-3.0-generate-001'
      : 'imagen-3.0-generate-001'; // GPT Image 2.0 pendiente implementación OpenAI
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:predict?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio ?? '1:1',
          safetyFilterLevel: 'block_only_high',
          personGeneration: 'allow_adult',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const prediction = geminiData?.predictions?.[0];

    if (!prediction?.bytesBase64Encoded) {
      throw new Error('Gemini no devolvió imagen');
    }

    const mimeType: string = prediction.mimeType ?? 'image/jpeg';
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const buffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
    const filename = `${placeholderId ?? 'imagen'}_${Date.now()}.${ext}`;

    const driveUrl = await uploadToDrive({
      buffer,
      mimeType,
      filename,
      clientName: clientName || 'Sin nombre',
      subfolder: 'Imágenes',
    });

    return NextResponse.json({ url: driveUrl, mimeType });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
