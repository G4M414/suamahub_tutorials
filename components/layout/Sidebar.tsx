'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCourseStore } from '@/lib/store';
import {
  Paintbrush,
  BookOpen,
  Image as ImageIcon,
  Mic,
  Video,
  RotateCcw,
  LayoutDashboard,
  FileText,
  CheckSquare,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { course, resetToDefault } = useCourseStore();

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Identidad Visual', href: '/identidad', icon: Paintbrush },
    { name: 'Módulos y Contenido', href: '/modulos', icon: BookOpen },
    { name: 'Imágenes y Videos', href: '/medios', icon: ImageIcon },
    { name: 'Voz en Off', href: '/voz', icon: Mic },
    { name: 'Generar Videos', href: '/generar', icon: Video },
    { name: 'Evaluación', href: '/evaluacion', icon: CheckSquare },
    { name: 'Materiales Imprimibles', href: '/materiales', icon: FileText },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-slate-800 flex flex-col justify-between z-30 bg-slate-950/80 backdrop-blur-xl">
      <div>
        {/* Logo Section */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 shadow-lg shadow-primary/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-suama.jpg"
              alt="SUAMA HUB"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight tracking-tight">SUAMA HUB</h1>
            <p className="text-[11px] text-teal-400 font-medium">E-Learning Studio</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/modulos' && pathname === '/contenido');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,153,139,0.15)] font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Reset */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Curso Activo</div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{course.courseName}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{course.modules.length} módulos</span>
            <span>{course.estimatedDuration}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (
              confirm(
                '¿Estás seguro de que querés restablecer todos los cambios al estado por defecto del Curso IKIGAI?'
              )
            ) {
              resetToDefault();
              alert('Datos del curso restablecidos correctamente.');
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Piloto</span>
        </button>
      </div>
    </aside>
  );
}
