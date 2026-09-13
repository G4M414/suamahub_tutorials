import { NextRequest, NextResponse } from 'next/server';
import { CourseModule, CourseIdentity } from '@/lib/types';
import { renderSlideHtml } from '@/lib/shotstack-timeline';

export async function POST(req: NextRequest) {
  try {
    const { module, identity } = await req.json();
    const slides = (module as CourseModule)?.slides || [];
    const htmlSlides = slides.map((s, idx) =>
      renderSlideHtml(s, identity as CourseIdentity, idx, slides.length)
    );
    return NextResponse.json({ ok: true, slides: htmlSlides });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
