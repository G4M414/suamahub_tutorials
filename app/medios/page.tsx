'use client';

import React, { useState } from 'react';
import { useCourseStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Image as ImageIcon,
  Sparkles,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';

function drivePreviewUrl(url: string | null): string | null {
  if (!url || url.startsWith('blob:') || url.startsWith('/') || !url.includes('drive.google')) return url;
  const matchUc = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const matchView = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const fileId = matchUc?.[1] ?? matchView?.[1];
  return fileId ? `/api/drive/proxy?id=${fileId}` : url;
}

export default function MediosPage() {
  const { course, activeModuleId, setActiveModuleId, updateMedia } = useCourseStore();

  const currentModule =
    course.modules.find((m) => m.id === activeModuleId) || course.modules[0];

  const [promptText, setPromptText] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerateAi = async (placeholderId: string) => {
    if (!promptText.trim()) return;
    setGenerating(placeholderId);
    setGenError(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText.trim(),
          clientName: course.identity.brandName || 'SUAMA',
          placeholderId: `${currentModule.id}_${placeholderId}`,
          aspectRatio: '16:9',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fallo de generación');

      updateMedia(currentModule.id, placeholderId, {
        url: data.url,
        aiPrompt: promptText.trim(),
        source: 'ai',
        generationStatus: 'success',
      });
      setPromptText('');
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Error al generar imagen');
    } finally {
      setGenerating(null);
    }
  };

  const bgMedia = currentModule.media['bg_module'] || {
    id: `${currentModule.id}_bg_module`,
    placeholderId: 'bg_module',
    type: 'image',
    source: 'upload',
    url: null,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-primary" />
            Gestión de Medios Visuales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asigná imágenes o videos de fondo por módulo o para diapositivas específicas.
          </p>
        </div>

        {/* Module Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Módulo actual:</span>
          <select
            value={currentModule.id}
            onChange={(e) => setActiveModuleId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-primary cursor-pointer"
          >
            {course.modules.map((m, idx) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.type === 'intro' ? 'Intro: ' : m.type === 'closing' ? 'Cierre: ' : `Módulo ${idx}: `}
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Background Media item for current module (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                Visual Principal del Módulo
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">
                Fondo / Ilustración para {currentModule.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Esta imagen se mostrará en el panel derecho de los slides del módulo que no tengan un asset individual.
              </p>
            </div>

            {/* Input URL Directa / Google Drive */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-primary" />
                URL de Imagen o Enlace de Google Drive
              </label>
              <Input
                value={bgMedia.url || ''}
                onChange={(e) =>
                  updateMedia(currentModule.id, 'bg_module', {
                    url: e.target.value || null,
                    source: 'drive',
                  })
                }
                placeholder="https://drive.google.com/... o URL directa"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            {/* AI Generator Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Generar imagen con IA (Gemini Imagen)
                </span>
                <span className="text-[10px] text-teal-400 font-semibold">16:9 HD</span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ej: Emprendedor joven en escritorio minimalista con mapa y cuaderno..."
                  className="text-xs bg-slate-900 border-slate-700"
                />
                <Button
                  onClick={() => handleGenerateAi('bg_module')}
                  disabled={generating === 'bg_module' || !promptText.trim()}
                  className="text-xs font-bold shrink-0"
                >
                  {generating === 'bg_module' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Generar'
                  )}
                </Button>
              </div>

              {genError && (
                <p className="text-[11px] text-red-400 font-semibold">{genError}</p>
              )}
            </div>

            {bgMedia.url && (
              <div className="flex justify-end">
                <button
                  onClick={() => updateMedia(currentModule.id, 'bg_module', { url: null })}
                  className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Quitar imagen
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Visual Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Vista Previa del Visual
            </h3>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative shadow-inner">
              {bgMedia.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={drivePreviewUrl(bgMedia.url) || ''}
                  alt="Visual del módulo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto opacity-30 text-primary" />
                  <p className="text-xs">Sin imagen personalizada asignada.</p>
                  <p className="text-[10px] text-slate-600">
                    El video usará el fondo geométrico SUAMA por defecto.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
