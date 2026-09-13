import { NextRequest, NextResponse } from 'next/server';
import { CourseModule, CourseIdentity } from '@/lib/types';
import { buildModuleEdit } from '@/lib/shotstack-timeline';

export async function POST(req: NextRequest) {
  try {
    const { module, identity, audioDuration } = await req.json();
    const result = await buildModuleEdit(
      module as CourseModule,
      identity as CourseIdentity,
      audioDuration
    );
    return NextResponse.json({
      ok: true,
      edit: result.edit,
      totalDuration: result.totalDuration,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
