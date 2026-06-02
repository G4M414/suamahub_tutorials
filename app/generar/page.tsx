'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileVideo,
  Download,
  Loader2,
  RefreshCcw,
  Clapperboard,
  Monitor,
  Mic,
  Image as ImageIcon,
  Paintbrush,
  Layers,
  ExternalLink,
  Info,
} from 'lucide-react';

type RenderStep = 'idle' | 'submitting' | 'rendering' | 'success' | 'error';

interface RenderJob {
  renderId: string | null;
  step: RenderStep;
  progress: number;
  url: string | null;
  errorMsg: string | null;
}

export default function GenerarMP4() {
  const { project, setRenderStatus } = useProjectStore();

  const [job, setJob] = useState<RenderJob>({
    renderId: null,
    step: 'idle',
    progress: 0,
    url: null,
    errorMsg: null,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Computed checklist ──────────────────────────────────────────────
  const slot08 = project.slots.find(s => s.id === 'SLOT_08');
  const activeSlots = project.slots.filter(s => s.active);
  const activeRiskModules = slot08?.active ? (slot08.riskModules?.filter(rm => rm.active) ?? []) : [];

  const requiredMediaIds: string[] = [];
  if (project.slots.find(s => s.id === 'SLOT_01')?.active) requiredMediaIds.push('portada_img');
  activeRiskModules.forEach(rm => requiredMediaIds.push(rm.mediaId));

  const totalMedia = requiredMediaIds.length;
  const uploadedMedia = requiredMediaIds.filter(id => project.media[id]?.url != null).length;

  const activeSlotIds = activeSlots.map(s => s.id);
  const voiceScriptsFilled = activeSlotIds.reduce((acc, id) => {
    if (id === 'SLOT_08') {
      return acc + activeRiskModules.filter(rm => project.voiceScript[rm.id]?.trim()).length;
    }
    return acc + (project.voiceScript[id]?.trim() ? 1 : 0);
  }, 0);
  const totalVoice = activeSlotIds.includes('SLOT_08')
    ? activeSlotIds.length - 1 + activeRiskModules.length
    : activeSlotIds.length;

  const checks = {
    identity: !!project.identity.logoUrl,
    slots: activeSlots.length > 0,
    media: totalMedia === 0 || uploadedMedia === totalMedia,
    voice: totalVoice === 0 || voiceScriptsFilled === totalVoice,
    voiceAudio: Object.keys(project.voiceAudioUrls ?? {}).length > 0,
  };

  const allReady = Object.values(checks).every(Boolean);

  // ── Poll render status ───────────────────────────────────────────────
  const startPolling = (renderId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/render-status?id=${renderId}`);
        if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
        const data = await res.json();

        if (data.status === 'done') {
          clearInterval(pollRef.current!);
          setJob(prev => ({ ...prev, step: 'success', progress: 100, url: data.url }));
          setRenderStatus('success', 100);
          // Sync automático con Notion — fire and forget
          const tutorialName = project.tutorialId === 'tutorial_01'
            ? 'Tutorial 01 — Riesgos Hoteles'
            : 'Tutorial 02 — Incendios';
          // 1) Página legible en Notion (assets como links + link al MP4)
          fetch('/api/notion/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project, mp4Url: data.url, tutorialName }),
          }).catch(err => console.error('Notion sync error:', err));
          // 2) Estado completo restaurable (Notion como BBDD) — auto-guardado
          fetch('/api/notion/save-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project }),
          }).catch(err => console.error('Notion save-project error:', err));
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current!);
          setJob(prev => ({ ...prev, step: 'error', errorMsg: data.error ?? 'Render fallido en Shotstack.' }));
          setRenderStatus('failed', 0);
        } else {
          const pct = Math.min(data.progress ?? 0, 99);
          setJob(prev => ({ ...prev, progress: pct }));
          setRenderStatus('rendering', pct);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 4000);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── Submit render ────────────────────────────────────────────────────
  const handleRender = async () => {
    if (!allReady) return;

    setJob({ renderId: null, step: 'submitting', progress: 0, url: null, errorMsg: null });
    setRenderStatus('rendering', 0);

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const { renderId } = await res.json();
      setJob(prev => ({ ...prev, renderId, step: 'rendering', progress: 5 }));
      startPolling(renderId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setJob(prev => ({ ...prev, step: 'error', errorMsg: msg }));
      setRenderStatus('failed', 0);
    }
  };

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setJob({ renderId: null, step: 'idle', progress: 0, url: null, errorMsg: null });
    setRenderStatus('idle', 0);
  };

  // ── Checklist item component ─────────────────────────────────────────
  const CheckItem = ({
    ok,
    label,
    detail,
    icon: Icon,
    href,
  }: {
    ok: boolean;
    label: string;
    detail: string;
    icon: React.ElementType;
    href?: string;
  }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
      ok ? 'border-primary/20 bg-primary/5' : 'border-amber-500/20 bg-amber-500/5'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        ok ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-400'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${ok ? 'text-white' : 'text-slate-300'}`}>{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!ok && href && (
          <a href={href} className="text-[10px] text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors">
            Completar
          </a>
        )}
        {ok ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-500" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Módulo 5</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Generar MP4</h1>
        <p className="text-sm text-slate-400">
          Verificá que todo esté listo y lanzá el render en Shotstack API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Checklist — 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-primary" />
                Pre-vuelo del Render
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                allReady
                  ? 'text-primary border-primary/30 bg-primary/10'
                  : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
              }`}>
                {Object.values(checks).filter(Boolean).length} / {Object.values(checks).length} OK
              </span>
            </div>

            <div className="space-y-3">
              <CheckItem
                ok={checks.identity}
                label="Identidad Visual"
                detail="Logo del cliente cargado + paleta de colores configurada"
                icon={Paintbrush}
                href="/identidad"
              />
              <CheckItem
                ok={checks.slots}
                label={`Escenas activas (${activeSlots.length} escenas)`}
                detail="Al menos una escena habilitada en el contenido del tutorial"
                icon={Layers}
                href="/contenido"
              />
              <CheckItem
                ok={checks.media}
                label={`Medios visuales (${uploadedMedia}/${totalMedia})`}
                detail="Todas las imágenes y videos requeridos por las escenas activas"
                icon={ImageIcon}
                href="/medios"
              />
              <CheckItem
                ok={checks.voice}
                label={`Guiones de voz (${voiceScriptsFilled}/${totalVoice})`}
                detail="Guion de locución completado para cada escena activa"
                icon={Mic}
                href="/voz"
              />
              <CheckItem
                ok={checks.voiceAudio}
                label="Audio de voz en off generado"
                detail="Audio MP3 completo generado desde ElevenLabs y guardado"
                icon={Monitor}
                href="/voz"
              />
            </div>
          </Card>

          {/* Video spec info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-300">Especificaciones del video final</p>
              <p>
                Formato: <strong className="text-white">MP4</strong> · Resolución:{' '}
                <strong className="text-white">1920×1080 px (Full HD)</strong> · Relación:{' '}
                <strong className="text-white">16:9</strong> · Render: <strong className="text-white">Shotstack API</strong>
              </p>
              <p className="pt-1">
                Configurá <code className="bg-slate-800 px-1 rounded">SHOTSTACK_API_KEY</code> en{' '}
                <code className="bg-slate-800 px-1 rounded">.env.local</code> antes de renderizar.
              </p>
            </div>
          </div>
        </div>

        {/* Render Panel — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project summary */}
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Resumen del Proyecto</h2>
            <div className="space-y-3">
              {[
                { label: 'Cliente', value: project.clientName },
                { label: 'Proyecto', value: project.projectName },
                { label: 'Tutorial', value: project.tutorialId === 'tutorial_01' ? 'Riesgos Laborales' : 'Incendios y Evacuación' },
                { label: 'Escenas', value: `${activeSlots.length} activas` },
                { label: 'Módulos de riesgo', value: `${activeRiskModules.length} activos` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-baseline gap-2">
                  <span className="text-xs text-slate-500 shrink-0">{label}</span>
                  <span className="text-xs font-semibold text-white text-right truncate">{value || '—'}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Render action */}
          <Card className="space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-primary" />
              Render Shotstack
            </h2>

            {/* Idle / ready */}
            {job.step === 'idle' && (
              <div className="space-y-4">
                {!allReady && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Completá todos los ítems del pre-vuelo antes de renderizar.</span>
                  </div>
                )}
                <Button
                  onClick={handleRender}
                  disabled={!allReady}
                  variant="primary"
                  className="w-full py-3 text-base font-bold"
                  icon={<Clapperboard className="w-5 h-5" />}
                >
                  Generar MP4
                </Button>
              </div>
            )}

            {/* Submitting */}
            {job.step === 'submitting' && (
              <div className="space-y-3 text-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-slate-300 font-medium">Enviando proyecto a Shotstack…</p>
              </div>
            )}

            {/* Rendering with progress */}
            {job.step === 'rendering' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Renderizando video…</span>
                  <span className="font-bold text-primary">{job.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Esto puede tardar 2–5 minutos. No cierres la ventana.
                </p>
                {job.renderId && (
                  <p className="text-[10px] text-slate-600 text-center font-mono">
                    ID: {job.renderId}
                  </p>
                )}
              </div>
            )}

            {/* Success */}
            {job.step === 'success' && job.url && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-base font-bold text-white">¡Video generado!</p>
                  <p className="text-xs text-slate-400 text-center">
                    Tu video MP4 está listo para descargar.
                  </p>
                </div>

                <div className="space-y-2">
                  <a href={job.url} download target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full" icon={<Download className="w-4 h-4" />}>
                      Descargar MP4
                    </Button>
                  </a>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="w-full" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Ver en Shotstack
                    </Button>
                  </a>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-500"
                  onClick={handleReset}
                  icon={<RefreshCcw className="w-3.5 h-3.5" />}
                >
                  Nuevo render
                </Button>
              </div>
            )}

            {/* Error */}
            {job.step === 'error' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
                    <XCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-base font-bold text-white">Error en el render</p>
                  <p className="text-xs text-red-400 text-center">{job.errorMsg}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={handleReset}
                  icon={<RefreshCcw className="w-3.5 h-3.5" />}
                >
                  Reintentar
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
