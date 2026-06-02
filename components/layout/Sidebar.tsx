'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { 
  Paintbrush, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Video, 
  RotateCcw, 
  LayoutDashboard
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { project, resetToDemo } = useProjectStore();

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Identidad Visual', href: '/identidad', icon: Paintbrush },
    { name: 'Contenido Textual', href: '/contenido', icon: FileText },
    { name: 'Imágenes y Videos', href: '/medios', icon: ImageIcon },
    { name: 'Voz en Off', href: '/voz', icon: Mic },
    { name: 'Generar Video', href: '/generar', icon: Video },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-slate-800 flex flex-col justify-between z-30">
      <div>
        {/* Logo Section — branding fijo de la plataforma SUAMA Hub (no cambia con el cliente) */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-suama.jpg"
              alt="SUAMA Hub"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">SUAMA Hub</h1>
            <p className="text-xs text-slate-400">Generador de Videos</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,153,139,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 shadow-sm h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Demo Reset */}
      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cliente Actual</div>
          <div className="text-sm font-semibold text-white truncate">{project.clientName}</div>
          <div className="text-xs text-slate-400 mt-1 truncate">{project.projectName}</div>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Estás seguro de que querés restablecer todos los cambios al Tutorial 01 Demo?')) {
              resetToDemo();
              alert('Datos restablecidos correctamente.');
            }
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Demo</span>
        </button>
      </div>
    </aside>
  );
}
