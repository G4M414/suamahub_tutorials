'use client';

import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { Eye, Loader2, ArrowLeft, ArrowRight, AlertTriangle, Volume2, Play, Pause } from 'lucide-react';

type Slide = { index: number; id: string; title: string; html: string; audioUrl: string | null };

/**
 * Vista previa del video EN EL NAVEGADOR, sin renderizar (sin gastar créditos).
 * Renderiza el MISMO HTML de cada slide que usa el render de Shotstack, dentro de
 * un iframe 1920×1080 escalado a 16:9. Las imágenes de Drive se ven en <img>
 * normal (CORS solo bloquea canvas, no imágenes). Navegación slide por slide.
 */
export default function StudioPreview() {
  const project = useProjectStore(s => s.project);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [cur, setCur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Escalar el stage 1920×1080 al ancho disponible (mantiene 16:9).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1920);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reproducción automática: suena el audio del slide y al terminar avanza al
  // siguiente. Si el slide no tiene audio, espera ~6s y avanza.
  useEffect(() => {
    if (!playingAll || !slides || slides.length === 0) return;
    const cur_ = cur;
    const slide_ = slides[cur_];
    const audioEl = audioRef.current;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

    const next = () => {
      if (cur_ < slides.length - 1) setCur(cur_ + 1);
      else setPlayingAll(false);
    };

    if (slide_?.audioUrl && audioEl) {
      audioEl.currentTime = 0;
      audioEl.addEventListener('ended', next);
      audioEl.play().catch(() => { timerRef.current = setTimeout(next, 6000); });
      return () => audioEl.removeEventListener('ended', next);
    }
    timerRef.current = setTimeout(next, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingAll, cur, slides]);

  const togglePlayAll = () => {
    if (playingAll) {
      audioRef.current?.pause();
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlayingAll(false);
    } else {
      setPlayingAll(true);
    }
  };

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/render/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al armar la vista previa');
      const s: Slide[] = data.slides ?? [];
      setSlides(s);
      setCur(0);
      if (s.length === 0) setError('No hay slides activos para previsualizar.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la vista previa');
    } finally {
      setLoading(false);
    }
  }

  const slide = slides?.[cur];
  const doc = slide
    ? `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;overflow:hidden">${slide.html}</body></html>`
    : '';

  const go = (d: number) => setCur(c => Math.min(Math.max(c + d, 0), (slides?.length ?? 1) - 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Vista Previa</h2>
        </div>
        <div className="flex items-center gap-2">
          {slides && slides.length > 0 && (
            <Button onClick={togglePlayAll} variant="ghost" size="sm" icon={playingAll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}>
              {playingAll ? 'Pausar' : 'Reproducir'}
            </Button>
          )}
          <Button onClick={load} variant="primary" size="sm" disabled={loading} icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}>
            {loading ? 'Generando…' : slides ? 'Actualizar' : 'Generar vista previa'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Previsualiza cada slide en el navegador (sin renderizar ni gastar créditos). Es el mismo diseño que el MP4 final.
      </p>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="break-all">{error}</span>
        </div>
      )}

      {/* Stage 16:9 */}
      <div ref={wrapRef} className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        {slide ? (
          <iframe
            key={`${cur}-${slide.id}`}
            title={`Slide ${cur + 1}`}
            srcDoc={doc}
            sandbox="allow-same-origin"
            style={{
              width: 1920,
              height: 1080,
              border: 0,
              display: 'block',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          />
        ) : (
          !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Eye className="w-8 h-8 opacity-40" />
              <span className="text-xs">Apretá &quot;Generar vista previa&quot; para ver el video acá</span>
            </div>
          )
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Navegación entre slides */}
      {slides && slides.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <Button onClick={() => go(-1)} variant="ghost" size="sm" disabled={cur === 0} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Anterior
          </Button>
          <div className="text-center min-w-0">
            <p className="text-xs font-semibold text-white truncate">{slide?.title}</p>
            <p className="text-[10px] text-slate-500">Slide {cur + 1} de {slides.length}</p>
          </div>
          <Button onClick={() => go(1)} variant="ghost" size="sm" disabled={cur >= slides.length - 1} icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Siguiente
          </Button>
        </div>
      )}

      {/* Audio de la voz en off de este slide (si existe) */}
      {slide?.audioUrl && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <Volume2 className="w-3.5 h-3.5 text-primary shrink-0" />
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={audioRef} key={slide.audioUrl} controls src={slide.audioUrl} className="w-full h-8" />
        </div>
      )}
    </div>
  );
}
