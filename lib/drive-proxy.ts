import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// En desarrollo, el certificado TLS interceptado del entorno rompe la conexión a
// Google APIs; se desactiva la verificación solo fuera de producción.
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

// Cache en memoria del proceso. Los assets de Drive NO cambian (IDs estables), así
// que se descargan UNA vez y se sirven instantáneamente después. Crítico para el
// preview: sin esto, el proxy bajaba el archivo COMPLETO de Drive en CADA request
// (incluida cada petición Range del audio), lo que frenaba el render-loop del Studio
// SDK → el reproductor se desincronizaba y re-seekeaba (el "eco"/"patina" del audio).
type CachedFile = { buffer: Buffer; contentType: string };
const fileCache = new Map<string, CachedFile>();
// Promesas en vuelo: si llegan varias requests del mismo file antes de que termine
// la descarga (típico: <img> + SDK + Range), comparten la MISMA descarga.
const inFlight = new Map<string, Promise<CachedFile>>();
const CACHE_MAX = 120;

async function getDriveFile(fileId: string): Promise<CachedFile> {
  const hit = fileCache.get(fileId);
  if (hit) {
    // LRU: re-insertar al final para que sea el último en desalojarse.
    fileCache.delete(fileId);
    fileCache.set(fileId, hit);
    return hit;
  }
  const pending = inFlight.get(fileId);
  if (pending) return pending;

  const task = (async () => {
    const drive = getDriveClient();
    // Las dos llamadas en paralelo (antes eran secuenciales → doble latencia).
    const [media, meta] = await Promise.all([
      drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' }),
      drive.files.get({ fileId, fields: 'mimeType', supportsAllDrives: true }),
    ]);
    const val: CachedFile = {
      buffer: Buffer.from(media.data as ArrayBuffer),
      contentType: meta.data.mimeType ?? 'image/jpeg',
    };
    fileCache.set(fileId, val);
    if (fileCache.size > CACHE_MAX) {
      const oldest = fileCache.keys().next().value;
      if (oldest !== undefined) fileCache.delete(oldest);
    }
    return val;
  })();

  inFlight.set(fileId, task);
  try {
    return await task;
  } finally {
    inFlight.delete(fileId);
  }
}

/**
 * Descarga un archivo de Google Drive con la service account y lo sirve por HTTP,
 * con soporte de Range (para que <video>/<audio> reproduzcan y se puedan buscar) y
 * cabeceras CORS (el canvas de Pixi del Studio SDK pide los assets con
 * crossorigin="anonymous"). Lógica única usada por las dos rutas del proxy:
 * `/api/drive/proxy?id=X` (para <img>) y `/api/drive/proxy/X.jpg` (para el SDK).
 */
export async function serveDriveFile(fileId: string, range: string | null): Promise<NextResponse> {
  const { buffer, contentType } = await getDriveFile(fileId);
  const total = buffer.length;

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  };

  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : total - 1;
    if (Number.isNaN(start) || start < 0) start = 0;
    if (Number.isNaN(end) || end >= total) end = total - 1;
    if (start > end) start = 0;
    const chunk = buffer.subarray(start, end + 1);
    // Uint8Array con backing ArrayBuffer propio → satisface BodyInit (Buffer no tipa directo).
    const body = Uint8Array.from(chunk);
    return new NextResponse(body, {
      status: 206,
      headers: {
        ...cors,
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.length),
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  }

  const fullBody = Uint8Array.from(buffer);
  return new NextResponse(fullBody, {
    headers: {
      ...cors,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(total),
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
