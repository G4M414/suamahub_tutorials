import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';
import { slideUnits, OUTPUT, isValidAssetUrl, separateByTrack } from '@/lib/shotstack-timeline';

/**
 * Transforma todas las URLs de Drive (uc?id=X) en el JSON del edit a URLs de
 * nuestro proxy server-side (/api/drive/proxy?id=X). El Studio SDK renderiza
 * en el browser donde las URLs de Drive fallan por CORS en canvas/fetch.
 */
function proxyDriveUrls(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.replace(/https?:\/\/drive\.google\.com\/uc\?[^"'\s]*/g, (url) => {
      const m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      return m ? `/api/drive/proxy?id=${m[1]}` : url;
    });
  }
  if (Array.isArray(obj)) return obj.map(proxyDriveUrls);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, proxyDriveUrls(v)]));
  }
  return obj;
}

const D_PREVIEW = 6; // duración fija por slide en el preview (sin fetchar audio)

/**
 * Devuelve el objeto `edit` completo (mismo formato que Shotstack API) para
 * renderizarlo en el browser con el Shotstack Studio SDK. Usa duración fija
 * por slide para ser instantáneo (no descarga los MP3 para medir duración).
 */
export async function POST(req: NextRequest) {
  let project: Project;
  try {
    project = (await req.json()).project as Project;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const units = slideUnits(project);
  const allClips: unknown[] = [];
  const audioClips: unknown[] = [];

  // Tabla de start times por slide (para navegación en el preview)
  const slideStarts: { id: string; title: string; start: number }[] = [];

  let offset = 0;
  for (const u of units) {
    slideStarts.push({ id: u.id, title: u.title, start: offset });
    const clips = u.build(offset);
    for (const c of clips) (c as Record<string, unknown>).length = D_PREVIEW;
    allClips.push(...clips);
    if (isValidAssetUrl(u.audioUrl)) {
      audioClips.push({
        asset: { type: 'audio', src: u.audioUrl!, volume: 1 },
        start: offset,
        length: D_PREVIEW,
      });
    }
    offset += D_PREVIEW;
  }

  // Multi-track: track 0 (logos), track 1 (html5), track 2 (panel images)
  const trackMap = separateByTrack(allClips.filter(Boolean));
  const visualTracks = [...trackMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .filter(([, cs]) => cs.length > 0)
    .map(([, cs]) => ({ clips: cs }));
  const tracks: unknown[] = [...visualTracks];
  if (audioClips.length > 0) tracks.push({ clips: audioClips });

  const timeline = { background: project.identity.colors.background, tracks };
  // Proxear todas las URLs de Drive antes de pasar al Studio SDK (CORS en browser).
  const edit = proxyDriveUrls({ timeline, output: OUTPUT });

  return NextResponse.json({ edit, slideStarts, totalDuration: offset });
}
