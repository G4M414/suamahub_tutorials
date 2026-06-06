import { NextRequest, NextResponse } from 'next/server';
import { serveDriveFile } from '@/lib/drive-proxy';

/**
 * Proxy de assets de Drive en formato query: `/api/drive/proxy?id=FILE_ID`.
 * Lo usan los <img>/<video> de las pantallas (Medios, Identidad, iframe preview),
 * que no necesitan extensión en la URL. El Studio SDK (Pixi) usa la variante con
 * extensión en el path (`/api/drive/proxy/FILE_ID.jpg`) — ver `[file]/route.ts`.
 */
export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get('id');
  if (!fileId) return new NextResponse('Missing id', { status: 400 });
  try {
    return await serveDriveFile(fileId, req.headers.get('range'));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Error: ${msg}`, { status: 500 });
  }
}
