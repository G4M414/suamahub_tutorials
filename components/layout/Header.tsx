'use client';

import React from 'react';
import { useCourseStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import { GraduationCap, Sparkles } from 'lucide-react';
import { COURSE_CATALOG } from '@/lib/constants';

export default function Header() {
  const pathname = usePathname();
  const { course, loadCourse } = useCourseStore();

  let title = 'Dashboard de Producción';
  let description = 'Visión general del curso y estado de producción de cada módulo.';

  if (pathname === '/identidad') {
    title = 'Identidad Visual';
    description = 'Configuración de logotipo, paleta institucional y tipografías aplicadas a los slides.';
  } else if (pathname === '/modulos' || pathname === '/contenido') {
    title = 'Módulos y Contenido';
    description = 'Editor integral de guiones narrativos, diapositivas de video, materiales descargables y actividades.';
  } else if (pathname === '/medios') {
    title = 'Imágenes y Videos';
    description = 'Gestión de fondos multimedia por módulo y diapositiva (Drive, subida o IA).';
  } else if (pathname === '/voz') {
    title = 'Voz en Off';
    description = 'Generación de locución con ElevenLabs para cada módulo del curso.';
  } else if (pathname === '/generar') {
    title = 'Generación de Video MP4';
    description = 'Renderizado timeline por módulo con Shotstack y descarga lista para LMS.';
  } else if (pathname === '/evaluacion') {
    title = 'Evaluación y Examen LMS';
    description = 'Configuración del examen final y exportador a formatos compatibles con LMS (GIFT/Moodle).';
  } else if (pathname === '/materiales') {
    title = 'Materiales Imprimibles';
    description = 'Guías y plantillas del alumno con diseño editorial SUAMA (@media print).';
  }

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-8 z-20 sticky top-0">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      {/* Selector de Curso Activo */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 shadow-inner">
          <GraduationCap className="w-4 h-4 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] text-teal-400 font-bold leading-none uppercase tracking-wider">
              Curso Seleccionado
            </span>
            <select
              value={course.slug}
              onChange={(e) => loadCourse(e.target.value)}
              className="text-xs font-bold text-white bg-transparent outline-none border-none p-0 mt-0.5 cursor-pointer"
            >
              {COURSE_CATALOG.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SUAMA Engine v2</span>
        </div>
      </div>
    </header>
  );
}
