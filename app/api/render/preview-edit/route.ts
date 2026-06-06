import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';
import { buildEdit } from '@/lib/shotstack-timeline';

// Extensión del proxy según el tipo de asset. El Studio SDK corre en un canvas de
// Pixi que elige el parser por la EXTENSIÓN del path de la URL (descarta el ?query
// antes de mirarla); sin extensión rechaza el asset y dibuja el placeholder con la X.
// La extensión solo selecciona el parser, no decodifica, así que cualquier extensión
// válida del tipo correcto sirve.
function proxyExt(assetType: unknown): string {
  if (assetType === 'video') return 'mp4';
  if (assetType === 'audio') return 'mp3';
  return 'jpg';
}

function driveId(url: string): string | null {
  const m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ?? url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/**
 * Transforma las URLs de Drive del JSON del edit a URLs de nuestro proxy server-side
 * CON extensión en el path (/api/drive/proxy/FILE_ID.jpg). El Studio SDK renderiza en
 * el browser, donde las URLs de Drive fallan por CORS y, sobre todo, Pixi necesita la
 * extensión para saber qué parser usar. Trabaja a nivel de objeto `asset` para elegir
 * la extensión correcta a partir de `asset.type` (imagen/video/audio).
 */
function proxyDriveUrls(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(proxyDriveUrls);
  if (obj && typeof obj === 'object') {
    const rec = obj as Record<string, unknown>;
    // Objeto asset con src de Drive → proxear con extensión según su tipo.
    if (typeof rec.src === 'string' && rec.src.includes('drive.google.com')) {
      const id = driveId(rec.src);
      if (id) return { ...rec, src: `/api/drive/proxy/${id}.${proxyExt(rec.type)}` };
    }
    return Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, proxyDriveUrls(v)]));
  }
  return obj;
}

/**
 * Devuelve el objeto `edit` completo (mismo formato que Shotstack API) para
 * renderizarlo en el browser con el Shotstack Studio SDK. Usa EXACTAMENTE el mismo
 * timeline que el MP4 final (`buildEdit`), que mide la duración real de cada voz en
 * off — así el audio NO se corta y el preview es fiel al render. Las URLs de Drive
 * se reescriben al proxy (CORS + extensión que necesita Pixi).
 */
export async function POST(req: NextRequest) {
  let project: Project;
  try {
    project = (await req.json()).project as Project;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { edit, totalDuration, slideStarts } = await buildEdit(project);
  // Proxear todas las URLs de Drive antes de pasar al Studio SDK (CORS en browser).
  const proxied = proxyDriveUrls(edit);

  return NextResponse.json({ edit: proxied, totalDuration, slideStarts });
}
