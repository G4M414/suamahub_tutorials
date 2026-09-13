'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCourseStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BookOpen,
  Paintbrush,
  Image as ImageIcon,
  Mic,
  Video,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Layers,
  Save,
  Download,
  Loader2,
  GraduationCap,
  FileText,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const { course, setActiveModuleId, toggleModule } = useCourseStore();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSaveToNotion = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, estado: 'Borrador' }),
      });
      const data = await res.json();
      setSaveMsg(data.ok ? '✓ Guardado en Notion correctamente' : `Error: ${data.error || 'Fallo de sync'}`);
    } catch {
      setSaveMsg('Error al conectar con el servidor');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  const totalModules = course.modules.length;
  const activeModules = course.modules.filter((m) => m.active).length;
  const totalSlides = course.modules.reduce((acc, m) => acc + (m.active ? m.slides.length : 0), 0);
  const audioReadyCount = course.modules.filter((m) => m.active && m.voiceAudioUrl).length;
  const videoReadyCount = course.modules.filter((m) => m.active && m.renderedVideoUrl).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner: Course Overview */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-2xl">
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundColor: course.identity.colors.primary }}
        />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                {course.level}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                {course.estimatedDuration}
              </span>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              {course.courseName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              onClick={handleSaveToNotion}
              disabled={saving}
              variant="outline"
              className="bg-slate-800/80 border-slate-700 text-xs font-bold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 text-primary" />
                  Guardar en Notion
                </>
              )}
            </Button>

            <Link href="/modulos">
              <Button className="w-full sm:w-auto text-xs font-bold shadow-lg shadow-primary/20">
                <BookOpen className="w-4 h-4 mr-2" />
                Abrir Editor
              </Button>
            </Link>
          </div>
        </div>

        {saveMsg && (
          <div className="mt-4 p-3 rounded-xl bg-slate-800/90 border border-primary/30 text-xs text-teal-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Módulos Activos</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {activeModules} <span className="text-xs font-normal text-slate-400">/ {totalModules}</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Slides</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalSlides}</div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voces Generadas</span>
            <Mic className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {audioReadyCount} <span className="text-xs font-normal text-slate-400">/ {activeModules}</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Videos Renderizados</span>
            <Video className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {videoReadyCount} <span className="text-xs font-normal text-slate-400">/ {activeModules}</span>
          </div>
        </Card>
      </div>

      {/* Modules Production Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Estructura y Módulos del Curso</h2>
            <p className="text-xs text-slate-400">Seguimiento individual de producción de cada pieza pedagógica</p>
          </div>
          <span className="text-xs font-bold text-teal-400">
            {Math.round((videoReadyCount / Math.max(1, activeModules)) * 100)}% Completado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {course.modules.map((module, idx) => {
            const isAudioReady = !!module.voiceAudioUrl;
            const isVideoReady = !!module.renderedVideoUrl;

            return (
              <Card
                key={module.id}
                className={`p-6 border transition-all duration-300 flex flex-col justify-between ${
                  module.active
                    ? 'border-slate-800 bg-slate-900/60 hover:border-primary/50 shadow-lg'
                    : 'border-slate-800/40 bg-slate-950/40 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
                      {module.type === 'intro' ? 'Introducción' : module.type === 'closing' ? 'Cierre' : `Módulo ${idx}`}
                    </span>
                    <button
                      onClick={() => toggleModule(module.id, !module.active)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                        module.active
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {module.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{module.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {module.objective || module.videoScript.slice(0, 100) + '...'}
                    </p>
                  </div>

                  {/* Status checklist */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        Slides
                      </span>
                      <span className="font-bold text-white">{module.slides.length}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-teal-400" />
                        Voz en Off
                      </span>
                      {isAudioReady ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Listo
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        Video MP4
                      </span>
                      {isVideoReady ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Renderizado
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">Sin renderizar</span>
                      )}
                    </div>

                    {module.downloadableMaterials.length > 0 && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          Guías Alumno
                        </span>
                        <span className="font-bold text-white">{module.downloadableMaterials.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2">
                  <Link
                    href="/modulos"
                    onClick={() => setActiveModuleId(module.id)}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full text-xs font-bold bg-slate-800/50 hover:bg-slate-800 border-slate-700"
                    >
                      Editar Contenido
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-primary" />
                    </Button>
                  </Link>

                  <Link
                    href="/generar"
                    onClick={() => setActiveModuleId(module.id)}
                  >
                    <Button
                      variant="ghost"
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                      title="Generar MP4"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Exam & Identity Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exam Quick Access */}
        <Card className="p-6 border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <CheckSquare className="w-5 h-5" />
              <h3 className="font-black text-base text-white">Evaluación Final y LMS</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Examen formal de {course.exam.questions.length} preguntas de opción múltiple. Configurado para aprobación con {course.exam.passingScore} respuestas correctas.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
              <span className="font-bold text-teal-400">Exportación LMS:</span> Formato GIFT (Moodle), Canvas y texto estructurado con 1 clic.
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <Link href="/evaluacion">
              <Button variant="outline" className="w-full text-xs font-bold border-slate-700">
                Gestionar Examen y Exportar a LMS
              </Button>
            </Link>
          </div>
        </Card>

        {/* Brand & Materials Quick Access */}
        <Card className="p-6 border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <FileText className="w-5 h-5" />
              <h3 className="font-black text-base text-white">Materiales Imprimibles (@media print)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guías de trabajo para el alumno con diseño editorial SUAMA (Guía de Autoconocimiento, Caso Lucas, Mapa de Oportunidades, Guía de Validación y Brújula Emprendedora).
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: course.identity.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: course.identity.colors.secondary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: course.identity.colors.accent }}
              />
              <span className="text-xs font-medium text-slate-400 ml-2">
                Tipografía: <strong className="text-white capitalize">{course.identity.fontFamily}</strong>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <Link href="/materiales">
              <Button variant="outline" className="w-full text-xs font-bold border-slate-700">
                Ver y Descargar Guías en PDF
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
