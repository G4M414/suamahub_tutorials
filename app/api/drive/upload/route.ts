import { NextRequest, NextResponse } from 'next/server';
import { uploadToDrive } from '@/lib/google-drive';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const clientName = (formData.get('clientName') as string) || 'Sin nombre';
    const subfolder = (formData.get('subfolder') as 'Imágenes' | 'Videos' | 'Logo' | 'Audio') || 'Imágenes';

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    const driveUrl = await uploadToDrive({
      buffer,
      mimeType: file.type,
      filename,
      clientName,
      subfolder,
    });

    return NextResponse.json({ url: driveUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Error Drive: ${msg}` }, { status: 500 });
  }
}
