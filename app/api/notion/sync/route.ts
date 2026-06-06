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

// Junta las URLs http de los visuales de un módulo (base, _2, _3), en orden, hasta 3.
// Misma convención que el timeline (slotBaseMediaKey + visualKeys).
function collectVisualUrls(media: Record<string, { url?: string | null }>, baseKey: string): string[] {
  const urls: string[] = [];
  for (const k of [baseKey, `${baseKey}_2`, `${baseKey}_3`]) {
    const u = media[k]?.url;
    if (typeof u === 'string' && u.startsWith('http')) urls.push(u);
  }
  return urls;
}

// Normaliza el nombre de módulo para emparejar filas de forma robusta,
// insensible a mayúsculas/espacios. Evita los duplicados por "drift" de casing
// (p. ej. "Productos químicos" vs "Productos Químicos").
const normKey = (s: string) => s.trim().toLowerCase();

// Lee el "Nombre interno" de una fila; si falta, usa el sufijo del título "{cliente} — {módulo}".
function rowModuleName(props: Record<string, any>): string {
  const interno = (props['Nombre interno']?.rich_text ?? []).map((t: any) => t.plain_text).join('').trim();
  if (interno) return interno;
  const title = (props['Nombre del proyecto']?.title ?? []).map((t: any) => t.plain_text).join('');
  const idx = title.indexOf(' — ');
  return idx >= 0 ? title.slice(idx + 3).trim() : title.trim();
}

async function archivePage(pageId: string): Promise<void> {
  await nfetch(`${NOTION_BASE}/pages/${pageId}`, {
    method: 'PATCH', headers: h, body: JSON.stringify({ archived: true }),
  });
}

// Puntaje de completitud de una fila: para elegir qué copia conservar si hay duplicados.
function rowScore(props: Record<string, any>): number {
  let s = 0;
  if (props['Link Drive - @img #1']?.url) s += 4;
  if (props['Link Drive - @img #2']?.url) s += 1;
  if (props['Link Drive - @img #3']?.url) s += 1;
  if (props['Audio (Drive URL)']?.url) s += 2;
  if (props['Link MP4 (Drive)']?.url) s += 4;
  if ((props['Contenido']?.rich_text ?? []).length) s += 1;
  return s;
}

// Trae TODAS las filas existentes de este cliente+tutorial en UNA query paginada
// y devuelve un índice normKey(Nombre interno) → pageId.
//
// AUTO-SANACIÓN: si encuentra dos (o más) filas vivas para el mismo módulo
// (duplicados generados por carreras o por lag de consistencia de la query de
// Notion), conserva la más completa y ARCHIVA las sobrantes en el acto. Así cada
// guardado converge la DB a exactamente 1 fila por módulo, sin importar cómo
// hayan aparecido los duplicados.
//
// Reemplaza la búsqueda por-módulo anterior, que filtraba por `Módulo`
// (multi_select) y, ante un casing distinto, devolvía TODAS las filas del cliente
// → se pisaba/duplicaba.
async function indexExistingRows(clientId: string, tutorialLabel: string): Promise<Map<string, string>> {
  const best = new Map<string, { id: string; score: number }>();
  const dupsToArchive: string[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await nfetch(`${NOTION_BASE}/databases/${PROYECTOS_DB}/query`, {
      method: 'POST', headers: h,
      body: JSON.stringify({
        filter: { and: [
          { property: 'Cliente', relation: { contains: clientId } },
          { property: 'Tutorial', select: { equals: tutorialLabel } },
        ]},
        page_size: 100,
        start_cursor: cursor,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Query Proyectos: ${JSON.stringify(data)}`);
    for (const page of (data.results ?? []) as Array<Record<string, any>>) {
      const key = normKey(rowModuleName(page.properties));
      if (!key) continue;
      const score = rowScore(page.properties);
      const cur = best.get(key);
      if (!cur) {
        best.set(key, { id: page.id, score });
      } else if (score > cur.score) {
        dupsToArchive.push(cur.id);            // la previa era peor → archivar
        best.set(key, { id: page.id, score });
      } else {
        dupsToArchive.push(page.id);           // esta es duplicado peor → archivar
      }
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  // Archivar los duplicados detectados (a la papelera de Notion, recuperables).
  for (const id of dupsToArchive) await archivePage(id);

  const map = new Map<string, string>();
  for (const [k, v] of best) map.set(k, v.id);
  return map;
}

async function upsertAssetRow(
  existing: Map<string, string>,
  clientId: string,
  clientName: string,
  tutorialLabel: string,
  moduleName: string,
  driveUrls: string[],
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
  // Hasta 3 visuales del carrusel → columnas Notion reales del cliente.
  // Las que no tienen valor se setean a null para limpiar links viejos al reemplazar.
  const COLS = ['Link Drive - @img #1', 'Link Drive - @img #2', 'Link Drive - @img #3'];
  COLS.forEach((col, k) => {
    properties[col] = driveUrls[k] ? { url: driveUrls[k] } : { url: null };
  });
  if (audioUrl) properties['Audio (Drive URL)'] = { url: audioUrl };
  // Usar chunkRichText para no truncar: guarda TODO el JSON sin límite de 2000 chars
  if (contenido) properties['Contenido'] = { rich_text: chunkRichText(contenido) };

  const key = normKey(moduleName);
  const existingId = existing.get(key);
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
  // Registrar la fila recién creada para no duplicarla dentro de la misma corrida.
  existing.set(key, data.id);
}

// Divide un string en bloques de 2000 chars (límite de Notion por bloque rich_text).
// Soporta hasta 100 bloques → ~200.000 chars. Suficiente para cualquier módulo.
function chunkRichText(s: string): Array<{ text: { content: string } }> {
  const chunks: Array<{ text: { content: string } }> = [];
  for (let i = 0; i < s.length && chunks.length < 100; i += 2000) {
    chunks.push({ text: { content: s.slice(i, i + 2000) } });
  }
  return chunks;
}

// Serializa el contenido de un slot como JSON estructurado, sin truncar.
// Al cargar desde Notion se puede restaurar campo por campo en el store.
function extractSlotContent(project: Project, slotId: string): string {
  if (slotId === 'SLOT_08') return '';
  const slot = project.slots.find(s => s.id === slotId);
  const payload: Record<string, unknown> = {};
  if (slot?.fields && Object.keys(slot.fields).length > 0) {
    payload.fields = slot.fields;
  }
  const script = project.voiceScript?.[slotId];
  if (script?.trim()) payload.voiceScript = script;
  return Object.keys(payload).length > 0 ? JSON.stringify(payload) : '';
}

function extractRiskContent(rm: RiskSubModule, voiceScript: Record<string, string>): string {
  const payload: Record<string, unknown> = {};
  if (rm.causes?.length) payload.causes = rm.causes;
  if (rm.measures?.length) payload.measures = rm.measures;
  const script = voiceScript?.[rm.id];
  if (script?.trim()) payload.voiceScript = script;
  return Object.keys(payload).length > 0 ? JSON.stringify(payload) : '';
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

  // Índice de filas existentes (UNA query) → upsert por Nombre interno sin
  // duplicar ni pisar otros módulos.
  const existing = await indexExistingRows(clientId, tutorialLabel);

  // ── Slots regulares (no SLOT_08) con media o texto ──
  const slot08 = project.slots.find(s => s.id === 'SLOT_08');

  for (const slot of project.slots.filter(s => s.active && s.id !== 'SLOT_08')) {
    const moduleName = slot.title;
    const baseKey = slot.id === 'SLOT_01' ? 'portada_img'
                  : slot.id === 'SLOT_02' ? 'objetivos_img'
                  : `${slot.id.toLowerCase()}_img`;
    const driveUrls = collectVisualUrls(project.media, baseKey);
    const contenido = extractSlotContent(project, slot.id);
    const audioUrl = project.voiceAudioUrls?.[slot.id] ?? '';

    if (driveUrls.length === 0 && !contenido && !audioUrl) continue; // nada que guardar

    await upsertAssetRow(
      existing, clientId, clientName, tutorialLabel,
      moduleName, driveUrls, estado, tipo, contenido, audioUrl,
    );
  }

  // ── Módulos de riesgo (SLOT_08) ──
  if (slot08?.active) {
    for (const rm of (slot08.riskModules ?? []).filter(r => r.active)) {
      const driveUrls = collectVisualUrls(project.media, rm.mediaId);
      const contenido = extractRiskContent(rm, project.voiceScript);
      const audioUrl = project.voiceAudioUrls?.[rm.id] ?? '';
      if (driveUrls.length === 0 && !contenido && !audioUrl) continue;
      await upsertAssetRow(
        existing, clientId, clientName, tutorialLabel,
        rm.name, driveUrls, estado, tipo, contenido, audioUrl,
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
    const existingId = existing.get(normKey('MP4 Final'));
    if (existingId) {
      await nfetch(`${NOTION_BASE}/pages/${existingId}`, { method: 'PATCH', headers: h, body: JSON.stringify({ properties }) });
    } else {
      const r = await nfetch(`${NOTION_BASE}/pages`, { method: 'POST', headers: h, body: JSON.stringify({ parent: { database_id: PROYECTOS_DB }, properties }) });
      const d = await r.json();
      if (r.ok && d.id) existing.set(normKey('MP4 Final'), d.id);
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
