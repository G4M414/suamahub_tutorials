import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/lib/types';
import { buildSlidesPreview } from '@/lib/shotstack-timeline';

// Devuelve un HTML de cuadro completo por slide para previsualizar el video en el
// navegador SIN renderizar (sin gastar créditos). Mismo layout que el MP4 final.
export async function POST(req: NextRequest) {
  let project: Project;
  try {
    project = (await req.json()).project as Project;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const slides = buildSlidesPreview(project);
  return NextResponse.json({ slides });
}
