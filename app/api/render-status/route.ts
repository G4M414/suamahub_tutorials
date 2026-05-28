import { NextRequest, NextResponse } from 'next/server';

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV ?? 'stage';
const SHOTSTACK_BASE = `https://api.shotstack.io/${SHOTSTACK_ENV}`;

// Maps Shotstack status strings to our internal representation
const STATUS_MAP: Record<string, 'pending' | 'rendering' | 'done' | 'failed'> = {
  queued: 'pending',
  fetching: 'rendering',
  rendering: 'rendering',
  saving: 'rendering',
  done: 'done',
  failed: 'failed',
};

export async function GET(req: NextRequest) {
  if (!SHOTSTACK_API_KEY) {
    return NextResponse.json(
      { error: 'SHOTSTACK_API_KEY no configurada' },
      { status: 500 }
    );
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Se requiere el parámetro "id"' }, { status: 400 });
  }

  const res = await fetch(`${SHOTSTACK_BASE}/render/${id}`, {
    headers: { 'x-api-key': SHOTSTACK_API_KEY },
    // No-cache: always get fresh status from Shotstack
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    return NextResponse.json(
      { error: `Shotstack status error ${res.status}: ${errText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  const response = data.response;

  const rawStatus: string = response?.status ?? 'unknown';
  const status = STATUS_MAP[rawStatus] ?? 'rendering';
  const progress: number = response?.data?.progress ?? estimateProgress(rawStatus);
  const url: string | null = response?.url ?? null;
  const error: string | null = response?.error ?? null;

  return NextResponse.json({ status, progress, url, error, raw: rawStatus });
}

function estimateProgress(status: string): number {
  switch (status) {
    case 'queued':   return 5;
    case 'fetching': return 20;
    case 'rendering': return 60;
    case 'saving':   return 90;
    case 'done':     return 100;
    default:         return 0;
  }
}
