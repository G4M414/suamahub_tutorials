import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';
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

async function findOrCreateClient(project: Project): Promise<string> {
  const nombre = project.clientName || 'Sin nombre';

  const search = await nfetch(`${NOTION_BASE}/databases/${CLIENTES_DB}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ filter: { property: 'Nombre del cliente', title: { equals: nombre } } }),
  });
  const found = await search.json();
  if (found.results?.[0]?.id) return found.results[0].id;

  const created = await nfetch(`${NOTION_BASE}/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { database_id: CLIENTES_DB },
      properties: {
        'Nombre del cliente': { title: [{ text: { content: nombre } }] },
        'Estado': { select: { name: 'Activo' } },
      },
    }),
  });
  const data = await created.json();
  return data.id;
}

async function findExistingProject(clientId: string, tutorialId: string): Promise<string | null> {
  const res = await nfetch(`${NOTION_BASE}/databases/${PROYECTOS_DB}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Cliente', relation: { contains: clientId } },
          { property: 'Tutorial', select: { equals: tutorialId } },
        ],
      },
    }),
  });
  const data = await res.json();
  return data.results?.[0]?.id ?? null;
}

export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !PROYECTOS_DB || !CLIENTES_DB) {
    return NextResponse.json({ error: 'Notion no configurado' }, { status: 500 });
  }

  const { project }: { project: Project } = await req.json();
  const tutorialLabel = project.tutorialId === 'tutorial_01' ? 'Tutorial 01 — Riesgos Hoteles' : 'Tutorial 02 — Incendios';

  try {
    const clientId = await findOrCreateClient(project);
    const existingId = await findExistingProject(clientId, tutorialLabel);

    // Serialize full project state (media URLs, voice scripts, etc.)
    const projectJson = JSON.stringify({
      media: project.media,
      voiceScript: project.voiceScript,
      voiceAudioUrl: project.voiceAudioUrl,
      identity: project.identity,
      slots: project.slots,
      clientName: project.clientName,
      companyName: project.companyName,
      industry: project.industry,
      projectName: project.projectName,
    });

    const properties: Record<string, unknown> = {
      'Nombre del proyecto': { title: [{ text: { content: `${project.clientName || 'Cliente'} — ${tutorialLabel}` } }] },
      'Cliente': { relation: [{ id: clientId }] },
      'Tutorial': { select: { name: tutorialLabel } },
      'Estado': { select: { name: 'Borrador' } },
      'Fecha de generación': { date: { start: new Date().toISOString().split('T')[0] } },
      'Estado del Proyecto (JSON)': { rich_text: [{ text: { content: projectJson.slice(0, 2000) } }] },
    };

    if (existingId) {
      await nfetch(`${NOTION_BASE}/pages/${existingId}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ properties }),
      });
      return NextResponse.json({ ok: true, pageId: existingId, action: 'updated' });
    } else {
      const res = await nfetch(`${NOTION_BASE}/pages`, {
        method: 'POST', headers,
        body: JSON.stringify({ parent: { database_id: PROYECTOS_DB }, properties }),
      });
      const data = await res.json();
      return NextResponse.json({ ok: true, pageId: data.id, action: 'created' });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
