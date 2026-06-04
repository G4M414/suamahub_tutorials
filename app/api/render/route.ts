import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';
import { buildEdit, collectInvalidAssetUrls } from '@/lib/shotstack-timeline';

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV ?? 'stage';
const SHOTSTACK_BASE = `https://api.shotstack.io/${SHOTSTACK_ENV}`;

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

  let edit;
  try {
    ({ edit } = await buildEdit(project));
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e);
    console.error('[render] buildEdit lanzó excepción:', msg);
    return NextResponse.json({ error: `Fallo al construir el timeline: ${msg}` }, { status: 500 });
  }

  // Diagnóstico: si algún asset src no es http(s), avisamos cuál exactamente
  // (en vez del mensaje genérico de Shotstack "Only http:// URLs are allowed").
  const badSrcs = collectInvalidAssetUrls(edit.timeline);
  if (badSrcs.length) {
    console.error('[render] URLs de asset inválidas (no http):', badSrcs);
    return NextResponse.json(
      { error: `URLs de asset inválidas (deben ser http/https): ${badSrcs.join(' | ')}` },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(`${SHOTSTACK_BASE}/render`, {
      method: 'POST',
      headers: { 'x-api-key': SHOTSTACK_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[render] fetch a Shotstack falló:', msg);
    return NextResponse.json({ error: `No se pudo contactar a Shotstack: ${msg}` }, { status: 502 });
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    console.error(`[render] Shotstack ${res.status}:`, errText);
    return NextResponse.json({ error: `Shotstack error ${res.status}: ${errText}` }, { status: res.status });
  }

  const data = await res.json();
  const renderId: string = data.response?.id;
  if (!renderId) return NextResponse.json({ error: 'Shotstack no devolvió renderId' }, { status: 502 });

  return NextResponse.json({ renderId });
}
