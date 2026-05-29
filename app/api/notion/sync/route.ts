import { NextRequest, NextResponse } from 'next/server';
import { Project, RiskSubModule } from '@/lib/types';
import { nfetch } from '@/lib/notion-fetch';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const CLIENTES_DB = process.env.NOTION_CLIENTES_DB_ID;
const PROYECTOS_DB = process.env.NOTION_PROYECTOS_DB_ID;
const CLIENTES_FOLDER = process.env.GOOGLE_DRIVE_CLIENTES_FOLDER_ID;
const NOTION_BASE = 'https://api.notion.com/v1';

const h = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// ── Block helpers ─────────────────────────────────────────────────────────────

const blk = {
  h1: (t: string) => ({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: t } }] } }),
  h2: (t: string) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: t } }] } }),
  h3: (t: string) => ({ object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: t } }] } }),
  p:  (t: string) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: t || '—' } }] } }),
  bullet: (t: string) => ({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: t } }] } }),
  divider: () => ({ object: 'block', type: 'divider', divider: {} }),
  link: (label: string, url: string) => ({
    object: 'block', type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: `🔗 ${label}`, link: { url } }, annotations: { color: 'blue' as const } }] },
  }),
};

// ── Full page body builder ────────────────────────────────────────────────────

function buildPageBody(project: Project): object[] {
  const blocks: object[] = [];
  const { slots, media, voiceScript, identity, clientName, companyName, industry, projectName } = project;

  // ── CABECERA ──────────────────────────────────────────────────────────────
  blocks.push(blk.p(`💾 Guardado desde SUAMA Hub · ${new Date().toLocaleString('es-AR')}`))

  // ── IDENTIDAD VISUAL ──────────────────────────────────────────────────────
  blocks.push(blk.h1('🎨 Identidad Visual'));
  blocks.push(blk.p(`Nombre del proyecto: ${projectName || '—'}`));
  blocks.push(blk.p(`Cliente: ${clientName || '—'}`));
  blocks.push(blk.p(`Empresa: ${companyName || '—'}`));
  blocks.push(blk.p(`Industria: ${industry || '—'}`));
  blocks.push(blk.p(`Tipografía: ${identity.fontFamily || '—'}`));
  blocks.push(blk.p(`Colores: Primario ${identity.colors.primary} · Secundario ${identity.colors.secondary} · Acento ${identity.colors.accent}`));
  blocks.push(blk.p(`Fondo: ${identity.colors.background} · Texto: ${identity.colors.text}`));
  if (identity.logoUrl?.startsWith('http')) {
    blocks.push(blk.link('Logo del cliente (Drive)', identity.logoUrl));
  }
  blocks.push(blk.divider());

  // ── ESTADO DE ESCENAS ─────────────────────────────────────────────────────
  blocks.push(blk.h1('📋 Escenas del Tutorial'));
  blocks.push(blk.p('Estado de cada escena (✅ activa · ❌ desactivada):'));
  for (const slot of slots) {
    const icon = slot.active ? '✅' : '❌';
    blocks.push(blk.bullet(`${icon} ${slot.id} — ${slot.title}`));
  }
  blocks.push(blk.divider());

  // ── CONTENIDO POR MÓDULO ──────────────────────────────────────────────────
  blocks.push(blk.h1('📝 Contenido por Módulo'));

  for (const slot of slots) {
    const statusIcon = slot.active ? '✅' : '❌';
    blocks.push(blk.h2(`${statusIcon} ${slot.id} — ${slot.title}`));

    if (slot.id === 'SLOT_08' && slot.riskModules) {
      // Módulos de riesgo
      for (const rm of slot.riskModules as RiskSubModule[]) {
        const rmIcon = rm.active ? '⚠️' : '⛔';
        blocks.push(blk.h3(`${rmIcon} ${rm.name} (${rm.active ? 'activo' : 'desactivado'})`));

        if (rm.causes?.length) {
          blocks.push(blk.p('Causas:'));
          rm.causes.forEach(c => blocks.push(blk.bullet(c)));
        }
        if (rm.measures?.length) {
          blocks.push(blk.p('Medidas preventivas:'));
          rm.measures.forEach(m => blocks.push(blk.bullet(m)));
        }

        // Media
        const mediaItem = media[rm.mediaId];
        if (mediaItem?.url?.startsWith('http')) {
          blocks.push(blk.link(`Imagen/Video — ${rm.name} (${mediaItem.source === 'ai' ? 'Generada con IA' : 'Drive'})`, mediaItem.url));
          if (mediaItem.aiPrompt) {
            blocks.push(blk.p(`Prompt IA: "${mediaItem.aiPrompt}"`));
          }
        } else {
          blocks.push(blk.p('📷 Imagen/Video: pendiente'));
        }

        // Guion de voz completo
        const script = voiceScript[rm.id];
        if (script?.trim()) {
          blocks.push(blk.p('Guion de voz en off:'));
          // Partir guiones largos en bloques de 2000 chars (límite Notion)
          const chunks = script.match(/.{1,2000}/gs) ?? [];
          chunks.forEach(chunk => blocks.push(blk.p(chunk)));
        } else {
          blocks.push(blk.p('Guion: pendiente'));
        }
      }
    } else {
      // Slots regulares — campos de texto
      const fields = slot.fields as Record<string, unknown>;
      for (const [key, val] of Object.entries(fields)) {
        if (Array.isArray(val) && val.length > 0) {
          blocks.push(blk.p(`${key}:`));
          val.forEach(item => {
            if (typeof item === 'string') blocks.push(blk.bullet(item));
            else if (item && typeof item === 'object' && 'term' in item) {
              const def = item as { term: string; definition: string };
              blocks.push(blk.bullet(`${def.term}: ${def.definition}`));
            }
          });
        } else if (typeof val === 'string' && val.trim()) {
          blocks.push(blk.p(`${key}: ${val}`));
        }
      }

      // Media del slot
      const slotMediaKeys = Object.keys(media).filter(k =>
        k.startsWith(slot.id.toLowerCase()) || k === 'portada_img' && slot.id === 'SLOT_01' || k === 'objetivos_img' && slot.id === 'SLOT_02'
      );
      for (const key of slotMediaKeys) {
        const item = media[key];
        if (item?.url?.startsWith('http')) {
          blocks.push(blk.link(`Imagen — ${key} (${item.source === 'ai' ? 'Generada con IA' : 'Drive'})`, item.url));
          if (item.aiPrompt) blocks.push(blk.p(`Prompt IA: "${item.aiPrompt}"`));
        }
      }

      // Guion de voz completo
      const script = voiceScript[slot.id];
      if (script?.trim()) {
        blocks.push(blk.p('Guion de voz en off:'));
        const chunks = script.match(/.{1,2000}/gs) ?? [];
        chunks.forEach(chunk => blocks.push(blk.p(chunk)));
      }
    }
    blocks.push(blk.divider());
  }

  // ── TODOS LOS MEDIOS (resumen completo) ───────────────────────────────────
  const allMediaWithUrl = Object.entries(media).filter(([, v]) => v?.url?.startsWith('http'));
  if (allMediaWithUrl.length > 0) {
    blocks.push(blk.h1('🖼 Todos los Assets (Drive)'));
    for (const [key, item] of allMediaWithUrl) {
      blocks.push(blk.link(
        `${key} · ${item.type} · ${item.source === 'ai' ? 'IA' : 'Drive'}${item.fileName ? ` · ${item.fileName}` : ''}`,
        item.url!,
      ));
      if (item.aiPrompt) blocks.push(blk.p(`Prompt: "${item.aiPrompt}"`));
    }
    blocks.push(blk.divider());
  }

  // ── AUDIO ─────────────────────────────────────────────────────────────────
  blocks.push(blk.h1('🎙 Audio'));
  const audioEntries = Object.entries(project.voiceAudioUrls ?? {}).filter(([, u]) => u?.startsWith('http'));
  if (audioEntries.length > 0) {
    for (const [slotId, url] of audioEntries) {
      blocks.push(blk.link(`Audio ${slotId} (Drive)`, url));
    }
  } else {
    blocks.push(blk.p('Audio: pendiente'));
  }

  return blocks;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function findClientByName(name: string): Promise<string | null> {
  const res = await nfetch(`${NOTION_BASE}/databases/${CLIENTES_DB}/query`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ filter: { property: 'Nombre del cliente', title: { equals: name } } }),
  });
  return (await res.json()).results?.[0]?.id ?? null;
}

async function upsertCliente(project: Project): Promise<string> {
  const nombre = project.clientName || 'Cliente sin nombre';
  const properties: Record<string, unknown> = {
    'Nombre del cliente': { title: [{ text: { content: nombre } }] },
    'Empresa / Razón social': { rich_text: [{ text: { content: project.companyName || '' } }] },
    'Color primario':   { rich_text: [{ text: { content: project.identity.colors.primary } }] },
    'Color secundario': { rich_text: [{ text: { content: project.identity.colors.secondary } }] },
    'Color acento':     { rich_text: [{ text: { content: project.identity.colors.accent } }] },
    'Color fondo':      { rich_text: [{ text: { content: project.identity.colors.background } }] },
    'Color texto':      { rich_text: [{ text: { content: project.identity.colors.text } }] },
    'Tipografía':       { rich_text: [{ text: { content: project.identity.fontFamily || '' } }] },
    'Estado':           { select: { name: 'Activo' } },
    'Fecha de alta':    { date: { start: new Date().toISOString().split('T')[0] } },
  };
  // Solo escribir si hay valor, para no pisar un texto cargado manualmente en Notion.
  if (project.identity.secondaryText?.trim()) {
    properties['Texto Secundario'] = { rich_text: [{ text: { content: project.identity.secondaryText } }] };
  }
  if (project.identity.logoUrl?.startsWith('http')) {
    properties['Logo (Drive URL)'] = { url: project.identity.logoUrl };
  }
  if (project.industry) {
    properties['Industria'] = { select: { name: project.industry } };
  }
  // Si el operador ya cargó un link de Assets para el cliente, lo respetamos.
  if (project.identity.assetsFolderUrl?.startsWith('http')) {
    properties['Carpeta Drive (URL)'] = { url: project.identity.assetsFolderUrl };
  }

  const existingId = await findClientByName(nombre);
  // Solo al CREAR un cliente nuevo seteamos valores por defecto (no pisar ajustes manuales en updates).
  if (!existingId) {
    properties['Tipo'] = { select: { name: 'Cliente' } };
    if (!properties['Carpeta Drive (URL)'] && CLIENTES_FOLDER) {
      properties['Carpeta Drive (URL)'] = { url: `https://drive.google.com/drive/folders/${CLIENTES_FOLDER}` };
    }
  }
  if (existingId) {
    const r = await nfetch(`${NOTION_BASE}/pages/${existingId}`, {
      method: 'PATCH', headers: h, body: JSON.stringify({ properties }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(`Cliente PATCH: ${JSON.stringify(e)}`); }
    return existingId;
  }
  const res = await nfetch(`${NOTION_BASE}/pages`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ parent: { database_id: CLIENTES_DB }, properties }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Cliente POST: ${JSON.stringify(data)}`);
  return data.id;
}

// Mapa de mediaId → nombre de módulo para las etiquetas
const MEDIA_MODULE_NAMES: Record<string, string> = {
  portada_img:    'Portada',
  objetivos_img:  'Objetivos',
  media_08a:      'Resbalones y Caídas',
  media_08b:      'Cortes y Atrapamientos',
  media_08c:      'Quemaduras',
  media_08d:      'Riesgo Eléctrico',
  media_08e:      'Incendio',
  media_08f:      'Productos Químicos',
  media_08g:      'Sobreesfuerzos',
  media_t2_08a:   'Clases de Fuego',
  media_t2_08b:   'Tipos de Extintores',
  media_t2_08c:   'Uso del Extintor',
};

async function findAssetRow(clientId: string, tutorialLabel: string, moduleName: string): Promise<string | null> {
  const res = await nfetch(`${NOTION_BASE}/databases/${PROYECTOS_DB}/query`, {
    method: 'POST', headers: h,
    body: JSON.stringify({
      filter: { and: [
        { property: 'Cliente', relation: { contains: clientId } },
        { property: 'Tutorial', select: { equals: tutorialLabel } },
        { property: 'Nombre interno', rich_text: { equals: moduleName } },
      ]},
    }),
  });
  return (await res.json()).results?.[0]?.id ?? null;
}

async function upsertAssetRow(
  clientId: string,
  clientName: string,
  projectName: string,
  tutorialLabel: string,
  moduleName: string,
  driveUrl: string,
  estado: string,
  tipo: string,
  contenido: string = '',
  audioUrl: string = '',
): Promise<void> {
  const properties: Record<string, unknown> = {
    'Nombre del proyecto': { title: [{ text: { content: `${clientName} — ${moduleName}` } }] },
    'Nombre interno':      { rich_text: [{ text: { content: moduleName } }] },
    'Cliente':             { relation: [{ id: clientId }] },
    'Tutorial':            { select: { name: tutorialLabel } },
    'Tipo':                { select: { name: tipo } },
    'Estado':              { select: { name: estado } },
    'Módulo':              { multi_select: [{ name: moduleName.replace(/,/g, ' ·') }] },
    'Fecha de generación': { date: { start: new Date().toISOString().split('T')[0] } },
  };
  if (driveUrl) properties['Link Drive'] = { url: driveUrl };
  if (audioUrl) properties['Audio (Drive URL)'] = { url: audioUrl };
  if (contenido) properties['Contenido'] = { rich_text: [{ text: { content: contenido } }] };

  const existingId = await findAssetRow(clientId, tutorialLabel, moduleName);
  if (existingId) {
    const pr = await nfetch(`${NOTION_BASE}/pages/${existingId}`, {
      method: 'PATCH', headers: h, body: JSON.stringify({ properties }),
    });
    if (!pr.ok) { const e = await pr.json(); throw new Error(`Asset PATCH ${moduleName}: ${JSON.stringify(e)}`); }
    return;
  }
  const res = await nfetch(`${NOTION_BASE}/pages`, {
    method: 'POST', headers: h,
    body: JSON.stringify({ parent: { database_id: PROYECTOS_DB }, properties }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Asset POST ${moduleName}: ${JSON.stringify(data)}`);
}

// Extrae el texto de un slot/módulo como string legible
function extractSlotText(project: Project, slotId: string): string {
  const parts: string[] = [];

  if (slotId === 'SLOT_08') return ''; // los risk modules se manejan individualmente

  const slot = project.slots.find(s => s.id === slotId);
  if (slot?.fields) {
    for (const [key, val] of Object.entries(slot.fields)) {
      if (Array.isArray(val) && val.length > 0) {
        const items = val.map((v: unknown) => {
          if (typeof v === 'string') return `• ${v}`;
          if (v && typeof v === 'object' && 'term' in v) {
            const d = v as { term: string; definition: string };
            return `• ${d.term}: ${d.definition}`;
          }
          return '';
        }).filter(Boolean);
        if (items.length) parts.push(`${key}:\n${items.join('\n')}`);
      } else if (typeof val === 'string' && val.trim()) {
        parts.push(`${key}: ${val}`);
      }
    }
  }

  const script = project.voiceScript?.[slotId];
  if (script?.trim()) parts.push(`\nGuion voz:\n${script}`);

  return parts.join('\n').slice(0, 1990);
}

function extractRiskText(rm: RiskSubModule, voiceScript: Record<string, string>): string {
  const parts: string[] = [];
  if (rm.causes?.length) parts.push(`Causas:\n${rm.causes.map(c => `• ${c}`).join('\n')}`);
  if (rm.measures?.length) parts.push(`Medidas:\n${rm.measures.map(m => `• ${m}`).join('\n')}`);
  const script = voiceScript?.[rm.id];
  if (script?.trim()) parts.push(`\nGuion voz:\n${script}`);
  return parts.join('\n').slice(0, 1990);
}

async function upsertProyectos(
  project: Project,
  clientId: string,
  tutorialLabel: string,
  mp4Url: string | null,
  estado: string,
): Promise<void> {
  const tipo = project.clientName && project.clientName !== 'SUAMA Demo Client'
    ? 'Personalizado Cliente' : 'SUAMA Template';
  const clientName = project.clientName || 'Cliente';

  // ── Slots regulares (no SLOT_08) con media o texto ──
  const slot08 = project.slots.find(s => s.id === 'SLOT_08');

  for (const slot of project.slots.filter(s => s.active && s.id !== 'SLOT_08')) {
    const moduleName = slot.title;
    const mediaId = slot.id === 'SLOT_01' ? 'portada_img'
                  : slot.id === 'SLOT_02' ? 'objetivos_img'
                  : null;
    const mediaItem = mediaId ? project.media[mediaId] : null;
    const driveUrl = mediaItem?.url?.startsWith('http') ? mediaItem.url : null;
    const contenido = extractSlotText(project, slot.id);
    const audioUrl = project.voiceAudioUrls?.[slot.id] ?? '';

    if (!driveUrl && !contenido && !audioUrl) continue; // nada que guardar

    await upsertAssetRow(
      clientId, clientName, project.projectName, tutorialLabel,
      moduleName, driveUrl ?? '', estado, tipo, contenido, audioUrl,
    );
  }

  // ── Módulos de riesgo (SLOT_08) ──
  if (slot08?.active) {
    for (const rm of (slot08.riskModules ?? []).filter(r => r.active)) {
      const mediaItem = project.media[rm.mediaId];
      const driveUrl = mediaItem?.url?.startsWith('http') ? mediaItem.url : null;
      const contenido = extractRiskText(rm, project.voiceScript);
      const audioUrl = project.voiceAudioUrls?.[rm.id] ?? '';
      if (!driveUrl && !contenido && !audioUrl) continue;
      await upsertAssetRow(
        clientId, clientName, project.projectName, tutorialLabel,
        rm.name, driveUrl ?? '', estado, tipo, contenido, audioUrl,
      );
    }
  }

  // ── MP4 final ──
  if (mp4Url) {
    const properties: Record<string, unknown> = {
      'Nombre del proyecto': { title: [{ text: { content: `${clientName} — MP4 Final` } }] },
      'Nombre interno':      { rich_text: [{ text: { content: 'MP4 Final' } }] },
      'Cliente':             { relation: [{ id: clientId }] },
      'Tutorial':            { select: { name: tutorialLabel } },
      'Tipo':                { select: { name: tipo } },
      'Estado':              { select: { name: 'Generado' } },
      'Link MP4 (Drive)':    { url: mp4Url },
      'Fecha de generación': { date: { start: new Date().toISOString().split('T')[0] } },
    };
    const existingId = await findAssetRow(clientId, tutorialLabel, 'MP4 Final');
    if (existingId) {
      await nfetch(`${NOTION_BASE}/pages/${existingId}`, { method: 'PATCH', headers: h, body: JSON.stringify({ properties }) });
    } else {
      await nfetch(`${NOTION_BASE}/pages`, { method: 'POST', headers: h, body: JSON.stringify({ parent: { database_id: PROYECTOS_DB }, properties }) });
    }
  }
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY || !CLIENTES_DB || !PROYECTOS_DB) {
    return NextResponse.json({ error: 'Notion no configurado' }, { status: 500 });
  }

  let project: Project, mp4Url: string | null = null, tutorialName: string, estado = 'Borrador';
  try {
    const body = await req.json();
    project = body.project as Project;
    mp4Url = body.mp4Url ?? null;
    tutorialName = body.tutorialName
      ?? (project.tutorialId === 'tutorial_01' ? 'Tutorial 01 — Riesgos Hoteles' : 'Tutorial 02 — Incendios');
    if (mp4Url) estado = 'Generado';
    else if (body.estado) estado = body.estado;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  try {
    const clientPageId = await upsertCliente(project);
    await upsertProyectos(project, clientPageId, tutorialName, mp4Url, estado);
    return NextResponse.json({ ok: true, clientPageId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Notion Sync Error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
