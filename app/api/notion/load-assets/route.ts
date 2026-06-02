import { NextRequest, NextResponse } from 'next/server';
import { nfetch } from '@/lib/notion-fetch';

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

    const assets: Record<string, { linkDrive: string | null; audioUrl: string | null }> = {};

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

      if (!linkDrive && !audioUrl) continue;
      assets[moduleName] = { linkDrive, audioUrl };
    }

    return NextResponse.json({ assets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
