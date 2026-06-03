import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

// Devuelve el mimeType de un archivo de Drive y si es imagen/video. Lo usa Medios
// para setear correctamente el tipo del asset al pegar una URL de Drive (que no
// trae extensión), así un MP4 de portada se trata como video y no como imagen.
export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get('id');
  if (!fileId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const drive = getDriveClient();
    const meta = await drive.files.get({ fileId, fields: 'mimeType', supportsAllDrives: true });
    const mimeType = meta.data.mimeType ?? '';
    // Solo devolvemos la categoría (no el nombre del archivo) para no filtrar
    // metadatos de archivos a los que el caller no debería tener visibilidad.
    const kind = mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'other';
    return NextResponse.json({ kind });
  } catch (err) {
    // Detalle solo en el server; respuesta genérica al cliente (no diferenciar 404/403).
    console.error('[drive/meta] error:', err);
    return NextResponse.json({ error: 'No se pudo obtener el tipo del archivo' }, { status: 500 });
  }
}
