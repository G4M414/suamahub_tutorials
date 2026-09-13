'use client';

import React, { useState, useRef } from 'react';
import { useCourseStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import {
  Mic,
  Play,
  Pause,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
} from 'lucide-react';

export default function VozEnOff() {
  const { course, activeModuleId, setActiveModuleId, updateModuleVideoScript, setVoiceAudioUrl } =
    useCourseStore();

  const currentModule =
    course.modules.find((m) => m.id === activeModuleId) || course.modules[0];

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerateVoice = async () => {
    if (!currentModule.videoScript.trim()) return;
    setGenerating(true);
    setGenError(null);

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentModule.videoScript.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status} de ElevenLabs`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setVoiceAudioUrl(currentModule.id, objectUrl);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Error al generar audio');
    } finally {
      setGenerating(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const wordCount = currentModule.videoScript.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round(wordCount / 2.2);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Mic className="w-6 h-6 text-primary" />
            Generación de Voz en Off (ElevenLabs)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generá la locución profesional para cada módulo a partir del guión narrativo.
          </p>
        </div>

        {/* Module Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Módulo:</span>
          <select
            value={currentModule.id}
            onChange={(e) => {
              setActiveModuleId(e.target.value);
              setIsPlaying(false);
            }}
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
        {/* Left Col: Script Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                  Guión de Locución
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">{currentModule.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-300">{wordCount} palabras</span>
                <span className="text-[10px] text-slate-500 block">~{estimatedSeconds} segundos estimados</span>
              </div>
            </div>

            <TextArea
              value={currentModule.videoScript}
              onChange={(e) => updateModuleVideoScript(currentModule.id, e.target.value)}
              rows={12}
              className="bg-slate-950 border-slate-800 text-xs font-medium text-slate-200 leading-relaxed"
              placeholder="Guión completo que será locutado por ElevenLabs..."
            />

            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={handleGenerateVoice}
                disabled={generating || !currentModule.videoScript.trim()}
                className="text-xs font-bold shadow-lg shadow-primary/20"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando locución con ElevenLabs...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    {currentModule.voiceAudioUrl ? 'Regenerar Locución' : 'Generar Audio del Módulo'}
                  </>
                )}
              </Button>
            </div>

            {genError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{genError}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Audio Player & Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Estado y Reproductor de Audio
            </h3>

            {currentModule.voiceAudioUrl ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Audio generado y vinculado al módulo</span>
                </div>

                <audio
                  ref={audioRef}
                  src={currentModule.voiceAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <Button
                    onClick={togglePlayAudio}
                    className="w-12 h-12 rounded-full p-0 flex items-center justify-center shrink-0"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>

                  <div className="flex-1">
                    <span className="text-xs font-bold text-white block truncate">
                      Locución — {currentModule.title}
                    </span>
                    <span className="text-[10px] text-slate-400">Audio MP3 HQ (ElevenLabs Multilingual v2)</span>
                  </div>

                  <a
                    href={currentModule.voiceAudioUrl}
                    download={`Voz_${currentModule.id}.mp3`}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                    title="Descargar MP3"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                <Volume2 className="w-10 h-10 mx-auto opacity-30 text-teal-400" />
                <p className="text-xs font-semibold">Sin audio generado aún para este módulo.</p>
                <p className="text-[10px] text-slate-500">
                  Hacé clic en &quot;Generar Audio del Módulo&quot; para procesarlo con ElevenLabs.
                </p>
              </div>
            )}

            {/* Production summary */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <span className="font-bold text-slate-300 block">Progreso de audio del curso:</span>
              <div className="flex items-center justify-between text-[11px]">
                <span>Módulos con audio listo:</span>
                <span className="font-bold text-teal-400">
                  {course.modules.filter((m) => m.voiceAudioUrl).length} / {course.modules.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
