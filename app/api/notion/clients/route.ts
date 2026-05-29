import { NextResponse } from 'next/server';
import { NotionClient } from '@/lib/types';
import { nfetch } from '@/lib/notion-fetch';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const CLIENTES_DB = process.env.NOTION_CLIENTES_DB_ID;
const NOTION_BASE = 'https://api.notion.com/v1';

const headers = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

type Props = Record<string, Record<string, unknown>>;

// Lee el texto plano de una propiedad rich_text / title
function txt(props: Props, name: string): string {
  const p = props[name];
  const arr = (p?.rich_text ?? p?.title) as Array<{ plain_text?: string }> | undefined;
  return arr?.[0]?.plain_text?.trim() ?? '';
}

function url(props: Props, name: string): string | null {
  const v = (props[name]?.url as string | null) ?? null;
  return v && v.trim() ? v.trim() : null;
}

function select(props: Props, name: string): string {
  return ((props[name]?.select as { name?: string })?.name ?? '').trim();
}

// Solo incluye un color si tiene valor (evita pisar la paleta actual con vacíos)
function color(props: Props, name: string): string | undefined {
  const v = txt(props, name);
  return v || undefined;
}

export async function GET() {
  if (!NOTION_API_KEY || !CLIENTES_DB) {
    return NextResponse.json({ error: 'Notion no configurado' }, { status: 500 });
  }

  try {
    const res = await nfetch(`${NOTION_BASE}/databases/${CLIENTES_DB}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sorts: [{ property: 'Nombre del cliente', direction: 'ascending' }],
        page_size: 100,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
    }

    const clients: NotionClient[] = (data.results ?? [])
      .map((page: { id: string; properties: Props }): NotionClient => {
        const p = page.properties;
        const colors: Partial<NotionClient['colors']> = {};
        const primary = color(p, 'Color primario');
        const secondary = color(p, 'Color secundario');
        const accent = color(p, 'Color acento');
        const background = color(p, 'Color fondo');
        const text = color(p, 'Color texto');
        if (primary) colors.primary = primary;
        if (secondary) colors.secondary = secondary;
        if (accent) colors.accent = accent;
        if (background) colors.background = background;
        if (text) colors.text = text;

        return {
          pageId: page.id,
          clientName: txt(p, 'Nombre del cliente'),
          companyName: txt(p, 'Empresa / Razón social'),
          industry: select(p, 'Industria'),
          tipo: select(p, 'Tipo') || 'Cliente',
          logoUrl: url(p, 'Logo (Drive URL)'),
          assetsFolderUrl: url(p, 'Carpeta Drive (URL)'),
          fontFamily: txt(p, 'Tipografía'),
          secondaryText: txt(p, 'Texto Secundario'),
          colors,
        };
      })
      .filter((c: NotionClient) => c.clientName);

    return NextResponse.json({ clients });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
