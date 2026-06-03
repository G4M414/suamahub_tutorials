import { Project, RiskSubModule, ColorPalette, DefinitionItem } from '@/lib/types';

// Etiquetas legibles para las keys técnicas de los campos de cada slot (mismas
// que muestra la pantalla de Contenido). Las vacías se renderizan sin label.
const FIELD_LABELS: Record<string, string> = {
  objectivesText: '',
  description: '',
  laws: 'Leyes / Decretos aplicables',
  definitions: '',
  moral: 'Moral / Ética',
  legal: 'Legal',
  economic: 'Económica',
  competitive: 'Competitiva / Reputación',
  principles: 'Principios de seguridad',
  trabajadoresDuties: 'Trabajadores',
  empleadoresDuties: 'Empleadores',
  managementDescription: 'Gestión de la prevención',
  dangerAnalysis: 'Análisis de peligros',
  hierarchyOfControls: 'Jerarquía de controles',
  responsibilities: 'Responsabilidades',
  tips: 'Recomendaciones',
  closingMessage: '',
  web: 'Web',
  brandText: '',
};

// Construcción del timeline de Shotstack a partir de un Project.
// El layout de cada slide se define UNA sola vez (las funciones *Inner) y se usa
// tanto en el render real (clips html → Shotstack) como en la vista previa del
// navegador (HTML de cuadro completo). Así el preview es fiel al MP4 final.

const D = 8; // duración default de un slide (s) cuando no hay voz en off

/** Shotstack solo acepta URLs http/https absolutas. Filtra rutas relativas, blob:, data:, etc. */
export function isValidAssetUrl(url: string | null | undefined): url is string {
  return !!url && (url.startsWith('http://') || url.startsWith('https://'));
}

/**
 * Convierte cualquier URL de Google Drive (/file/d/ID/view, /d/ID, open?id=ID)
 * al formato de descarga directa uc?id=ID, único que Shotstack puede consumir
 * como asset. Las URLs que no son de Drive (Unsplash, etc.) o ya están en
 * formato uc?id= se devuelven sin cambios.
 */
export function normalizeDriveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.includes('drive.google.com')) return url;
  const m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ?? url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/uc?id=${m[1]}` : url;
}

// ElevenLabs genera MP3 a 128 kbps CBR (formato default mp3_44100_128).
// A bitrate constante, la duración se deriva del tamaño: segundos = bytes·8 / bitrate.
const MP3_BITRATE = 128000;

/**
 * Mide la duración (en segundos) de un audio MP3 descargándolo y dividiendo por
 * el bitrate. Devuelve null si la URL no sirve o falla la descarga (el caller usa
 * la duración default del slide en ese caso, así el render nunca se rompe por esto).
 */
async function audioDurationSec(url: string | null): Promise<number | null> {
  if (!isValidAssetUrl(url)) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = (await res.arrayBuffer()).byteLength;
    if (!bytes) return null;
    return (bytes * 8) / MP3_BITRATE;
  } catch {
    return null;
  }
}

// ── Layout de texto (fuente única, usada por render y preview) ───────────────────
// Cada slide pinta su texto en una columna anclada a la izquierda (left:96px).
// Con imagen a la derecha la columna es angosta; sin imagen ocupa casi todo.

function portadaInner(title: string, subtitle: string, colors: ColorPalette): string {
  return (
    `<div style="position:absolute;left:0;top:0;width:980px;height:1080px;background:rgba(0,0,0,0.6)"></div>` +
    `<div style="position:absolute;left:96px;top:360px;width:790px">` +
      `<div style="width:180px;height:8px;background:${colors.primary};margin-bottom:30px"></div>` +
      `<div style="font-size:60px;font-weight:900;color:${colors.primary};line-height:1.12">${title}</div>` +
      (subtitle ? `<div style="font-size:30px;color:#ffffff;opacity:0.88;line-height:1.4;margin-top:24px">${subtitle}</div>` : '') +
    `</div>`
  );
}

function riskInner(rm: RiskSubModule, colors: ColorPalette, hasImg: boolean): string {
  const colW = hasImg ? 790 : 1720;
  const label = (t: string) =>
    `<div style="font-size:18px;font-weight:700;color:${colors.secondary};text-transform:uppercase;letter-spacing:2px;margin-top:26px">${t}</div>`;
  const ul = (items: string[]) =>
    `<ul style="font-size:24px;color:${colors.text};margin:8px 0 0;padding-left:26px;line-height:1.4">${items.map(i => `<li style="margin-bottom:7px">${i}</li>`).join('')}</ul>`;
  return (
    `<div style="position:absolute;left:96px;top:210px;width:${colW}px">` +
      `<div style="width:120px;height:8px;background:${colors.primary};margin-bottom:22px"></div>` +
      `<div style="font-size:46px;font-weight:900;color:${colors.primary};line-height:1.12;padding-bottom:18px">${rm.name}</div>` +
      label('Causas') + ul(rm.causes) +
      (rm.measures?.length ? label('Medidas') + ul(rm.measures) : '') +
    `</div>`
  );
}

// Renderiza TODOS los campos de contenido de un slot (excepto título/subtítulo):
// strings → párrafo, string[] → viñetas, DefinitionItem[] → término + definición.
// Cada campo lleva su label legible (FIELD_LABELS) si corresponde.
function fieldsContent(fields: Record<string, string | string[] | DefinitionItem[]>, colors: ColorPalette): string {
  const label = (t: string) =>
    t ? `<div style="font-size:17px;font-weight:700;color:${colors.secondary};text-transform:uppercase;letter-spacing:2px;margin-top:22px">${t}</div>` : '';
  const para = (txt: string) =>
    `<div style="font-size:26px;color:${colors.text};line-height:1.5;margin-top:10px">${txt}</div>`;
  const ul = (items: string[]) =>
    `<ul style="font-size:25px;color:${colors.text};margin:8px 0 0;padding-left:26px;line-height:1.4">${items.map(i => `<li style="margin-bottom:6px">${i}</li>`).join('')}</ul>`;
  const defs = (items: DefinitionItem[]) =>
    items.map(d => `<div style="margin-top:14px"><span style="font-size:26px;font-weight:800;color:${colors.primary}">${d.term}:</span> <span style="font-size:25px;color:${colors.text}">${d.definition}</span></div>`).join('');

  let out = '';
  for (const [key, val] of Object.entries(fields)) {
    if (key === 'title' || key === 'subtitle') continue;
    const lbl = FIELD_LABELS[key] ?? '';
    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      if (typeof val[0] === 'object' && val[0] !== null) out += label(lbl) + defs(val as DefinitionItem[]);
      else out += label(lbl) + ul(val as string[]);
    } else if (typeof val === 'string' && val.trim()) {
      out += label(lbl) + para(val);
    }
  }
  return out;
}

// Slide de CIERRE: centrado y destacado (mensaje + web + marca de la empresa).
function cierreInner(fields: Record<string, string | string[] | DefinitionItem[]>, colors: ColorPalette): string {
  const msg = (fields.closingMessage as string) || '';
  const web = (fields.web as string) || '';
  const brand = (fields.brandText as string) || '';
  // Una línea por oración → frases punchy, sin cortes feos a mitad de oración.
  const msgHtml = msg
    ? `<div style="max-width:1640px">${msg
        .split(/(?<=\.)\s+/)
        .filter(Boolean)
        .map(s => `<div style="font-size:46px;font-weight:900;color:${colors.primary};line-height:1.32">${s}</div>`)
        .join('')}</div>`
    : '';
  return (
    `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 140px;box-sizing:border-box">` +
      `<div style="width:120px;height:8px;background:${colors.primary};margin-bottom:44px"></div>` +
      msgHtml +
      (web ? `<div style="font-size:34px;font-weight:800;color:${colors.secondary};margin-top:50px">${web}</div>` : '') +
      (brand ? `<div style="font-size:23px;color:${colors.text};opacity:0.78;margin-top:16px;text-transform:uppercase;letter-spacing:4px">${brand}</div>` : '') +
    `</div>`
  );
}

function genericInner(title: string, fields: Record<string, string | string[] | DefinitionItem[]>, colors: ColorPalette, hasImg: boolean): string {
  const colW = hasImg ? 790 : 1720;
  return (
    `<div style="position:absolute;left:96px;top:210px;width:${colW}px">` +
      `<div style="width:160px;height:8px;background:${colors.primary};margin-bottom:22px"></div>` +
      `<div style="font-size:46px;font-weight:900;color:${colors.primary};line-height:1.15;padding-bottom:18px">${title}</div>` +
      fieldsContent(fields, colors) +
    `</div>`
  );
}

// ── Helpers de clips (render Shotstack) ──────────────────────────────────────────

function bgClip(start: number, color: string) {
  return {
    asset: { type: 'html', html: `<div style="width:1920px;height:1080px;background:${color}"></div>`, width: 1920, height: 1080 },
    start, length: D, position: 'center', offset: { x: 0, y: 0 },
  };
}

function leftPanelCover(start: number, color: string) {
  return {
    asset: { type: 'html', html: `<div style="width:980px;height:1080px;background:${color}"></div>`, width: 980, height: 1080 },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0 },
  };
}

function rightPanelImage(start: number, src: string) {
  // Imagen a sangre completa (fit 'crop' por defecto llena el cuadro 1920×1080).
  // El panel blanco izquierdo (leftPanelCover) tapa la mitad izquierda.
  return {
    asset: { type: 'image', src },
    start, length: D,
    position: 'center', offset: { x: 0, y: 0 },
    transition: { in: 'fade' },
  };
}

/** Capa de texto de cuadro completo (1920×1080) centrada 1:1 sobre el frame. */
function textOverlay(start: number, innerHtml: string) {
  return {
    asset: {
      type: 'html',
      html: `<div style="position:relative;width:1920px;height:1080px;font-family:sans-serif;text-align:left">${innerHtml}</div>`,
      width: 1920, height: 1080,
    },
    start, length: D, position: 'center', offset: { x: 0, y: 0 },
    transition: { in: 'fade' },
  };
}

function logoCorner(start: number, logoUrl: string) {
  return {
    asset: { type: 'image', src: logoUrl },
    start, length: D,
    position: 'topLeft', offset: { x: 0.02, y: -0.045 },
    scale: 0.13, // logo más grande (≈ alto 120px en 1080)
  };
}

// ── Slide builders (clips Shotstack) ─────────────────────────────────────────────

function buildPortadaSlide(project: Project, start: number) {
  const { identity, media, slots } = project;
  const { colors } = identity;
  const slot = slots.find(s => s.id === 'SLOT_01');
  const clips: unknown[] = [];
  const pm = media['portada_img'];
  const imgUrl = normalizeDriveUrl(pm?.url);
  const isVideo = pm?.type === 'video';

  // Portada propia: media (imagen o video) a sangre completa, sin overlay ni logo.
  if (project.portadaMode === 'custom' && isValidAssetUrl(imgUrl)) {
    clips.push({ asset: { type: isVideo ? 'video' : 'image', src: imgUrl }, start, length: D, position: 'center', offset: { x: 0, y: 0 } });
    return clips;
  }

  // Plantilla diseñada: fondo (imagen o color) + overlay con título/subtítulo + logo.
  const title = (slot?.fields.title as string) || 'Prevención de Riesgos';
  const subtitle = (slot?.fields.subtitle as string) || '';
  if (isValidAssetUrl(imgUrl) && !isVideo) {
    clips.push({ asset: { type: 'image', src: imgUrl }, start, length: D, position: 'center', offset: { x: 0, y: 0 } });
  } else {
    clips.push(bgClip(start, colors.background));
  }
  clips.push(textOverlay(start, portadaInner(title, subtitle, colors)));
  if (isValidAssetUrl(identity.logoUrl)) clips.push(logoCorner(start, normalizeDriveUrl(identity.logoUrl)!));
  return clips;
}

function buildRiskSlide(project: Project, rm: RiskSubModule, start: number) {
  const { identity, media } = project;
  const { colors } = identity;
  const imgUrl = normalizeDriveUrl(media[rm.mediaId]?.url);
  const clips: unknown[] = [];
  const hasImg = isValidAssetUrl(imgUrl);

  clips.push(bgClip(start, colors.background));
  if (hasImg) {
    clips.push(rightPanelImage(start, imgUrl));
    clips.push(leftPanelCover(start, colors.background));
  }
  clips.push(textOverlay(start, riskInner(rm, colors, hasImg)));
  if (isValidAssetUrl(identity.logoUrl)) clips.push(logoCorner(start, normalizeDriveUrl(identity.logoUrl)!));
  return clips;
}

function buildGenericSlide(project: Project, slotId: string, start: number) {
  const { identity, media, slots } = project;
  const { colors } = identity;
  const slot = slots.find(s => s.id === slotId);
  if (!slot) return [];

  const clips: unknown[] = [];
  const title = (slot.fields.title as string) || slot.title;
  const mediaKey = slotId === 'SLOT_01' ? 'portada_img'
    : slotId === 'SLOT_02' ? 'objetivos_img'
    : `${slotId.toLowerCase()}_img`;
  const imgUrl = normalizeDriveUrl(media[mediaKey]?.url ?? null);
  const hasImg = isValidAssetUrl(imgUrl);

  clips.push(bgClip(start, colors.background));
  if (hasImg && imgUrl) {
    clips.push(rightPanelImage(start, imgUrl));
    clips.push(leftPanelCover(start, colors.background));
  }
  const inner = slotId === 'SLOT_10' ? cierreInner(slot.fields, colors) : genericInner(title, slot.fields, colors, hasImg);
  clips.push(textOverlay(start, inner));
  if (isValidAssetUrl(identity.logoUrl)) clips.push(logoCorner(start, normalizeDriveUrl(identity.logoUrl)!));
  return clips;
}

// ── Aplanado de slides activos (orden + audio) ───────────────────────────────────

type SlideUnit = {
  id: string;
  title: string;
  build: (start: number) => unknown[];
  previewHtml: () => string;
  audioUrl: string | null;
};

function slideUnits(project: Project): SlideUnit[] {
  const { slots, voiceAudioUrls, identity } = project;
  const { colors } = identity;
  const logoUrl = normalizeDriveUrl(identity.logoUrl);
  const units: SlideUnit[] = [];

  // Frame HTML de cuadro completo para la vista previa (mismo layout que el render).
  const fullBleedImg = (src: string) =>
    `<img src="${previewSrc(src)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`;
  const leftCover = (color: string) =>
    `<div style="position:absolute;left:0;top:0;width:980px;height:1080px;background:${color}"></div>`;
  const logoImg = isValidAssetUrl(logoUrl)
    ? `<img src="${previewSrc(logoUrl)}" style="position:absolute;left:40px;top:44px;height:118px;object-fit:contain;object-position:left" />`
    : '';
  const frame = (layers: string) =>
    `<div style="position:relative;width:1920px;height:1080px;background:${colors.background};font-family:sans-serif;text-align:left;overflow:hidden">${layers}${logoImg}</div>`;

  for (const slot of slots.filter(s => s.active)) {
    if (slot.id === 'SLOT_01') {
      const s = slot.fields;
      const title = (s.title as string) || 'Prevención de Riesgos';
      const subtitle = (s.subtitle as string) || '';
      const pm = project.media['portada_img'];
      const imgUrl = normalizeDriveUrl(pm?.url);
      const isVideo = pm?.type === 'video';
      const custom = project.portadaMode === 'custom' && isValidAssetUrl(imgUrl);
      const customHtml = () => {
        const media = isVideo
          ? `<video src="${previewSrc(imgUrl!)}" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>`
          : `<img src="${previewSrc(imgUrl!)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`;
        return `<div style="position:relative;width:1920px;height:1080px;background:#000;overflow:hidden">${media}</div>`;
      };
      units.push({
        id: slot.id,
        title: title,
        build: (start) => buildPortadaSlide(project, start),
        previewHtml: () => custom
          ? customHtml()
          : frame((isValidAssetUrl(imgUrl) && !isVideo ? fullBleedImg(imgUrl) : '') + portadaInner(title, subtitle, colors)),
        audioUrl: normalizeDriveUrl(voiceAudioUrls?.[slot.id]),
      });
    } else if (slot.id === 'SLOT_08' && slot.riskModules) {
      for (const rm of slot.riskModules.filter(r => r.active)) {
        const imgUrl = normalizeDriveUrl(project.media[rm.mediaId]?.url);
        const hasImg = isValidAssetUrl(imgUrl);
        units.push({
          id: rm.id,
          title: rm.name,
          build: (start) => buildRiskSlide(project, rm, start),
          previewHtml: () => frame((hasImg ? fullBleedImg(imgUrl!) + leftCover(colors.background) : '') + riskInner(rm, colors, hasImg)),
          audioUrl: normalizeDriveUrl(voiceAudioUrls?.[rm.id]),
        });
      }
    } else {
      const slotId = slot.id;
      const title = (slot.fields.title as string) || slot.title;
      const mediaKey = slotId === 'SLOT_02' ? 'objetivos_img' : `${slotId.toLowerCase()}_img`;
      const imgUrl = normalizeDriveUrl(project.media[mediaKey]?.url ?? null);
      const hasImg = isValidAssetUrl(imgUrl);
      units.push({
        id: slot.id,
        title,
        build: (start) => buildGenericSlide(project, slotId, start),
        previewHtml: () => frame((hasImg ? fullBleedImg(imgUrl!) + leftCover(colors.background) : '') + (slotId === 'SLOT_10' ? cierreInner(slot.fields, colors) : genericInner(title, slot.fields, colors, hasImg))),
        audioUrl: normalizeDriveUrl(voiceAudioUrls?.[slot.id]),
      });
    }
  }
  return units;
}

// ── Timeline (render Shotstack) ──────────────────────────────────────────────────

const SLIDE_TAIL = 0.8; // cola de silencio tras la voz (s)
const SLIDE_MIN = 4;    // duración mínima de un slide (s)

export async function buildTimeline(project: Project) {
  const { identity } = project;
  const units = slideUnits(project);
  const allClips: unknown[] = [];
  const audioClips: unknown[] = [];

  const durations = await Promise.all(units.map(u => audioDurationSec(u.audioUrl)));

  let offset = 0;
  units.forEach((u, i) => {
    const hasAudio = isValidAssetUrl(u.audioUrl);
    const audioLen = durations[i] ?? D;
    const len = hasAudio ? Math.max(audioLen + SLIDE_TAIL, SLIDE_MIN) : D;
    const clips = u.build(offset);
    for (const c of clips) (c as Record<string, unknown>).length = len;
    allClips.push(...clips);
    if (hasAudio) {
      audioClips.push({ asset: { type: 'audio', src: u.audioUrl!, volume: 1 }, start: offset, length: audioLen });
    }
    offset += len;
  });

  const tracks: unknown[] = [{ clips: allClips.filter(Boolean) }];
  if (audioClips.length > 0) tracks.push({ clips: audioClips });

  const timeline: Record<string, unknown> = { background: identity.colors.background, tracks };
  return { timeline, totalDuration: offset };
}

// Salida del video: MP4 16:9. 'hd' es el valor probado que funciona en el render.
export const OUTPUT = { format: 'mp4', resolution: 'hd', aspectRatio: '16:9', fps: 25 } as const;

/** Objeto Edit completo { timeline, output } que consume Shotstack. */
export async function buildEdit(project: Project) {
  const { timeline, totalDuration } = await buildTimeline(project);
  return { edit: { timeline, output: OUTPUT }, totalDuration };
}

/** Devuelve las URLs de asset que NO son http/https (no deberían existir; diagnóstico claro). */
export function collectInvalidAssetUrls(timeline: { tracks?: unknown }): string[] {
  const bad: string[] = [];
  const tracks = (timeline.tracks as Array<{ clips?: Array<{ asset?: { src?: string } }> }>) ?? [];
  for (const t of tracks) {
    for (const c of t.clips ?? []) {
      const src = c.asset?.src;
      if (src && !/^https?:\/\//.test(src)) bad.push(src);
    }
  }
  return bad;
}

/**
 * Para la VISTA PREVIA en el navegador: las imágenes de Drive (uc?id=) no cargan
 * en un <img> por hotlink/CORS de Google, así que se sirven por nuestro proxy
 * server-side. Las URLs que no son de Drive (Unsplash, etc.) pasan sin cambios.
 * (El render real de Shotstack sigue usando la URL directa de Drive.)
 */
function previewSrc(url: string | null): string {
  if (!url) return '';
  const m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ?? url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google') && m) return `/api/drive/proxy?id=${m[1]}`;
  return url;
}

/**
 * Vista previa: un HTML de cuadro completo (1920×1080) por slide activo, con el
 * MISMO layout que el render. Se renderiza directo en el navegador (escalado a
 * 16:9), sin Shotstack ni créditos. Las imágenes de Drive se ven en <img> normal.
 */
export function buildSlidesPreview(project: Project) {
  return slideUnits(project).map((u, i) => ({
    index: i,
    id: u.id,
    title: u.title,
    html: u.previewHtml(),
    audioUrl: isValidAssetUrl(u.audioUrl) ? previewSrc(u.audioUrl) : null,
  }));
}
