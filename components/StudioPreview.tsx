'use client';

import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { Eye, Loader2, AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';

type SlideStart = { id: string; title: string; start: number };
type SdkCanvas = { load: () => Promise<void>; resize: () => void; zoomToFit: () => void; dispose: () => void };

/**
 * Vista previa ANIMADA del video en el navegador (sin renderizar, sin gastar créditos).
 * Usa el Shotstack Studio SDK para reproducir el MISMO `edit` que se enviaría a la API
 * (vía /api/render/preview-edit), con transiciones, efectos Ken Burns, el carrusel de
 * imágenes y la voz en off. Las URLs de Drive ya vienen proxeadas por el endpoint para
 * evitar CORS en el canvas.
 *
 * Nota: en Chromium con `--no-sandbox` (entorno de desarrollo) el códec H.264 no está
 * disponible y los clips de VIDEO pueden verse en negro — es un problema del entorno,
 * no del código. Imágenes, texto (html5) y audio se ven bien.
 */
export default function StudioPreview() {
  const project = useProjectStore(s => s.project);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [slideStarts, setSlideStarts] = useState<SlideStart[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Instancias del SDK (se crean una vez y se recargan con loadEdit en cada actualización).
  const editRef = useRef<{ play: () => void; pause: () => void; stop: () => void; seek: (t: number) => void; playbackTime: number; loadEdit: (e: unknown) => Promise<void>; events: { on: (n: string, cb: (p: unknown) => void) => () => void } } | null>(null);
  const canvasRef = useRef<SdkCanvas | null>(null);
  const controlsRef = useRef<{ load: () => Promise<void> } | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  // Limpieza al desmontar.
  useEffect(() => {
    return () => {
      try { canvasRef.current?.dispose(); } catch { /* noop */ }
      editRef.current = null; canvasRef.current = null; controlsRef.current = null;
    };
  }, []);

  // Re-ajustar el canvas cuando cambia el tamaño del contenedor.
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      try { canvasRef.current?.resize(); canvasRef.current?.zoomToFit(); } catch { /* noop */ }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  // Mientras hay preview cargado, refrescar el tiempo actual (para la barra de scrub)
  // leyendo el reloj del SDK en cada frame.
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const tick = () => {
      const t = editRef.current?.playbackTime;
      if (typeof t === 'number') setCurrentTime(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/render/preview-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al armar la vista previa');
      const editJson = data.edit;
      setSlideStarts(Array.isArray(data.slideStarts) ? data.slideStarts : []);
      setTotalDuration(typeof data.totalDuration === 'number' ? data.totalDuration : 0);
      setCurrentTime(0);

      // Carga diferida del SDK (usa pixi.js / APIs de browser → solo en cliente).
      const { Edit, Canvas, Controls } = await import('@shotstack/shotstack-studio');

      // SIEMPRE destruir la instancia anterior y recrear desde cero. El hot-reload
      // (loadEdit) NO liberaba los reproductores de audio previos → se acumulaban y
      // sonaban superpuestos (eco / palabras repetidas) tras cada "Actualizar".
      try { editRef.current?.pause(); } catch { /* noop */ }
      try { canvasRef.current?.dispose(); } catch { /* noop */ }
      // CLAVE: detener TODOS los sonidos de Howler. Los Howl del edit anterior siguen
      // sonando por su cuenta (Howler corre independiente del render loop, y dispose()
      // del canvas no los frena) → eco. Howler.stop() los corta a todos.
      try {
        const { Howler } = await import('howler');
        Howler.stop();
      } catch { /* noop */ }
      editRef.current = null; canvasRef.current = null; controlsRef.current = null;

      // Orden del quick start del SDK: construir edit + canvas, luego
      // canvas.load() ANTES de edit.load() (el canvas monta en [data-shotstack-studio]).
      const edit = new Edit(editJson);
      const canvas = new Canvas(edit);
      await canvas.load();
      await edit.load();
      const controls = new Controls(edit);
      await controls.load();
      // Avisar cuando termina la reproducción para resetear el botón.
      try { edit.events.on('playback:pause', () => setPlaying(false)); } catch { /* noop */ }
      editRef.current = edit as unknown as typeof editRef.current;
      canvasRef.current = canvas as unknown as SdkCanvas;
      controlsRef.current = controls as unknown as typeof controlsRef.current;

      try { canvasRef.current?.zoomToFit(); } catch { /* noop */ }
      setReady(true);
      setPlaying(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la vista previa');
    } finally {
      setLoading(false);
    }
  }

  function togglePlay() {
    const edit = editRef.current;
    if (!edit) return;
    if (playing) { edit.pause(); setPlaying(false); }
    else { edit.play(); setPlaying(true); }
  }

  // Scrub manual: lleva la reproducción a un segundo exacto (para inspeccionar
  // disoluciones, zoom, etc. sin tener que reproducir todo).
  function seekTo(t: number) {
    const edit = editRef.current;
    if (!edit) return;
    try { edit.pause(); } catch { /* noop */ }
    setPlaying(false);
    edit.seek(t);
    setCurrentTime(t);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // Navega al slide anterior/siguiente: ubica el slide actual por el tiempo de
  // reproducción y hace seek (en segundos) al inicio del slide vecino.
  function goToSlide(dir: -1 | 1) {
    const edit = editRef.current;
    if (!edit || slideStarts.length === 0) return;
    const t = edit.playbackTime ?? 0;
    let idx = 0;
    for (let i = 0; i < slideStarts.length; i++) {
      if (slideStarts[i].start <= t + 0.15) idx = i;
    }
    const target = Math.min(slideStarts.length - 1, Math.max(0, idx + dir));
    try { edit.pause(); } catch { /* noop */ }
    edit.seek(slideStarts[target].start);
    setPlaying(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Vista Previa Animada</h2>
        </div>
        <div className="flex items-center gap-2">
          {ready && (
            <>
              <Button onClick={() => goToSlide(-1)} variant="ghost" size="sm" title="Slide anterior">
                ‹ Anterior
              </Button>
              <Button onClick={togglePlay} variant="ghost" size="sm" icon={playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}>
                {playing ? 'Pausar' : 'Reproducir'}
              </Button>
              <Button onClick={() => goToSlide(1)} variant="ghost" size="sm" title="Slide siguiente">
                Siguiente ›
              </Button>
            </>
          )}
          <Button onClick={load} variant="primary" size="sm" disabled={loading} icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : ready ? <RefreshCw className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}>
            {loading ? 'Generando…' : ready ? 'Actualizar' : 'Generar vista previa'}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Reproduce el video con transiciones, efectos y voz en off en el navegador (sin renderizar ni gastar créditos). Es el mismo timeline que el MP4 final.
      </p>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="break-all">{error}</span>
        </div>
      )}

      {/* Stage 16:9 — el SDK monta su canvas dentro de [data-shotstack-studio] */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        <div ref={mountRef} data-shotstack-studio className="absolute inset-0 [&>canvas]:w-full [&>canvas]:h-full" />
        {!ready && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2 pointer-events-none">
            <Eye className="w-8 h-8 opacity-40" />
            <span className="text-xs">Apretá &quot;Generar vista previa&quot; para ver el video acá</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Barra de scrub: arrastrá para ir a cualquier segundo (útil para ver las
          disoluciones entre imágenes dentro de un módulo, el zoom, etc.). */}
      {ready && totalDuration > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] tabular-nums text-slate-400 w-10 shrink-0">{fmt(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.05}
            value={Math.min(currentTime, totalDuration)}
            onChange={e => seekTo(parseFloat(e.target.value))}
            className="flex-1 accent-primary cursor-pointer"
          />
          <span className="text-[11px] tabular-nums text-slate-500 w-10 shrink-0">{fmt(totalDuration)}</span>
        </div>
      )}
    </div>
  );
}
