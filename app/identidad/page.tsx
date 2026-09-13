'use client';

import React from 'react';
import { useCourseStore } from '@/lib/store';
import { AVAILABLE_FONTS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ColorPicker from '@/components/ui/ColorPicker';
import SlidePreview from '@/components/SlidePreview';
import { Paintbrush, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';

export default function IdentidadVisual() {
  const { course, updateIdentity } = useCourseStore();
  const identity = course.identity;

  const previewSlide = course.modules[0]?.slides[0] || {
    id: 'preview_cover',
    title: course.courseName,
    content: course.description,
    bulletPoints: ['Descubrí lo que te mueve.', 'Reconocé lo que podés aportar.', 'Encontrá dónde generar valor.'],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Paintbrush className="w-6 h-6 text-primary" />
          Identidad Visual del Curso
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Personalizá la marca institucional, la paleta de colores y la tipografía aplicada a todos los videos y materiales imprimibles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Brand Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
              Datos de Marca
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Nombre de Marca / Institución</label>
              <Input
                value={identity.brandName}
                onChange={(e) => updateIdentity({ brandName: e.target.value })}
                placeholder="Ej: SUAMA HUB"
                className="bg-slate-950 border-slate-800 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Bajada / Tagline Institucional</label>
              <Input
                value={identity.brandTagline || ''}
                onChange={(e) => updateIdentity({ brandTagline: e.target.value })}
                placeholder="Ej: FORMACIÓN · SERVICIOS · DATOS"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Sitio Web / URL</label>
              <Input
                value={identity.websiteUrl || ''}
                onChange={(e) => updateIdentity({ websiteUrl: e.target.value })}
                placeholder="Ej: www.suamahub.com"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">URL del Logotipo (PNG / SVG o Drive)</label>
              <Input
                value={identity.logoUrl || ''}
                onChange={(e) => updateIdentity({ logoUrl: e.target.value || null })}
                placeholder="https://... o /logo-suama.jpg"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Tipografía de los Slides</label>
              <select
                value={identity.fontFamily}
                onChange={(e) => updateIdentity({ fontFamily: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-primary"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Color Palette */}
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
              Paleta de Colores
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Color Primario"
                color={identity.colors.primary}
                onChange={(c) => updateIdentity({ colors: { ...identity.colors, primary: c } })}
              />

              <ColorPicker
                label="Color Secundario"
                color={identity.colors.secondary}
                onChange={(c) => updateIdentity({ colors: { ...identity.colors, secondary: c } })}
              />

              <ColorPicker
                label="Color de Acento"
                color={identity.colors.accent}
                onChange={(c) => updateIdentity({ colors: { ...identity.colors, accent: c } })}
              />

              <ColorPicker
                label="Fondo de Slides"
                color={identity.colors.background}
                onChange={(c) => updateIdentity({ colors: { ...identity.colors, background: c } })}
              />

              <div className="col-span-2">
                <ColorPicker
                  label="Color de Texto"
                  color={identity.colors.text}
                  onChange={(c) => updateIdentity({ colors: { ...identity.colors, text: c } })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Preview of Cover (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" />
              Vista Previa en Tiempo Real
            </span>
            <span className="text-xs text-teal-400 font-bold">Resolución 1920×1080 (16:9)</span>
          </div>

          <div className="sticky top-28 space-y-4">
            <SlidePreview
              slide={previewSlide}
              identity={identity}
              index={0}
              totalSlides={course.modules[0]?.slides.length || 1}
            />

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Los cambios aplicados se reflejan inmediatamente en todos los videos generados con Shotstack.</span>
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
