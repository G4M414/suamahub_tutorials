import { NextRequest, NextResponse } from 'next/server';
import { Course, CourseModule } from '@/lib/types';
import { nfetch } from '@/lib/notion-fetch';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const CURSOS_DB = process.env.NOTION_CURSOS_DB_ID || process.env.NOTION_PROYECTOS_DB_ID;
const MODULOS_DB = process.env.NOTION_MODULOS_DB_ID;
const NOTION_BASE = 'https://api.notion.com/v1';

const h = {
  Authorization: `Bearer ${NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export async function POST(req: NextRequest) {
  if (!NOTION_API_KEY) {
    return NextResponse.json({ error: 'NOTION_API_KEY no configurada' }, { status: 500 });
  }

  let course: Course;
  let estado = 'Borrador';

  try {
    const body = await req.json();
    course = (body.course || body.project) as Course;
    if (body.estado) estado = body.estado;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  if (!course) {
    return NextResponse.json({ error: 'Se requiere el objeto course' }, { status: 400 });
  }

  try {
    // Si no hay DB configurada, retornamos éxito en mock/local
    if (!CURSOS_DB) {
      return NextResponse.json({ ok: true, message: 'Simulación de sync exitosa (sin DB ID configurado)' });
    }

    // Buscamos si ya existe una página con este nombre/slug
    const searchRes = await nfetch(`${NOTION_BASE}/databases/${CURSOS_DB}/query`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        filter: {
          property: 'Nombre del curso',
          title: { equals: course.courseName },
        },
      }),
    });

    const searchData = await searchRes.json();
    const existingCourseId = searchData.results?.[0]?.id;

    const properties: Record<string, any> = {
      'Nombre del curso': { title: [{ text: { content: course.courseName } }] },
    };

    if (existingCourseId) {
      await nfetch(`${NOTION_BASE}/pages/${existingCourseId}`, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({ properties }),
      });
      return NextResponse.json({ ok: true, courseId: existingCourseId });
    } else {
      const createRes = await nfetch(`${NOTION_BASE}/pages`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({
          parent: { database_id: CURSOS_DB },
          properties,
        }),
      });
      const createData = await createRes.json();
      return NextResponse.json({ ok: true, courseId: createData.id });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Notion Sync Error]', msg);
    return NextResponse.json({ ok: true, warning: msg });
  }
}
