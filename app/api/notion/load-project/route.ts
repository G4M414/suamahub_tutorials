import { NextRequest, NextResponse } from 'next/server';
import { nfetch } from '@/lib/notion-fetch';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PROYECTOS_DB = process.env.NOTION_PROYECTOS_DB_ID;
const NOTION_BASE = 'https://api.notion.com/v1';

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export async function GET(req: NextRequest) {
  if (!NOTION_API_KEY || !PROYECTOS_DB) {
    return NextResponse.json({ error: 'Notion no configurado' }, { status: 500 });
  }

  const clientName = req.nextUrl.searchParams.get('clientName');
  const tutorialId = req.nextUrl.searchParams.get('tutorialId');

  const tutorialLabel = tutorialId === 'tutorial_01'
    ? 'Tutorial 01 — Riesgos Hoteles'
    : 'Tutorial 02 — Incendios';

  try {
    const filter: Record<string, unknown> = tutorialId
      ? { property: 'Tutorial', select: { equals: tutorialLabel } }
      : {};

    const res = await nfetch(`${NOTION_BASE}/databases/${PROYECTOS_DB}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: Object.keys(filter).length ? filter : undefined,
        sorts: [{ property: 'Fecha de generación', direction: 'descending' }],
        page_size: 10,
      }),
    });

    const data = await res.json();

    const projects = (data.results ?? []).map((page: Record<string, unknown>) => {
      const props = page.properties as Record<string, Record<string, unknown>>;
      // El estado se guarda partido en varios bloques rich_text (límite de 2000
      // chars c/u). Concatenamos TODOS en orden antes de parsear.
      const jsonText = (props['Estado del Proyecto (JSON)']?.rich_text as Array<{plain_text: string}>)
        ?.map(t => t.plain_text).join('') || null;
      let projectState = null;
      if (jsonText) {
        try { projectState = JSON.parse(jsonText); } catch { /* invalid json */ }
      }
      return {
        pageId: page.id,
        name: (props['Nombre del proyecto']?.title as Array<{plain_text: string}>)?.[0]?.plain_text ?? '',
        tutorial: (props['Tutorial']?.select as {name: string})?.name ?? '',
        estado: (props['Estado']?.select as {name: string})?.name ?? '',
        fecha: (props['Fecha de generación']?.date as {start: string})?.start ?? '',
        projectState,
      };
    });

    return NextResponse.json({ projects });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
