'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCourseStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SlidePreview from '@/components/SlidePreview';
import {
  Video,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Play,
  Layers,
  Save,
  ExternalLink,
} from 'lucide-react';

interface RenderJobState {
  renderId: string | null;
  status: 'idle' | 'submitting' | 'rendering' | 'done' | 'failed';
  progress: number;
  url: string | null;
  errorMsg: string | null;
}

export default function GenerarVideoPage() {
  const {
    course,
    activeModuleId,
    setActiveModuleId,
    setModuleRenderStatus,
    setModuleRenderedUrl,
  } = useCourseStore();

  const currentModule =
    course.modules.find((m) => m.id === activeModuleId) || course.modules[0];

  const [job, setJob] = useState<RenderJobState>({
    renderId: null,
    status: currentModule.renderedVideoUrl ? 'done' : 'idle',
    progress: currentModule.renderedVideoUrl ? 100 : 0,
    url: currentModule.renderedVideoUrl || null,
    errorMsg: null,
  });

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync job state when changing active module
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setJob({
      renderId: null,
      status: currentModule.renderedVideoUrl ? 'done' : 'idle',
      progress: currentModule.renderedVideoUrl ? 100 : 0,
      url: currentModule.renderedVideoUrl || null,
      errorMsg: null,
    });
  }, [currentModule.id, currentModule.renderedVideoUrl]);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleStartRender = async () => {
    if (!currentModule || currentModule.slides.length === 0) return;

    setJob({
      renderId: null,
      status: 'submitting',
      progress: 5,
      url: null,
      errorMsg: null,
    });
    setModuleRenderStatus(currentModule.id, 'rendering', 5);

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: currentModule,
          identity: course.identity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar render');

      const renderId = data.renderId;
      setJob((prev) => ({
        ...prev,
        renderId,
        status: 'rendering',
        progress: 15,
      }));

      // Start Polling
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/render-status?id=${renderId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'done') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setJob({
              renderId,
              status: 'done',
              progress: 100,
              url: statusData.url,
              errorMsg: null,
            });
            setModuleRenderedUrl(currentModule.id, statusData.url);
          } else if (statusData.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setJob((prev) => ({
              ...prev,
              status: 'failed',
              errorMsg: statusData.error || 'Shotstack no pudo completar el render',
            }));
            setModuleRenderStatus(currentModule.id, 'failed');
          } else {
            setJob((prev) => ({
              ...prev,
              status: 'rendering',
              progress: statusData.progress || Math.min(90, prev.progress + 10),
            }));
            setModuleRenderStatus(currentModule.id, 'rendering', statusData.progress);
          }
        } catch {
          // Keep polling on transient network glitches
        }
      }, 4000);
    } catch (err) {
      setJob((prev) => ({
        ...prev,
        status: 'failed',
        errorMsg: err instanceof Error ? err.message : 'Error al enviar render a Shotstack',
      }));
      setModuleRenderStatus(currentModule.id, 'failed');
    }
  };

  const hasSlides = currentModule.slides.length > 0;
  const hasAudio = !!currentModule.voiceAudioUrl;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-primary" />
            Generación y Renderizado de Videos MP4
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Producción de video HD 1080p por módulo con Shotstack API listo para el LMS.
          </p>
        </div>

        {/* Module Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Módulo a producir:</span>
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
        {/* Left Col: Production Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                Checklist de Producción
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">{currentModule.title}</h2>
            </div>

            {/* Prerequisites */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Diapositivas listas</span>
                {hasSlides ? (
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {currentModule.slides.length} slides
                  </span>
                ) : (
                  <span className="font-bold text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Sin slides
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Locución ElevenLabs vinculada</span>
                {hasAudio ? (
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Audio listo
                  </span>
                ) : (
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Opcional (usa duración estándar)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Resolución de Salida</span>
                <span className="font-bold text-white">Full HD 1920×1080 (16:9 MP4)</span>
              </div>
            </div>

            {/* Render Trigger & Status */}
            <div className="space-y-4 pt-2">
              <Button
                onClick={handleStartRender}
                disabled={job.status === 'submitting' || job.status === 'rendering' || !hasSlides}
                className="w-full text-xs font-bold py-3 shadow-lg shadow-primary/20"
              >
                {job.status === 'submitting' || job.status === 'rendering' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Renderizando en Shotstack Cloud ({job.progress}%)...
                  </>
                ) : job.status === 'done' ? (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Regenerar Video MP4
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Renderizar Video MP4 del Módulo
                  </>
                )}
              </Button>

              {/* Progress bar during render */}
              {(job.status === 'submitting' || job.status === 'rendering') && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Shotstack está ensamblando clips HTML, audio y transiciones...
                  </p>
                </div>
              )}

              {/* Success output */}
              {job.status === 'done' && job.url && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Video Renderizado Exitosamente
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">1080p MP4</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Descargar MP4 para LMS
                    </a>

                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Abrir en pestaña nueva"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {job.status === 'failed' && job.errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{job.errorMsg}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Video Preview Component (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Previsualización del Módulo
              </span>
              <span className="text-[10px] text-teal-400 font-bold">
                {currentModule.slides.length} diapositivas en secuencia
              </span>
            </div>

            {currentModule.slides[0] ? (
              <SlidePreview
                slide={currentModule.slides[0]}
                identity={course.identity}
                index={0}
                totalSlides={currentModule.slides.length}
                mediaUrl={
                  currentModule.slides[0].mediaId &&
                  currentModule.media[currentModule.slides[0].mediaId]?.url
                    ? currentModule.media[currentModule.slides[0].mediaId].url
                    : currentModule.backgroundMediaId &&
                      currentModule.media[currentModule.backgroundMediaId]?.url
                    ? currentModule.media[currentModule.backgroundMediaId].url
                    : null
                }
              />
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                Sin diapositivas disponibles para previsualizar.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
