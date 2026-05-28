import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const CLIENTES_DB = process.env.NOTION_CLIENTES_DB_ID;
const PROYECTOS_DB = process.env.NOTION_PROYECTOS_DB_ID;
const NOTION_BASE = 'https://api.notion.com/v1';

const notionHeaders = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function findClientByName(name: string): Promise<string | null> {
  const res = await fetch(`${NOTION_BASE}/databases/${CLIENTES_DB}/query`, {
    method: 'POST',
    headers: notionHeaders,
    body: JSON.stringify({
      filter: {
        property: 'Nombre del cliente',
        title: { equals: name },
      },
    }),
  });
  const data = await res.json();
  return data.results?.[0]?.id ?? null;
}

async function upsertCliente(project: Project): Promise<string> {
  const { identity, clientName, companyName, industry } = project;
  const nombre = clientName || 'Cliente sin nombre';

  const properties: Record<string, unknown> = {
    'Nombre del cliente': { title: [{ text: { content: nombre } }] },
    'Empresa / Razón social': { rich_text: [{ text: { content: companyName || '' } }] },
    'Color primario': { rich_text: [{ text: { content: identity.colors.primary } }] },
    'Color secundario': { rich_text: [{ text: { content: identity.colors.secondary } }] },
    'Color acento': { rich_text: [{ text: { content: identity.colors.accent } }] },
    'Tipografía': { rich_text: [{ text: { content: identity.fontFamily || '' } }] },
    'Estado': { select: { name: 'Activo' } },
    'Fecha de alta': { date: { start: new Date().toISOString().split('T')[0] } },
  };

  if (identity.logoUrl) {
    properties['Logo (Drive URL)'] = { url: identity.logoUrl };
  }
  if (industry) {
    properties['Industria'] = { select: { name: industry } };
  }

  const existingId = await findClientByName(nombre);

  if (existingId) {
    // Actualizar cliente existente
    await fetch(`${NOTION_BASE}/pages/${existingId}`, {
      method: 'PATCH',
      headers: notionHeaders,
      body: JSON.stringify({ properties }),
    });
    return existingId;
  } else {
    // Crear cliente nuevo
    const res = await fetch(`${NOTION_BASE}/pages`, {
      method: 'POST',
      headers: notionHeaders,
      body: JSON.stringify({
        parent: { database_id: CLIENTES_DB },
        properties,
      }),
    });
    const data = await res.json();
    return data.id;
  }
}

async function createProyecto(
  project: Project,
  clientPageId: string,
  mp4Url: string,
  tutorialName: string,
): Promise<string> {
  const nombre = `${project.clientName || 'Cliente'} — ${tutorialName}`;

  const res = await fetch(`${NOTION_BASE}/pages`, {
    method: 'POST',
    headers: notionHeaders,
    body: JSON.stringify({
      parent: { database_id: PROYECTOS_DB },
      properties: {
        'Nombre del proyecto': { title: [{ text: { content: nombre } }] },
        'Cliente': { relation: [{ id: clientPageId }] },
        'Tutorial': { select: { name: tutorialName } },
        'Estado': { select: { name: 'Generado' } },
        'Fecha de generación': { date: { start: new Date().toISOString().split('T')[0] } },
        'Link MP4 (Drive)': { url: mp4Url || null },
      },
    }),
  });
  const data = await res.json();
  return data.id;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !CLIENTES_DB || !PROYECTOS_DB) {
    return NextResponse.json(
      { error: 'Variables de entorno de Notion no configuradas' },
      { status: 500 }
    );
  }

  let project: Project;
  let mp4Url: string;
  let tutorialName: string;

  try {
    const body = await req.json();
    project = body.project as Project;
    mp4Url = body.mp4Url as string;
    tutorialName = body.tutorialName as string ?? 'Tutorial';
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  try {
    const clientPageId = await upsertCliente(project);
    const proyectoPageId = await createProyecto(project, clientPageId, mp4Url, tutorialName);

    return NextResponse.json({
      ok: true,
      clientPageId,
      proyectoPageId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Error Notion: ${msg}` }, { status: 500 });
  }
}
