'use client';

import React from 'react';
import { useProjectStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import { User, Folder } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { project, setProjectName, setClientName } = useProjectStore();

  // Determine current section title and description
  let title = 'Dashboard';
  let description = 'Bienvenido a la administración de tu proyecto de video tutorial.';

  if (pathname === '/identidad') {
    title = 'Identidad Visual';
    description = 'Personalizá el logotipo, colores y tipografías para el cliente.';
  } else if (pathname === '/contenido') {
    title = 'Contenido Textual';
    description = 'Editá los textos del tutorial y activá o desactivá escenas.';
  } else if (pathname === '/medios') {
    title = 'Imágenes y Videos';
    description = 'Subí tus propios archivos o generá nuevo contenido con IA.';
  } else if (pathname === '/voz') {
    title = 'Voz en Off';
    description = 'Revisá el script completo y generá la voz en off con ElevenLabs.';
  } else if (pathname === '/generar') {
    title = 'Generar Video';
    description = 'Revisá la configuración y renderizá el video MP4 final.';
  }

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-20 relative">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      {/* Quick Settings: Client & Project Names */}
      <div className="flex items-center space-x-4">
        {/* Client Name Input */}
        <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-semibold leading-none uppercase">Cliente</span>
            <input
              type="text"
              value={project.clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="text-xs font-semibold text-white bg-transparent outline-none border-none p-0 mt-0.5 w-32 focus:w-48 transition-all duration-300"
              placeholder="Nombre del cliente"
            />
          </div>
        </div>

        {/* Project Name Input */}
        <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5">
          <Folder className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-semibold leading-none uppercase">Proyecto</span>
            <input
              type="text"
              value={project.projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-xs font-semibold text-white bg-transparent outline-none border-none p-0 mt-0.5 w-36 focus:w-56 transition-all duration-300"
              placeholder="Nombre del proyecto"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
