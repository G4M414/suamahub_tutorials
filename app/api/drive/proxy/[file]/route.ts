import { NextRequest, NextResponse } from 'next/server';
import { serveDriveFile } from '@/lib/drive-proxy';

/**
 * Proxy de assets de Drive con la EXTENSIÓN en el path: `/api/drive/proxy/FILE_ID.jpg`.
 * El Studio SDK renderiza en un canvas de Pixi, que elige el parser del asset por la
 * extensión de la URL (descarta el `?query` antes de mirarla). Sin extensión, Pixi
 * rechaza la imagen con "could not be loaded as we don't know how to parse it" y
 * dibuja el placeholder gris con una X. La extensión solo selecciona el parser; el
 * navegador decodifica por content-type, así que un JPEG servido como `.jpg` o un
 * MP4 como `.mp4` siempre funcionan, independientemente del tipo real del archivo.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // `file` = "FILE_ID.ext" — los IDs de Drive no contienen puntos, así que basta
  // con quitar la última extensión para recuperar el id.
  const fileId = file.replace(/\.[^.]+$/, '');
  if (!fileId) return new NextResponse('Missing id', { status: 400 });
  try {
    return await serveDriveFile(fileId, req.headers.get('range'));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Error: ${msg}`, { status: 500 });
  }
}
