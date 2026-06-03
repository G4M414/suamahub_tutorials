import { google } from 'googleapis';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export type DriveKind = 'image' | 'video' | 'other';

/** Cliente de Drive de solo lectura con la service account. */
export function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

/** Extrae el fileId de cualquier formato de URL de Drive (uc?id=, /file/d/ID, /d/ID). */
export function driveFileId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ?? url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/**
 * Detecta si un archivo de Drive es imagen, video u otro, por su mimeType.
 * FUENTE ÚNICA de esta detección: la usan /api/drive/meta (pegado manual en
 * Medios) y /api/notion/load-assets (carga automática desde Notion). Centralizado
 * a propósito para que las dos rutas nunca vuelvan a desincronizarse (el bug que
 * trataba la portada-video como imagen al recargar assets de Notion).
 */
export async function detectDriveKind(fileId: string): Promise<DriveKind> {
  const drive = getDriveClient();
  const meta = await drive.files.get({ fileId, fields: 'mimeType', supportsAllDrives: true });
  const mimeType = meta.data.mimeType ?? '';
  return mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : 'other';
}
