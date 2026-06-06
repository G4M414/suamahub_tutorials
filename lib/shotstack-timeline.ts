import { Project, RiskSubModule, ColorPalette, DefinitionItem, MediaItem } from '@/lib/types';

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

// Transición entre escenas: SIEMPRE fade. Con el solape de slides (SLIDE_OVERLAP) hace
// un crossfade real → nunca queda la pantalla en blanco entre slides. Las transiciones
// de movimiento (carousel/slide/reveal) dejaban ver el fondo blanco, por eso no se usan.
const SCENE_IN = ['fade'] as const;

// Duración mínima de cada visual del carrusel (s). Si el audio es corto, se
// muestran menos imágenes para que cada una se vea lo suficiente.
const MIN_VISUAL_SEC = 2.5;

// Geometría del panel de imagen lateral (media pantalla).
const HALF_W = 960;
const FULL_H = 1080;

// ── Marco fijo + imagen con mini-zoom (técnica del "matte") ───────────────────────
// El Studio SDK NO puede hacer zoom DENTRO de un marco fijo: cuando el clip de imagen
// tiene width/height, su máscara es hija del contenedor que se escala (internal.es.js
// :948-966). Solución: el marco lo dibuja el html5 (track 1, ENCIMA de la imagen del
// track 2) como un passe-partout con una VENTANA REDONDEADA transparente. La imagen va
// detrás y hace un zoom "respiración" (sube y baja) → el matte la recorta a la ventana
// FIJA y redondeada. Las imágenes son INFOGRAFÍAS con texto → `fit:contain` + caja <
// ventana = se ven COMPLETAS, nunca se cortan.
const WIN_SIDE = 856;                              // lado de la ventana/caja visible
// La imagen LLENA la caja (`cover`, caja = ventana) → sin hueco gris, ocupa todo el
// marco redondeado, edge-to-edge. El matte redondea las esquinas y recorta.
const IMG_BOX = WIN_SIDE;
const WIN_MX = (HALF_W - WIN_SIDE) / 2;            // margen horizontal del marco
const WIN_MY = (FULL_H - WIN_SIDE) / 2;            // margen vertical del marco
const WIN_R = 34;                                  // radio de esquina de la caja
// Superposición (s) entre imágenes del MISMO carrusel = duración del fade del SDK (1s)
// → cada imagen entra disolviéndose sobre la anterior (que sigue opaca), sin parpadeo.
const CROSSFADE = 1.0;

// Crossfade de ESCENA entre módulos = duración del fade del SDK (1s para 'fade'). Los
// slides se solapan 1s y hacen disolución cruzada → nunca queda la pantalla en blanco.
// El solape cae en el silencio entre voces en off, así el audio NO se toca.
const SLIDE_OVERLAP = 1.0;

// Mini zoom-OUT de ENTRADA (pedido de Gabriel): la imagen arranca un toque más grande
// (sobresale unos milímetros, recortada por el marco) y se ASIENTA al tamaño exacto de
// la caja en los primeros ~2s; después queda quieta. El SDK sostiene 1.0 el resto del
// clip. (from/to NÚMEROS: el SDK pone a 0 los strings → imagen invisible, internal.es.js:214.)
function settleTween(len: number, from: number) {
  const seg = +Math.min(6, len * 0.7).toFixed(3);
  return [{ from, to: 1, start: 0, length: seg, interpolation: 'bezier' as const, easing: 'ease' as const }];
}
const SETTLE_SIDE = 1.02;   // panel lateral: arranca 2% más grande y se asienta (~3s)
const SETTLE_FULL = 1.05;   // portada/cierre a sangre

// Marco sobre el lado de la imagen: una VENTANA redondeada transparente con CONTORNO
// VERDE de marca (sin la sombra/caja pesada anterior). Truco: un rect transparente con
// `box-shadow` de spread enorme rellena TODO el medio-cuadro (recortado con
// overflow:hidden) MENOS el rect redondeado → la imagen detrás queda recortada a una
// ventana de esquinas redondeadas, edge-to-edge, sin tapar el texto.
function imageMatte(imageSide: Side, colors: ColorPalette): string {
  const onLeft = imageSide === 'left';
  const hx = onLeft ? 0 : HALF_W;                  // origen del medio-cuadro (0 ó 960)
  const wl = WIN_MX;                               // x de la ventana DENTRO del contenedor (medio-cuadro)
  const bg = colors.background;
  const win = `left:${wl}px;top:${WIN_MY}px;width:${WIN_SIDE}px;height:${WIN_SIDE}px;border-radius:${WIN_R}px`;
  return (
    `<div style="position:absolute;left:${hx}px;top:0;width:${HALF_W}px;height:${FULL_H}px;overflow:hidden">` +
      // Agujero redondeado: el spread del box-shadow rellena el medio-cuadro con el color
      // de fondo MENOS este rect → ventana transparente con esquinas redondeadas.
      `<div style="position:absolute;${win};box-shadow:0 0 0 2000px ${bg}"></div>` +
      // Contorno verde de marca (línea limpia, sin sombra) → le da vida y define la caja.
      `<div style="position:absolute;${win};border:2px solid ${colors.primary};box-sizing:border-box"></div>` +
    `</div>`
  );
}


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

// ── Resolución de visuales por slot ──────────────────────────────────────────────
// Cada slot puede tener hasta 3 visuales (imagen o video) que se suceden mientras
// dura la voz en off. La clave base es la histórica (portada_img, objetivos_img,
// slot_03_img, media_08a…); los visuales 2 y 3 son `${base}_2` y `${base}_3`.
// Así los datos viejos (un solo visual = clave base) siguen funcionando intactos.

export type Visual = { url: string; type: 'image' | 'video' };

/** Clave base de media para un slot regular (no SLOT_08). */
export function slotBaseMediaKey(slotId: string): string {
  if (slotId === 'SLOT_01') return 'portada_img';
  if (slotId === 'SLOT_02') return 'objetivos_img';
  return `${slotId.toLowerCase()}_img`;
}

/** Las 3 claves de media (base, _2, _3) para un slot/módulo dada su clave base. */
export function visualKeys(baseKey: string): string[] {
  return [baseKey, `${baseKey}_2`, `${baseKey}_3`];
}

/** Junta los visuales válidos (con URL http) de un slot, en orden, hasta 3. */
function collectVisuals(media: Record<string, MediaItem>, baseKey: string): Visual[] {
  const out: Visual[] = [];
  for (const k of visualKeys(baseKey)) {
    const item = media[k];
    const url = normalizeDriveUrl(item?.url);
    if (isValidAssetUrl(url)) out.push({ url, type: item?.type === 'video' ? 'video' : 'image' });
  }
  return out;
}

/** Cuántos visuales mostrar según la duración disponible (≥ MIN_VISUAL_SEC c/u). */
function visualCount(total: number, len: number): number {
  if (total <= 1) return total;
  return Math.max(1, Math.min(total, Math.floor(len / MIN_VISUAL_SEC)));
}

// ── Layout de texto (fuente única, usada por render y preview) ───────────────────
// Con imagen, el texto ocupa media pantalla del lado contrario a la imagen
// (`textSide`). Sin imagen, ocupa casi todo el ancho.

type Side = 'left' | 'right';
const opposite = (s: Side): Side => (s === 'left' ? 'right' : 'left');

// Portada / cierre: overlay full-bleed (la imagen va de fondo a sangre en track 2;
// este html5 va encima con fondo transparente + degradado para legibilidad).
function portadaInner(title: string, subtitle: string, colors: ColorPalette, hasBg: boolean): string {
  // Con imagen de fondo: overlay oscuro + texto blanco (contraste sobre la foto).
  // Sin imagen: fondo sólido del tema + colores del tema (legible en fondos claros).
  const bg = hasBg
    ? `<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.55) 45%,rgba(0,0,0,0.15) 100%)"></div>`
    : `<div style="position:absolute;inset:0;background:${colors.background}"></div>`;
  const titleColor = hasBg ? '#ffffff' : colors.primary;
  const subColor = hasBg ? '#ffffff' : colors.text;
  const shadow = hasBg ? 'text-shadow:0 2px 18px rgba(0,0,0,0.5)' : '';
  const subShadow = hasBg ? 'text-shadow:0 2px 12px rgba(0,0,0,0.5)' : '';
  return (
    bg +
    `<div style="position:absolute;left:96px;top:360px;width:1000px">` +
      `<div style="width:180px;height:8px;background:${colors.primary};margin-bottom:30px"></div>` +
      `<div style="font-size:64px;font-weight:900;color:${titleColor};line-height:1.1;${shadow}">${title}</div>` +
      (subtitle ? `<div style="font-size:30px;color:${subColor};opacity:0.9;line-height:1.4;margin-top:24px;${subShadow}">${subtitle}</div>` : '') +
    `</div>`
  );
}

// ── Helpers de diseño premium (compartidos por todos los slides de contenido) ─────
// El texto se rasteriza estático en Shotstack; el "movimiento" lo dan las
// transiciones de clip. Estos helpers dan el look de "curso producido": title card
// por sección (número + kicker + título + barra), viñetas con marcador de marca y
// barra de progreso del curso.

// Título de sección: título grande + barra de acento. (Sin número "NN/TOTAL": no
// aporta al espectador y robaba espacio — pedido de Gabriel.)
function premiumHeader(title: string, idx: number, total: number, colors: ColorPalette): string {
  void idx; void total;
  // Título en gris oscuro casi-negro (#1d1d1d), NO verde. La barra de acento queda verde.
  return (
    `<div style="font-size:56px;font-weight:900;color:#1d1d1d;line-height:1.06;letter-spacing:-0.5px">${title}</div>` +
    `<div style="width:96px;height:6px;background:${colors.primary};border-radius:3px;margin-top:22px"></div>`
  );
}

// Etiqueta de subsección como "chip" redondeado (Causas / Medidas / etc.): mucho más
// presente y de diseño que un simple bullet.
function premiumLabel(t: string, colors: ColorPalette): string {
  return t
    ? `<div style="display:inline-block;margin-top:30px;margin-bottom:6px;padding:7px 18px;border-radius:999px;` +
        `background:${colors.primary};font-size:15px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:2.5px">${t}</div>`
    : '';
}

// Viñetas con marcador de marca (▸) en lugar del disco por defecto.
function premiumList(items: string[], colors: ColorPalette, size = 24): string {
  return `<div style="margin-top:8px">` + items.map(i =>
    `<div style="position:relative;padding-left:30px;margin-bottom:9px;font-size:${size}px;color:${colors.text};line-height:1.42">` +
      `<span style="position:absolute;left:0;top:1px;color:${colors.primary};font-weight:900">▸</span>${i}` +
    `</div>`).join('') + `</div>`;
}

const premiumPara = (txt: string, colors: ColorPalette, size = 26) =>
  `<div style="font-size:${size}px;color:${colors.text};line-height:1.55;margin-top:10px">${txt}</div>`;

// Definiciones con borde de acento a la izquierda (look de glosario).
function premiumDefs(items: DefinitionItem[], colors: ColorPalette): string {
  return items.map(d =>
    `<div style="margin-top:15px;padding-left:18px;border-left:4px solid ${colors.primary}">` +
      `<span style="font-size:26px;font-weight:800;color:${colors.primary}">${d.term}:</span> ` +
      `<span style="font-size:25px;color:${colors.text}">${d.definition}</span>` +
    `</div>`).join('');
}

// Barra de progreso del curso al pie del cuadro (nivel frame 1920×1080).
function progressBar(idx: number, total: number, colors: ColorPalette): string {
  const pct = Math.max(6, Math.round(((idx + 1) / total) * 100));
  return (
    `<div style="position:absolute;left:0;bottom:0;width:1920px;height:8px;background:rgba(127,127,127,0.18)">` +
      `<div style="width:${pct}%;height:100%;background:${colors.primary}"></div>` +
    `</div>`
  );
}

function riskInner(rm: RiskSubModule, colors: ColorPalette, imageSide: Side | null, idx: number, total: number): string {
  const body =
    premiumHeader(rm.name, idx, total, colors) +
    premiumLabel('Causas', colors) + premiumList(rm.causes, colors) +
    (rm.measures?.length ? premiumLabel('Medidas', colors) + premiumList(rm.measures, colors) : '');
  return panelLayout(body, colors, imageSide) + progressBar(idx, total, colors);
}

// Renderiza TODOS los campos de contenido de un slot (excepto título/subtítulo):
// strings → párrafo, string[] → viñetas, DefinitionItem[] → término + definición.
function fieldsContent(fields: Record<string, string | string[] | DefinitionItem[]>, colors: ColorPalette): string {
  let out = '';
  for (const [key, val] of Object.entries(fields)) {
    if (key === 'title' || key === 'subtitle') continue;
    const lbl = FIELD_LABELS[key] ?? '';
    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      if (typeof val[0] === 'object' && val[0] !== null) out += premiumLabel(lbl, colors) + premiumDefs(val as DefinitionItem[], colors);
      else out += premiumLabel(lbl, colors) + premiumList(val as string[], colors, 25);
    } else if (typeof val === 'string' && val.trim()) {
      out += premiumLabel(lbl, colors) + premiumPara(val, colors);
    }
  }
  return out;
}

// Slide de CIERRE: centrado y destacado sobre imagen full-bleed (o color sólido).
function cierreInner(fields: Record<string, string | string[] | DefinitionItem[]>, colors: ColorPalette, hasBg: boolean): string {
  const msg = (fields.closingMessage as string) || '';
  const web = (fields.web as string) || '';
  const brand = (fields.brandText as string) || '';
  // Con imagen: overlay oscuro + texto blanco. Sin imagen: fondo sólido + colores del tema.
  const msgColor = hasBg ? '#ffffff' : colors.primary;
  const webColor = hasBg ? '#ffffff' : colors.secondary;
  const brandColor = hasBg ? '#ffffff' : colors.text;
  const msgShadow = hasBg ? 'text-shadow:0 2px 18px rgba(0,0,0,0.6)' : '';
  const msgHtml = msg
    ? `<div style="max-width:1640px">${msg
        .split(/(?<=\.)\s+/)
        .filter(Boolean)
        .map(s => `<div style="font-size:48px;font-weight:900;color:${msgColor};line-height:1.32;${msgShadow}">${s}</div>`)
        .join('')}</div>`
    : '';
  const bg = hasBg
    ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.6)"></div>`
    : `<div style="position:absolute;inset:0;background:${colors.background}"></div>`;
  return (
    bg +
    `<div style="position:relative;display:table;width:1920px;height:1080px">` +
      `<div style="display:table-cell;vertical-align:middle;text-align:center;padding:0 140px">` +
        `<div style="width:120px;height:8px;background:${colors.primary};margin:0 auto 44px"></div>` +
        msgHtml +
        (web ? `<div style="font-size:34px;font-weight:800;color:${webColor};margin-top:50px">${web}</div>` : '') +
        (brand ? `<div style="font-size:23px;color:${brandColor};opacity:0.82;margin-top:16px;text-transform:uppercase;letter-spacing:4px">${brand}</div>` : '') +
      `</div>` +
    `</div>`
  );
}

function genericInner(title: string, fields: Record<string, string | string[] | DefinitionItem[]>, colors: ColorPalette, imageSide: Side | null, idx: number, total: number): string {
  const body = premiumHeader(title, idx, total, colors) + fieldsContent(fields, colors);
  return panelLayout(body, colors, imageSide) + progressBar(idx, total, colors);
}

// Elemento decorativo: gran círculo de marca MUY tenue en una esquina + acento, para
// dar profundidad y que no sea un fondo plano (look "diseñado", no básico).
function decorBlob(corner: string, colors: ColorPalette): string {
  // Solo en la esquina del lado del TEXTO (no llega a la ventana de la imagen, así no
  // la tiñe). Círculo de marca + anillo, muy tenues.
  return (
    `<div style="position:absolute;${corner};width:560px;height:560px;border-radius:50%;background:${colors.primary};opacity:0.06"></div>` +
    `<div style="position:absolute;${corner};width:560px;height:560px;border-radius:50%;border:2px solid ${colors.primary};opacity:0.10;transform:scale(1.18)"></div>`
  );
}

// Layout de panel: panel de color + texto en `textSide` (lado opuesto a la imagen).
// Si imageSide es null, el texto ocupa casi todo el ancho. El texto arranca más arriba
// (top:140) tras quitar el número de sección → más aire abajo.
function panelLayout(body: string, colors: ColorPalette, imageSide: Side | null): string {
  if (!imageSide) {
    return (
      `<div style="position:absolute;inset:0;background:${colors.background}"></div>` +
      decorBlob('right:-180px;bottom:-180px', colors) +
      `<div style="position:absolute;left:96px;top:150px;width:1720px">${body}</div>`
    );
  }
  const textSide = opposite(imageSide);
  const panelStyle = textSide === 'left' ? 'left:0' : 'right:0';
  const textLeft = textSide === 'left' ? 96 : HALF_W + 96; // 1056
  const blobCorner = textSide === 'left' ? 'left:-170px;bottom:-170px' : 'right:-170px;bottom:-170px';
  return (
    `<div style="position:absolute;${panelStyle};top:0;width:${HALF_W}px;height:${FULL_H}px;background:${colors.background}"></div>` +
    decorBlob(blobCorner, colors) +
    // Marco fijo (passe-partout) sobre el lado de la imagen: recorta el zoom a una ventana fija.
    imageMatte(imageSide, colors) +
    `<div style="position:absolute;left:${textLeft}px;top:140px;width:790px">${body}</div>`
  );
}

// ── Helpers de clips (render Shotstack, multi-track) ──────────────────────────────
// REGLA DE COMPOSICIÓN: el html5 (fondo de color + texto) va en track 1 (medio) y
// PRIMERO; los clips de imagen van en track 2 (debajo) y se ven por el hueco
// transparente del html5. El logo va en track 0 (encima de todo).
// _track (0/1/2) lo usa buildTimeline para separar tracks; se elimina antes de enviar.

function slideHtml5(start: number, len: number, innerHtml: string, transitionIn: string) {
  return {
    _track: 1,
    asset: {
      type: 'html5',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;font-family:sans-serif;text-align:left;background:transparent;position:relative}</style></head><body>${innerHtml}</body></html>`,
    },
    start, length: len, position: 'center', offset: { x: 0, y: 0 },
    transition: { in: transitionIn, out: 'fade' },
  };
}

// Logo en la esquina SUPERIOR del lado del TEXTO (lado opuesto a la imagen), para
// que nunca se superponga al texto (que arranca más abajo) ni a la imagen (que está
// del otro lado). Tamaño fijo (width/height + fit:contain) en vez de `scale`: el
// Studio SDK ubica de forma fiable las imágenes con dimensiones, pero con `scale`
// las dejaba en el centro del cuadro.
function logoCorner(start: number, len: number, logoUrl: string, side: Side = 'left') {
  const pos = side === 'right' ? 'topRight' : 'topLeft';
  const ox = side === 'right' ? -0.02 : 0.02;
  return {
    _track: 0,
    asset: { type: 'image', src: logoUrl },
    start, length: len,
    position: pos, offset: { x: ox, y: -0.03 },
    width: 300, height: 110, fit: 'contain',
    // Fade para que en el crossfade de escena no se vean dos logos saltando de esquina.
    transition: { in: 'fade', out: 'fade' },
  };
}

/**
 * Carrusel de visuales sincronizado con el audio del slide. Reparte `len` entre los
 * visuales (hasta 3), cada uno con crossfade (in/out fade) y un Ken Burns rotado.
 * `placement` define dónde se ubica: media pantalla izq/der o full-bleed (center).
 */
function imageSequenceClips(
  visuals: Visual[],
  placement: Side | 'full',
  start: number,
  len: number,
  slideIdx: number,
): unknown[] {
  if (visuals.length === 0) return [];
  const n = visualCount(visuals.length, len);
  const seg = len / n;
  const full = placement === 'full';
  return visuals.slice(0, n).map((v, k) => {
    const last = k === n - 1;
    // Cada clip se extiende CROSSFADE hacia el siguiente → solapan; el de arriba entra
    // con transition fade ENCIMA del anterior (que sigue opaco) = disolución sin blanco.
    const l0 = +(seg + (last ? 0 : CROSSFADE)).toFixed(3);
    // Disolución entre imágenes del carrusel: fade-in siempre; fade-out solo en la
    // última (acompaña el fundido de la escena). Las intermedias NO llevan out → el de
    // abajo queda opaco mientras el de arriba entra = disolución sin blanco.
    const transition = last ? { in: 'fade', out: 'fade' } : { in: 'fade' };
    const asset = v.type === 'video' ? { type: 'video', src: v.url, volume: 0 } : { type: 'image', src: v.url };
    // CLAVE de la disolución dentro del módulo: cada imagen del carrusel va en SU PROPIO
    // track. En Shotstack/SDK dos clips que se solapan en el MISMO track no se funden
    // (el fade revela el fondo, no la imagen previa). Poniendo la imagen MÁS NUEVA en un
    // track de número MENOR (= más arriba) entra con fade-in ENCIMA de la anterior (que
    // sigue opaca) = disolución cruzada real. Todas quedan debajo del matte (track 1).
    const base = {
      _track: 2 + (n - 1 - k),
      asset,
      start: +(start + k * seg).toFixed(3),
      length: l0,
      transition,
    };
    if (full) {
      // Portada/cierre: a sangre (1920×1080) con `cover` + mini zoom-out de entrada.
      return { ...base, width: 1920, height: FULL_H, fit: 'cover', position: 'center', offset: { x: 0, y: 0 }, scale: settleTween(l0, SETTLE_FULL) };
    }
    // Lateral: la imagen LLENA la caja (`cover`) centrada en la ventana del matte.
    // position 'center' + offset ±0.25 ⇒ centro del medio-cuadro. Mini zoom-OUT de
    // entrada: arranca un toque más grande (recortada por el marco) y se asienta al
    // tamaño exacto de la caja; el matte (encima) la mantiene edge-to-edge y redondeada.
    return {
      ...base,
      width: IMG_BOX, height: IMG_BOX,
      fit: 'cover',
      position: 'center',
      offset: { x: placement === 'left' ? -0.25 : 0.25, y: 0 },
      scale: settleTween(l0, SETTLE_SIDE),
    };
  });
}

// ── Slide builders (clips Shotstack, multi-track) ────────────────────────────────
// Cada builder recibe el `start` y la duración real `len` del slide (para el carrusel)
// y el índice del slide (para alternar layout y rotar efecto/transición).

function buildPortadaSlide(project: Project, start: number, len: number, idx: number): unknown[] {
  const { identity, media, slots } = project;
  const { colors } = identity;
  const slot = slots.find(s => s.id === 'SLOT_01');
  const pm = media['portada_img'];
  const imgUrl = normalizeDriveUrl(pm?.url);
  const isVideo = pm?.type === 'video';
  const logoUrl = isValidAssetUrl(identity.logoUrl) ? normalizeDriveUrl(identity.logoUrl) : null;
  const transIn = SCENE_IN[idx % SCENE_IN.length];

  // Portada custom: imagen/video a sangre, sin overlay de texto y SIN logo.
  // Es una portada ya diseñada (trae su propio branding) → no se le superpone el logo.
  if (project.portadaMode === 'custom' && isValidAssetUrl(imgUrl)) {
    // volume:0 en el video → solo se escucha la voz en off (evita el "eco" del audio del video).
    const asset = isVideo ? { type: 'video', src: imgUrl, volume: 0 } : { type: 'image', src: imgUrl };
    return [
      { _track: 1, asset, start, length: len, position: 'center', offset: { x: 0, y: 0 }, transition: { in: transIn, out: 'fade' } },
    ];
  }

  // Plantilla: imagen full-bleed (track 2) + overlay con título (track 1) + logo (track 0).
  const title = (slot?.fields.title as string) || 'Prevención de Riesgos';
  const subtitle = (slot?.fields.subtitle as string) || '';
  const visuals = collectVisuals(media, 'portada_img');
  return [
    slideHtml5(start, len, portadaInner(title, subtitle, colors, visuals.length > 0), transIn),
    logoUrl ? logoCorner(start, len, logoUrl) : null,
    ...imageSequenceClips(visuals, 'full', start, len, idx),
  ].filter(Boolean);
}

function buildRiskSlide(project: Project, rm: RiskSubModule, start: number, len: number, idx: number, total: number): unknown[] {
  const { identity, media } = project;
  const { colors } = identity;
  const visuals = collectVisuals(media, rm.mediaId);
  const imageSide: Side = idx % 2 === 0 ? 'right' : 'left';
  const logoSide: Side = visuals.length ? opposite(imageSide) : 'left';
  const logoUrl = isValidAssetUrl(identity.logoUrl) ? normalizeDriveUrl(identity.logoUrl) : null;
  const transIn = SCENE_IN[idx % SCENE_IN.length];
  return [
    slideHtml5(start, len, riskInner(rm, colors, visuals.length ? imageSide : null, idx, total), transIn),
    logoUrl ? logoCorner(start, len, logoUrl, logoSide) : null,
    ...imageSequenceClips(visuals, imageSide, start, len, idx),
  ].filter(Boolean);
}

function buildGenericSlide(project: Project, slotId: string, start: number, len: number, idx: number, total: number): unknown[] {
  const { identity, media, slots } = project;
  const { colors } = identity;
  const slot = slots.find(s => s.id === slotId);
  if (!slot) return [];

  const title = (slot.fields.title as string) || slot.title;
  const visuals = collectVisuals(media, slotBaseMediaKey(slotId));
  const logoUrl = isValidAssetUrl(identity.logoUrl) ? normalizeDriveUrl(identity.logoUrl) : null;
  const transIn = SCENE_IN[idx % SCENE_IN.length];
  const isSlot10 = slotId === 'SLOT_10';

  if (isSlot10) {
    // Cierre custom (igual que la portada propia): imagen/video a sangre, sin texto y
    // SIN logo. Es un cierre ya diseñado (trae su propio branding).
    const cm = media[slotBaseMediaKey(slotId)];
    const cierreUrl = normalizeDriveUrl(cm?.url);
    if (project.cierreMode === 'custom' && isValidAssetUrl(cierreUrl)) {
      const asset = cm?.type === 'video'
        ? { type: 'video', src: cierreUrl, volume: 0 }   // volume:0 → solo la voz en off
        : { type: 'image', src: cierreUrl };
      return [
        { _track: 1, asset, start, length: len, position: 'center', offset: { x: 0, y: 0 }, transition: { in: transIn, out: 'fade' } },
      ];
    }
    // Cierre plantilla: imagen de fondo + overlay con texto centrado.
    return [
      slideHtml5(start, len, cierreInner(slot.fields, colors, visuals.length > 0), transIn),
      logoUrl ? logoCorner(start, len, logoUrl) : null,
      ...imageSequenceClips(visuals, 'full', start, len, idx),
    ].filter(Boolean);
  }

  const imageSide: Side = idx % 2 === 0 ? 'right' : 'left';
  const logoSide: Side = visuals.length ? opposite(imageSide) : 'left';
  return [
    slideHtml5(start, len, genericInner(title, slot.fields, colors, visuals.length ? imageSide : null, idx, total), transIn),
    logoUrl ? logoCorner(start, len, logoUrl, logoSide) : null,
    ...imageSequenceClips(visuals, imageSide, start, len, idx),
  ].filter(Boolean);
}

// ── Aplanado de slides activos (orden + audio) ───────────────────────────────────

type SlideUnit = {
  id: string;
  title: string;
  build: (start: number, len: number) => unknown[];
  previewHtml: () => string;
  audioUrl: string | null;
};

export function slideUnits(project: Project): SlideUnit[] {
  const { slots, voiceAudioUrls, identity } = project;
  const { colors } = identity;
  const logoUrl = normalizeDriveUrl(identity.logoUrl);
  const units: SlideUnit[] = [];

  // Logo del preview en la esquina superior del lado indicado (espejo del render).
  const logoImgHtml = (side: Side) => isValidAssetUrl(logoUrl)
    ? `<img src="${previewSrc(logoUrl)}" style="position:absolute;${side === 'right' ? 'right:48px' : 'left:48px'};top:38px;height:96px;object-fit:contain;object-position:${side};z-index:5" />`
    : '';
  const frame = (layers: string, logoSide: Side = 'left') =>
    `<div style="position:relative;width:1920px;height:1080px;background:${colors.background};font-family:sans-serif;text-align:left;overflow:hidden">${layers}${logoImgHtml(logoSide)}</div>`;

  // Imagen de media pantalla (preview estático): ventana 1:1 fija con marco blanco fino,
  // espejo del passe-partout del render (imageMatte). La imagen llena la ventana (cover).
  const sidePanel = (side: Side, url: string) => {
    const winX = side === 'left' ? WIN_MX : HALF_W + WIN_MX;
    return (
      `<div style="position:absolute;left:${winX}px;top:${WIN_MY}px;width:${WIN_SIDE}px;height:${WIN_SIDE}px;` +
        `border-radius:${WIN_R}px;box-sizing:border-box;overflow:hidden;border:2px solid ${colors.primary}">` +
        `<img src="${previewSrc(url)}" style="width:100%;height:100%;object-fit:cover" /></div>`
    );
  };
  // Imagen full-bleed (preview).
  const fullPanel = (url: string) =>
    `<div style="position:absolute;inset:0;overflow:hidden"><img src="${previewSrc(url)}" style="width:100%;height:100%;object-fit:cover" /></div>`;

  // Índice de slide REAL (cada riesgo activo de SLOT_08 es un slide propio).
  // Se usa para alternar el lado de la imagen (par→der, impar→izq) y rotar
  // efecto/transición. SLOT_08 en sí no es un slide.
  // `totalSlides` se asigna tras el loop; los closures (build/previewHtml) lo leen
  // por referencia al ejecutarse, así el número "NN / TOTAL" de las title cards es correcto.
  let totalSlides = 0;
  let slideIdx = 0;
  for (const slot of slots.filter(s => s.active)) {
    if (slot.id === 'SLOT_01') {
      const i = slideIdx++;
      const s = slot.fields;
      const title = (s.title as string) || 'Prevención de Riesgos';
      const subtitle = (s.subtitle as string) || '';
      const pm = project.media['portada_img'];
      const imgUrl = normalizeDriveUrl(pm?.url);
      const isVideo = pm?.type === 'video';
      const custom = project.portadaMode === 'custom' && isValidAssetUrl(imgUrl);
      const visuals = collectVisuals(project.media, 'portada_img');
      const customHtml = () => {
        const media = isVideo
          ? `<video src="${previewSrc(imgUrl!)}" autoplay muted loop playsinline controls style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>`
          : `<img src="${previewSrc(imgUrl!)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`;
        return `<div style="position:relative;width:1920px;height:1080px;background:#000;overflow:hidden">${media}</div>`;
      };
      units.push({
        id: slot.id,
        title,
        build: (start, len) => buildPortadaSlide(project, start, len, i),
        previewHtml: () => custom
          ? customHtml()
          : frame((visuals[0] ? fullPanel(visuals[0].url) : '') + portadaInner(title, subtitle, colors, visuals.length > 0)),
        audioUrl: normalizeDriveUrl(voiceAudioUrls?.[slot.id]),
      });
    } else if (slot.id === 'SLOT_08' && slot.riskModules) {
      for (const rm of slot.riskModules.filter(r => r.active)) {
        const i = slideIdx++;
        const side: Side = i % 2 === 0 ? 'right' : 'left';
        const visuals = collectVisuals(project.media, rm.mediaId);
        units.push({
          id: rm.id,
          title: rm.name,
          build: (start, len) => buildRiskSlide(project, rm, start, len, i, totalSlides),
          previewHtml: () => frame(
            (visuals[0] ? sidePanel(side, visuals[0].url) : '') + riskInner(rm, colors, visuals.length ? side : null, i, totalSlides),
            visuals.length ? opposite(side) : 'left',
          ),
          audioUrl: normalizeDriveUrl(voiceAudioUrls?.[rm.id]),
        });
      }
    } else {
      const i = slideIdx++;
      const slotId = slot.id;
      const title = (slot.fields.title as string) || slot.title;
      const visuals = collectVisuals(project.media, slotBaseMediaKey(slotId));
      const isSlot10 = slotId === 'SLOT_10';
      const cm = isSlot10 ? project.media[slotBaseMediaKey(slotId)] : undefined;
      const cierreUrl = normalizeDriveUrl(cm?.url);
      const cierreCustom = isSlot10 && project.cierreMode === 'custom' && isValidAssetUrl(cierreUrl);
      const cierreIsVideo = cm?.type === 'video';
      const imageSide: Side = i % 2 === 0 ? 'right' : 'left';
      units.push({
        id: slot.id,
        title,
        build: (start, len) => buildGenericSlide(project, slotId, start, len, i, totalSlides),
        previewHtml: () => {
          if (isSlot10) {
            if (cierreCustom) {
              const mediaEl = cierreIsVideo
                ? `<video src="${previewSrc(cierreUrl!)}" autoplay muted loop playsinline controls style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>`
                : `<img src="${previewSrc(cierreUrl!)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`;
              return `<div style="position:relative;width:1920px;height:1080px;background:#000;overflow:hidden">${mediaEl}</div>`;
            }
            return frame((visuals[0] ? fullPanel(visuals[0].url) : '') + cierreInner(slot.fields, colors, visuals.length > 0));
          }
          return frame(
            (visuals[0] ? sidePanel(imageSide, visuals[0].url) : '') + genericInner(title, slot.fields, colors, visuals.length ? imageSide : null, i, totalSlides),
            visuals.length ? opposite(imageSide) : 'left',
          );
        },
        audioUrl: normalizeDriveUrl(voiceAudioUrls?.[slot.id]),
      });
    }
  }
  totalSlides = slideIdx;
  return units;
}

// ── Timeline (render Shotstack) ──────────────────────────────────────────────────

// Cola corta tras el fin del audio: lo justo para el fundido de escena, sin que la
// imagen quede "colgada" sola mucho rato después de que terminó la voz en off.
const SLIDE_TAIL = 0.4;
const SLIDE_MIN = 4;

/**
 * Separa clips por su propiedad `_track` (0/1/2) y elimina esa propiedad antes
 * de enviar a Shotstack. Devuelve un Map<trackIndex, clips[]> ordenado.
 */
export function separateByTrack(clips: unknown[]): Map<number, unknown[]> {
  const map = new Map<number, unknown[]>();
  for (const clip of clips) {
    const c = clip as Record<string, unknown>;
    const idx = typeof c._track === 'number' ? c._track : 1;
    const { _track, ...clean } = c;
    void _track;
    if (!map.has(idx)) map.set(idx, []);
    map.get(idx)!.push(clean);
  }
  return map;
}

export async function buildTimeline(project: Project) {
  const { identity } = project;
  const units = slideUnits(project);
  const allClips: unknown[] = [];
  const audioClips: unknown[] = [];

  const durations = await Promise.all(units.map(u => audioDurationSec(u.audioUrl)));

  // Inicio (s) de cada slide → para navegar prev/next en el preview.
  const slideStarts: { id: string; title: string; start: number }[] = [];

  let offset = 0;
  units.forEach((u, i) => {
    const hasAudio = isValidAssetUrl(u.audioUrl);
    const audioLen = durations[i] ?? D;
    const len = hasAudio ? Math.max(audioLen + SLIDE_TAIL, SLIDE_MIN) : D;
    slideStarts.push({ id: u.id, title: u.title, start: +offset.toFixed(3) });
    // Crossfade de escena: los clips del slide se extienden SLIDE_OVERLAP hacia el
    // siguiente, que arranca en su tiempo con fade-in → disolución cruzada en lugar de
    // un parpadeo en blanco. El solape cae en el silencio entre voces (audio = audioLen,
    // termina antes del fin del slide por SLIDE_TAIL), así NO se solapan las voces.
    const isLastSlide = i === units.length - 1;
    const visualLen = len + (isLastSlide ? 0 : SLIDE_OVERLAP);
    const clips = u.build(offset, visualLen);
    allClips.push(...clips);
    if (hasAudio) {
      audioClips.push({ asset: { type: 'audio', src: u.audioUrl!, volume: 1 }, start: offset, length: audioLen });
    }
    offset += len;
  });

  // Multi-track: track 0 (logos), track 1 (html5), track 2 (panel images)
  const trackMap = separateByTrack(allClips.filter(Boolean));
  const visualTracks = [...trackMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .filter(([, cs]) => cs.length > 0)
    .map(([, cs]) => ({ clips: cs }));
  const tracks: unknown[] = [...visualTracks];
  if (audioClips.length > 0) tracks.push({ clips: audioClips });

  const timeline: Record<string, unknown> = { background: identity.colors.background, tracks };
  return { timeline, totalDuration: offset, slideStarts };
}

// Salida del video: MP4 16:9 1920×1080. 'fhd' coincide con el canvas HTML (1920×1080).
export const OUTPUT = { format: 'mp4', resolution: '1080', aspectRatio: '16:9', fps: 25 } as const;

/** Objeto Edit completo { timeline, output } que consume Shotstack. */
export async function buildEdit(project: Project) {
  const { timeline, totalDuration, slideStarts } = await buildTimeline(project);
  return { edit: { timeline, output: OUTPUT }, totalDuration, slideStarts };
}

/** Devuelve las URLs de asset que NO son http/https (no deberían existir; diagnóstico claro). */
export function collectInvalidAssetUrls(timeline: { tracks?: unknown }): string[] {
  const bad: string[] = [];
  const tracks = (timeline.tracks as Array<{ clips?: Array<{ asset?: { src?: string; html?: string } }> }>) ?? [];
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
