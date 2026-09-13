import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
