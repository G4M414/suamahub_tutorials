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

  const { edit } = await buildEdit(project);

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

  const res = await fetch(`${SHOTSTACK_BASE}/render`, {
    method: 'POST',
    headers: { 'x-api-key': SHOTSTACK_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(edit),
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
