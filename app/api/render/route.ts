import { NextRequest, NextResponse } from 'next/server';
import { CourseModule, CourseIdentity } from '@/lib/types';
import { buildModuleEdit, collectInvalidAssetUrls } from '@/lib/shotstack-timeline';

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV ?? 'stage';
const SHOTSTACK_BASE = `https://api.shotstack.io/${SHOTSTACK_ENV}`;

export async function POST(req: NextRequest) {
  if (!SHOTSTACK_API_KEY) {
    return NextResponse.json(
      { error: 'SHOTSTACK_API_KEY no configurada en .env.local' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  let edit = body.timeline ? { timeline: body.timeline, output: { format: 'mp4', resolution: '1080' } } : null;

  if (!edit && body.module && body.identity) {
    try {
      const result = await buildModuleEdit(
        body.module as CourseModule,
        body.identity as CourseIdentity,
        body.audioDuration
      );
      edit = result.edit;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[render] buildModuleEdit falló:', msg);
      return NextResponse.json({ error: `Fallo al construir timeline: ${msg}` }, { status: 500 });
    }
  }

  if (!edit) {
    return NextResponse.json(
      { error: 'Se requiere "module" e "identity" o un "timeline" directo' },
      { status: 400 }
    );
  }

  const badSrcs = collectInvalidAssetUrls(edit.timeline);
  if (badSrcs.length > 0) {
    return NextResponse.json(
      { error: `URLs de asset inválidas (deben ser http/https): ${badSrcs.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${SHOTSTACK_BASE}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': SHOTSTACK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(edit),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown error');
      console.error(`[render] Shotstack error ${res.status}:`, errText);
      return NextResponse.json(
        { error: `Shotstack error ${res.status}: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const renderId = data.response?.id;

    if (!renderId) {
      return NextResponse.json({ error: 'Shotstack no devolvió renderId' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, renderId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `No se pudo conectar con Shotstack: ${msg}` }, { status: 502 });
  }
}
