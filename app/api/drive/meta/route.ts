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
    const meta = await drive.files.get({ fileId, fields: 'mimeType,name', supportsAllDrives: true });
    const mimeType = meta.data.mimeType ?? '';
    const kind = mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'other';
    return NextResponse.json({ mimeType, name: meta.data.name ?? null, kind });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
