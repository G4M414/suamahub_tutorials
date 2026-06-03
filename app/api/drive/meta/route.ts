import { NextRequest, NextResponse } from 'next/server';
import { detectDriveKind } from '@/lib/drive-kind';

// Devuelve si un archivo de Drive es imagen/video. Lo usa Medios para setear
// correctamente el tipo del asset al pegar una URL de Drive (que no trae
// extensión), así un MP4 de portada se trata como video y no como imagen.
// La detección vive en lib/drive-kind (fuente única, compartida con load-assets).
export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get('id');
  if (!fileId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const kind = await detectDriveKind(fileId);
    // Solo devolvemos la categoría (no el nombre del archivo) para no filtrar
    // metadatos de archivos a los que el caller no debería tener visibilidad.
    return NextResponse.json({ kind });
  } catch (err) {
    // Detalle solo en el server; respuesta genérica al cliente (no diferenciar 404/403).
    console.error('[drive/meta] error:', err);
    return NextResponse.json({ error: 'No se pudo obtener el tipo del archivo' }, { status: 500 });
  }
}
