import { NextRequest, NextResponse } from 'next/server';
import { IKIGAI_COURSE } from '@/lib/course-data';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || 'ikigai_emprender';
  return NextResponse.json({ ok: true, course: IKIGAI_COURSE });
}
