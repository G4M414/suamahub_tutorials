import { NextRequest, NextResponse } from 'next/server';
import { Project, RiskSubModule } from '@/lib/types';

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV ?? 'stage';
const SHOTSTACK_BASE = `https://api.shotstack.io/${SHOTSTACK_ENV}`;

const D = 8; // seconds per slide

// ── Layout B helpers ──────────────────────────────────────────────────────────
// Frame: 1920×1080. Left panel: x=-0.245 (center of left half). Right panel: x=+0.245.
// Offset coords: 0.5 = half frame width from center.

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
  return {
    asset: { type: 'image', src },
    start, length: D,
    position: 'center', offset: { x: 0.245, y: 0 },
    scale: 0.5625, // 1080/1920 → fills right panel height for a 1:1 image
    transition: { in: 'fadeIn' },
  };
}

function accentDivider(start: number, color: string) {
  return {
    asset: { type: 'html', html: `<div style="width:6px;height:1080px;background:${color}"></div>`, width: 6, height: 1080 },
    start, length: D, position: 'center', offset: { x: -0.0015, y: 0 },
  };
}

function logoCorner(start: number, logoUrl: string) {
  return {
    asset: { type: 'image', src: logoUrl },
    start, length: D,
    position: 'topLeft', offset: { x: 0.025, y: -0.025 },
    scale: 0.08,
  };
}

// ── Slide builders ────────────────────────────────────────────────────────────

function buildPortadaSlide(project: Project, start: number) {
  const { identity, media, slots } = project;
  const { colors } = identity;
  const slot = slots.find(s => s.id === 'SLOT_01');
  const clips: unknown[] = [];
  const imgUrl = media['portada_img']?.url;
  const title = (slot?.fields.title as string) || 'Prevención de Riesgos';
  const subtitle = (slot?.fields.subtitle as string) || '';
  const font = 'font-family:sans-serif;';

  // Full background image or color
  if (imgUrl) {
    clips.push({ asset: { type: 'image', src: imgUrl }, start, length: D, position: 'center', scale: 1.0 });
  } else {
    clips.push(bgClip(start, colors.background));
  }

  // Semi-transparent dark overlay on left half
  clips.push({
    asset: { type: 'html', html: `<div style="width:980px;height:1080px;background:rgba(0,0,0,0.62)"></div>`, width: 980, height: 1080 },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0 },
  });

  // Accent bar top-left
  clips.push({
    asset: { type: 'html', html: `<div style="width:900px;height:8px;background:${colors.primary}"></div>`, width: 900, height: 8 },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0.46 },
  });

  // Title
  clips.push({
    asset: {
      type: 'html',
      html: `<p style="${font}font-size:62px;font-weight:900;color:${colors.primary};text-align:left;line-height:1.15;max-width:860px">${title}</p>`,
      width: 860, height: 280,
    },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0.1 },
    transition: { in: 'fadeIn' },
  });

  // Subtitle
  if (subtitle) {
    clips.push({
      asset: {
        type: 'html',
        html: `<p style="${font}font-size:30px;color:#ffffff;opacity:0.85;text-align:left;line-height:1.45;max-width:860px">${subtitle}</p>`,
        width: 860, height: 100,
      },
      start, length: D, position: 'center', offset: { x: -0.245, y: -0.13 },
      transition: { in: 'fadeIn' },
    });
  }

  // Logo
  if (identity.logoUrl) clips.push(logoCorner(start, identity.logoUrl));

  return clips;
}

function buildRiskSlide(project: Project, rm: RiskSubModule, start: number) {
  const { identity, media } = project;
  const { colors } = identity;
  const imgUrl = media[rm.mediaId]?.url;
  const clips: unknown[] = [];
  const font = 'font-family:sans-serif;';

  clips.push(bgClip(start, colors.background));

  if (imgUrl) {
    clips.push(rightPanelImage(start, imgUrl));
    clips.push(leftPanelCover(start, colors.background));
    clips.push(accentDivider(start, colors.primary));
  }

  // Top accent bar
  clips.push({
    asset: { type: 'html', html: `<div style="width:940px;height:8px;background:${colors.primary}"></div>`, width: 940, height: 8 },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0.46 },
  });

  // Risk name
  clips.push({
    asset: {
      type: 'html',
      html: `<p style="${font}font-size:50px;font-weight:900;color:${colors.primary};text-align:left;max-width:860px;line-height:1.2">${rm.name}</p>`,
      width: 860, height: 140,
    },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0.3 },
    transition: { in: 'fadeIn' },
  });

  // Causes
  const causesHtml = rm.causes.map(c => `<li style="margin-bottom:5px">${c}</li>`).join('');
  clips.push({
    asset: {
      type: 'html',
      html: `<div style="${font}font-size:25px;color:${colors.text};max-width:860px"><span style="font-size:19px;font-weight:700;color:${colors.secondary};text-transform:uppercase;letter-spacing:2px">Causas</span><ul style="margin-top:8px;padding-left:20px;line-height:1.5">${causesHtml}</ul></div>`,
      width: 860, height: 320,
    },
    start, length: D, position: 'center', offset: { x: -0.245, y: 0.04 },
    transition: { in: 'fadeIn' },
  });

  // Measures
  if (rm.measures?.length) {
    const measuresHtml = rm.measures.map(m => `<li style="margin-bottom:5px">${m}</li>`).join('');
    clips.push({
      asset: {
        type: 'html',
        html: `<div style="${font}font-size:25px;color:${colors.text};max-width:860px"><span style="font-size:19px;font-weight:700;color:${colors.secondary};text-transform:uppercase;letter-spacing:2px">Medidas</span><ul style="margin-top:8px;padding-left:20px;line-height:1.5">${measuresHtml}</ul></div>`,
        width: 860, height: 260,
      },
      start, length: D, position: 'center', offset: { x: -0.245, y: -0.27 },
      transition: { in: 'fadeIn' },
    });
  }

  if (identity.logoUrl) clips.push(logoCorner(start, identity.logoUrl));
  return clips;
}

function buildGenericSlide(project: Project, slotId: string, start: number) {
  const { identity, media, slots } = project;
  const { colors } = identity;
  const slot = slots.find(s => s.id === slotId);
  if (!slot) return [];

  const clips: unknown[] = [];
  const font = 'font-family:sans-serif;';
  const title = (slot.fields.title as string) || slot.title;
  const body = (slot.fields.body ?? slot.fields.description ?? slot.fields.objectives) as string | undefined;
  // Map slot ID to its media key
  const mediaKey = slotId === 'SLOT_01' ? 'portada_img'
    : slotId === 'SLOT_02' ? 'objetivos_img'
    : `${slotId.toLowerCase()}_img`; // e.g. SLOT_03B → slot_03b_img
  const imgUrl = media[mediaKey]?.url ?? null;
  const hasImg = !!imgUrl && imgUrl.startsWith('http');

  clips.push(bgClip(start, colors.background));

  if (hasImg && imgUrl) {
    clips.push(rightPanelImage(start, imgUrl));
    clips.push(leftPanelCover(start, colors.background));
    clips.push(accentDivider(start, colors.primary));
  }

  const leftW = hasImg ? 860 : 1600;
  const leftX = hasImg ? -0.245 : 0;

  // Accent bar
  clips.push({
    asset: { type: 'html', html: `<div style="width:${hasImg ? 940 : 1800}px;height:8px;background:${colors.primary}"></div>`, width: hasImg ? 940 : 1800, height: 8 },
    start, length: D, position: 'center', offset: { x: leftX, y: 0.46 },
  });

  // Title
  clips.push({
    asset: {
      type: 'html',
      html: `<p style="${font}font-size:54px;font-weight:900;color:${colors.primary};text-align:left;line-height:1.2;max-width:${leftW}px">${title}</p>`,
      width: leftW, height: 160,
    },
    start, length: D, position: 'center', offset: { x: leftX, y: 0.28 },
    transition: { in: 'fadeIn' },
  });

  // Body
  if (body && body.trim()) {
    clips.push({
      asset: {
        type: 'html',
        html: `<p style="${font}font-size:29px;color:${colors.text};text-align:left;line-height:1.6;max-width:${leftW}px">${body}</p>`,
        width: leftW, height: 400,
      },
      start, length: D, position: 'center', offset: { x: leftX, y: -0.05 },
      transition: { in: 'fadeIn' },
    });
  }

  if (identity.logoUrl) clips.push(logoCorner(start, identity.logoUrl));
  return clips;
}

// ── Main timeline builder ──────────────────────────────────────────────────────

function buildTimeline(project: Project) {
  const { slots, voiceAudioUrl, identity } = project;
  const allClips: unknown[] = [];
  let offset = 0;

  for (const slot of slots.filter(s => s.active)) {
    if (slot.id === 'SLOT_01') {
      allClips.push(...buildPortadaSlide(project, offset));
      offset += D;
    } else if (slot.id === 'SLOT_08' && slot.riskModules) {
      for (const rm of slot.riskModules.filter(r => r.active)) {
        allClips.push(...buildRiskSlide(project, rm, offset));
        offset += D;
      }
    } else {
      allClips.push(...buildGenericSlide(project, slot.id, offset));
      offset += D;
    }
  }

  const timeline: Record<string, unknown> = {
    soundtrack: voiceAudioUrl ? { src: voiceAudioUrl, effect: 'fadeOut', volume: 1 } : undefined,
    background: identity.colors.background,
    tracks: [{ clips: allClips.filter(Boolean) }],
  };

  return { timeline, totalDuration: offset };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!SHOTSTACK_API_KEY) {
    return NextResponse.json({ error: 'SHOTSTACK_API_KEY no configurada en .env.local' }, { status: 500 });
  }

  let project: Project;
  try {
    project = (await req.json()).project as Project;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { timeline } = buildTimeline(project);

  const res = await fetch(`${SHOTSTACK_BASE}/render`, {
    method: 'POST',
    headers: { 'x-api-key': SHOTSTACK_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeline,
      output: { format: 'mp4', resolution: 'hd', aspectRatio: '16:9', fps: 25 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    return NextResponse.json({ error: `Shotstack error ${res.status}: ${errText}` }, { status: res.status });
  }

  const data = await res.json();
  const renderId: string = data.response?.id;
  if (!renderId) return NextResponse.json({ error: 'Shotstack no devolvió renderId' }, { status: 502 });

  return NextResponse.json({ renderId });
}
