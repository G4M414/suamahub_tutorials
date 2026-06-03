import { NextRequest, NextResponse } from 'next/server';
import { nfetch } from '@/lib/notion-fetch';
import { detectDriveKind, driveFileId, type DriveKind } from '@/lib/drive-kind';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PROYECTOS_DB = process.env.NOTION_PROYECTOS_DB_ID;
const CLIENTES_DB = process.env.NOTION_CLIENTES_DB_ID;
const NOTION_BASE = 'https://api.notion.com/v1';

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// Lee una propiedad url de Notion (puede no existir en la DB)
function readUrl(props: Record<string, Record<string, unknown>>, name: string): string | null {
  const u = props[name]?.url;
  return typeof u === 'string' && u.startsWith('http') ? u : null;
}

function readTitle(props: Record<string, Record<string, unknown>>, name: string): string {
  return (props[name]?.title as Array<{ plain_text: string }>)?.map(t => t.plain_text).join('') ?? '';
}

function readRichText(props: Record<string, Record<string, unknown>>, name: string): string {
  return (props[name]?.rich_text as Array<{ plain_text: string }>)?.map(t => t.plain_text).join('') ?? '';
}

async function findClientId(clientName: string): Promise<string | null> {
  if (!CLIENTES_DB || !clientName) return null;
  try {
    const res = await nfetch(`${NOTION_BASE}/databases/${CLIENTES_DB}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ filter: { property: 'Nombre del cliente', title: { equals: clientName } }, page_size: 1 }),
    });
    const data = await res.json();
    return data.results?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Devuelve los assets (Link Drive + Audio) guardados por módulo para un cliente+tutorial.
 * Lee las filas "por módulo" de la DB Proyectos (las que escribe el sync).
 * Respuesta: { assets: { [moduleName]: { linkDrive, audioUrl } } }
 */
export async function GET(req: NextRequest) {
  if (!NOTION_API_KEY || !PROYECTOS_DB) {
    return NextResponse.json({ error: 'Notion no configurado' }, { status: 500 });
  }

  const clientName = (req.nextUrl.searchParams.get('clientName') ?? '').trim();
  const tutorialId = req.nextUrl.searchParams.get('tutorialId');
  const tutorialLabel = tutorialId === 'tutorial_02'
    ? 'Tutorial 02 — Incendios'
    : 'Tutorial 01 — Riesgos Hoteles';

  if (!clientName) return NextResponse.json({ assets: {} });

  try {
    const clientId = await findClientId(clientName);
    const prefix = `${clientName} — `;

    const res = await nfetch(`${NOTION_BASE}/databases/${PROYECTOS_DB}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { property: 'Tutorial', select: { equals: tutorialLabel } },
        page_size: 100,
      }),
    });
    const data = await res.json();

    const assets: Record<string, {
      linkDrive: string | null;
      audioUrl: string | null;
      voiceScript: string | null;
      slotFields: Record<string, unknown> | null;
      kind?: DriveKind;
    }> = {};

    for (const page of (data.results ?? []) as Array<Record<string, unknown>>) {
      const props = page.properties as Record<string, Record<string, unknown>>;
      const title = readTitle(props, 'Nombre del proyecto');

      // Coincide por relación de Cliente O por prefijo del título "{cliente} — "
      const relationIds = ((props['Cliente']?.relation as Array<{ id: string }>) ?? []).map(r => r.id);
      const matchesRelation = clientId ? relationIds.includes(clientId) : false;
      const matchesTitle = title.startsWith(prefix);
      if (!matchesRelation && !matchesTitle) continue;

      // moduleName: 'Nombre interno' si existe, si no el sufijo del título
      let moduleName = readRichText(props, 'Nombre interno').trim();
      if (!moduleName && matchesTitle) moduleName = title.slice(prefix.length).trim();
      if (!moduleName || moduleName === 'MP4 Final') continue;

      // Link del asset: 'Link Drive' (app) o 'Carpeta de assets (Drive)' (manual)
      const linkDrive = readUrl(props, 'Link Drive') ?? readUrl(props, 'Carpeta de assets (Drive)');
      const audioUrl = readUrl(props, 'Audio (Drive URL)');

      // Contenido: puede ser JSON (nuevo formato) o texto legible (formato viejo).
      // JSON: { fields, voiceScript, causes, measures }
      // Texto: "...\nGuion voz:\n..." (legado)
      const contenido = readRichText(props, 'Contenido');
      let voiceScript: string | null = null;
      let slotFields: Record<string, unknown> | null = null;
      if (contenido) {
        try {
          const parsed = JSON.parse(contenido) as Record<string, unknown>;
          if (typeof parsed.voiceScript === 'string') voiceScript = parsed.voiceScript;
          // slot regular: guarda { fields: {...} }
          if (parsed.fields && typeof parsed.fields === 'object') {
            slotFields = parsed.fields as Record<string, unknown>;
          }
          // módulo de riesgo: guarda { causes, measures } directamente
          if (Array.isArray(parsed.causes) || Array.isArray(parsed.measures)) {
            slotFields = parsed as Record<string, unknown>;
          }
        } catch {
          // Formato viejo: extraer guion del marcador
          const MARKER = '\nGuion voz:\n';
          const idx = contenido.indexOf(MARKER);
          if (idx >= 0) voiceScript = contenido.slice(idx + MARKER.length).trim();
        }
      }

      if (!linkDrive && !audioUrl && !voiceScript && !slotFields) continue;
      assets[moduleName] = { linkDrive, audioUrl, voiceScript, slotFields };
    }

    // Detectar el tipo real (imagen/video) de cada Link Drive desde Drive, así el
    // front NO asume 'image' (era el bug: un MP4 de portada guardado en Notion se
    // restauraba como imagen al recargar y dejaba de reproducirse). En paralelo;
    // si Drive falla para alguno, ese asset queda sin kind y el store usa el default.
    await Promise.all(
      Object.values(assets).map(async (a) => {
        const id = driveFileId(a.linkDrive);
        if (!id) return;
        try {
          a.kind = await detectDriveKind(id);
        } catch {
          /* sin kind: el store conserva el type existente o usa 'image' */
        }
      })
    );

    return NextResponse.json({ assets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
