'use client';

import React, { useState, useRef } from 'react';
import { useProjectStore } from '@/lib/store';
import { SLOT_INFO } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import Input from '@/components/ui/Input';
import {
  Mic,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  FileAudio,
  Info,
  ChevronRight,
  Clock,
  Download,
  Link as LinkIcon,
} from 'lucide-react';

type PreviewStatus = 'idle' | 'loading' | 'playing' | 'error';

interface SlotPreviewState {
  status: PreviewStatus;
  audioUrl: string | null;
  errorMsg: string | null;
}

interface VoiceItem {
  id: string;
  label: string;
  parentId: string | null;
  isRisk: boolean;
}

export default function VozEnOff() {
  const { project, updateVoiceScript, setVoiceAudioUrl, fillMissingScripts } = useProjectStore();

  React.useEffect(() => { fillMissingScripts(); }, []);

  const [selectedSlotId, setSelectedSlotId] = useState<string>(() => {
    const firstActive = project.slots.find(s => s.active);
    return firstActive?.id ?? 'SLOT_01';
  });

  const [previewStates, setPreviewStates] = useState<Record<string, SlotPreviewState>>({});
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [publicAudioUrl, setPublicAudioUrl] = useState('');
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Sync URL input when selected slot changes
  React.useEffect(() => {
    setPublicAudioUrl(project.voiceAudioUrls?.[selectedSlotId] ?? '');
  }, [selectedSlotId, project.voiceAudioUrls]);

  // Build voice items list: active slots + risk sub-modules
  const voiceItems: VoiceItem[] = project.slots
    .filter(s => s.active)
    .flatMap<VoiceItem>(slot => {
      if (slot.id === 'SLOT_08' && slot.riskModules) {
        return slot.riskModules
          .filter(rm => rm.active)
          .map(rm => ({
            id: rm.id,
            label: `Riesgo: ${rm.name}`,
            parentId: 'SLOT_08',
            isRisk: true,
          }));
      }
      return [{
        id: slot.id,
        label: (SLOT_INFO[slot.id as keyof typeof SLOT_INFO]?.name ?? slot.id),
        parentId: null,
        isRisk: false,
      }];
    });

  const selectedItem = voiceItems.find(i => i.id === selectedSlotId) ?? voiceItems[0];
  const currentScript = project.voiceScript[selectedSlotId] ?? '';

  const wordCount = currentScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSecs = Math.round((wordCount / 150) * 60);
  const formatDuration = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const totalItems = voiceItems.length;
  const completedItems = voiceItems.filter(item => {
    const s = project.voiceScript[item.id];
    return s && s.trim().length > 0;
  }).length;

  const getItemState = (itemId: string): 'complete' | 'empty' => {
    const s = project.voiceScript[itemId];
    return s && s.trim().length > 0 ? 'complete' : 'empty';
  };

  const getPreview = (itemId: string): SlotPreviewState =>
    previewStates[itemId] ?? { status: 'idle', audioUrl: null, errorMsg: null };

  const setPreview = (itemId: string, update: Partial<SlotPreviewState>) =>
    setPreviewStates(prev => ({
      ...prev,
      [itemId]: { ...getPreview(itemId), ...update },
    }));

  const handlePreview = async (itemId: string) => {
    const text = project.voiceScript[itemId];
    if (!text?.trim()) return;

    const prev = getPreview(itemId);

    if (prev.status === 'playing') {
      audioRefs.current[itemId]?.pause();
      setPreview(itemId, { status: 'idle' });
      return;
    }

    if (prev.audioUrl) {
      const audio = audioRefs.current[itemId];
      if (audio) {
        audio.play();
        setPreview(itemId, { status: 'playing' });
      }
      return;
    }

    setPreview(itemId, { status: 'loading', errorMsg: null });
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      setPreview(itemId, { status: 'playing', audioUrl });

      const audio = new Audio(audioUrl);
      audioRefs.current[itemId] = audio;
      audio.play();
      audio.addEventListener('ended', () => setPreview(itemId, { status: 'idle' }));
      audio.addEventListener('error', () =>
        setPreview(itemId, { status: 'error', errorMsg: 'Error al reproducir audio' })
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setPreview(itemId, { status: 'error', errorMsg: msg });
    }
  };

  const handleDownloadFullAudio = async () => {
    const fullText = voiceItems
      .map(item => project.voiceScript[item.id] ?? '')
      .filter(Boolean)
      .join('\n\n');

    if (!fullText.trim()) return;

    setDownloadLoading(true);
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `voz_${project.clientName.replace(/\s+/g, '_')}.mp3`;
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('Error generando voz completa:', e);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSavePublicUrl = () => {
    const trimmed = publicAudioUrl.trim();
    setVoiceAudioUrl(selectedSlotId, trimmed || null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Módulo 4</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Voz en Off</h1>
          <p className="text-sm text-slate-400">
            Revisá y editá el guion de cada escena, luego generá el audio con ElevenLabs.
          </p>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-800 rounded-xl px-5 py-3">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" className="stroke-slate-800 fill-none" strokeWidth="5" />
              <circle
                cx="28" cy="28" r="22"
                className="fill-none transition-all duration-500"
                stroke="#00998b"
                strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - completedItems / Math.max(totalItems, 1))}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{completedItems}/{totalItems}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Guiones completados</p>
            <span className="text-xs text-slate-400">
              {Math.round((completedItems / Math.max(totalItems, 1)) * 100)}% del total
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Slot list — left panel */}
        <div className="lg:col-span-3 space-y-2">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
            Escenas Activas
          </h2>

          {voiceItems.map(item => {
            const state = getItemState(item.id);
            const isSelected = selectedSlotId === item.id;
            const preview = getPreview(item.id);

            return (
              <button
                key={item.id}
                onClick={() => setSelectedSlotId(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 group ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 shadow-[0_0_12px_rgba(0,153,139,0.1)]'
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                {state === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </p>
                  {item.isRisk && (
                    <span className="text-[10px] text-slate-500">Sub-módulo riesgo</span>
                  )}
                </div>
                {preview.status === 'playing' && (
                  <Volume2 className="w-3 h-3 text-primary animate-pulse shrink-0" />
                )}
                <ChevronRight className={`w-3 h-3 shrink-0 transition-opacity ${
                  isSelected ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-50 text-slate-500'
                }`} />
              </button>
            );
          })}

          {/* Download CTA */}
          <div className="pt-4 border-t border-slate-800/60 space-y-2">
            <Button
              onClick={handleDownloadFullAudio}
              variant="primary"
              size="sm"
              className="w-full"
              icon={downloadLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />
              }
              disabled={completedItems === 0 || downloadLoading}
            >
              {downloadLoading ? 'Generando…' : 'Descargar Audio MP3'}
            </Button>
            {Object.keys(project.voiceAudioUrls ?? {}).length > 0 && (
              <p className="text-[10px] text-primary font-semibold text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {Object.keys(project.voiceAudioUrls).length} audio(s) configurado(s)
              </p>
            )}
          </div>
        </div>

        {/* Script editor — right panel */}
        <div className="lg:col-span-9 space-y-6">
          {selectedItem ? (
            <>
              {/* Section header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-primary font-bold uppercase tracking-widest">
                      {selectedItem.isRisk ? 'Módulo de Riesgo' : `Escena ${selectedItem.id}`}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedItem.label}</h2>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{wordCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">palabras</p>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <div>
                      <p className="text-lg font-bold text-white">{formatDuration(estimatedSecs)}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">estimado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Script editor */}
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Guion de Locución</h3>
                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full">
                    ~150 palabras/min
                  </span>
                </div>

                <TextArea
                  value={currentScript}
                  onChange={e => updateVoiceScript(selectedSlotId, e.target.value)}
                  placeholder="Escribí o pegá el guion de locución para esta escena. Este texto será enviado a ElevenLabs para generar el audio."
                  rows={10}
                />

                {/* Preview controls */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                  {(() => {
                    const preview = getPreview(selectedSlotId);
                    const hasScript = currentScript.trim().length > 0;

                    if (preview.status === 'loading') {
                      return (
                        <Button variant="ghost" size="sm" disabled icon={<Loader2 className="w-4 h-4 animate-spin" />}>
                          Generando preview…
                        </Button>
                      );
                    }

                    if (preview.status === 'playing') {
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(selectedSlotId)}
                          icon={<Square className="w-4 h-4 fill-current" />}
                          className="text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                        >
                          Detener preview
                        </Button>
                      );
                    }

                    return (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(selectedSlotId)}
                        icon={<Play className="w-4 h-4 fill-current" />}
                        disabled={!hasScript}
                      >
                        {preview.audioUrl ? 'Reproducir preview' : 'Preview con ElevenLabs'}
                      </Button>
                    );
                  })()}

                  {getPreview(selectedSlotId).status === 'error' && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getPreview(selectedSlotId).errorMsg}
                    </span>
                  )}

                  {getItemState(selectedSlotId) === 'complete' && (
                    <span className="text-xs text-primary flex items-center gap-1 ml-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Guion completo
                    </span>
                  )}
                </div>
              </Card>

              {/* Audio por módulo */}
              <Card className="space-y-4 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-sm font-bold text-white">Audio para esta escena</h3>
                  {project.voiceAudioUrls?.[selectedSlotId] && (
                    <span className="ml-auto text-[10px] text-primary font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Configurado
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400">
                  Generá el audio en <strong className="text-slate-300">elevenlabs.io</strong> → subilo a Google Drive → copiá la URL pública y pegala acá.
                </p>

                <div className="flex gap-2">
                  <Input
                    value={publicAudioUrl}
                    onChange={e => setPublicAudioUrl(e.target.value)}
                    placeholder="https://drive.google.com/uc?id=..."
                    icon={<LinkIcon className="w-3.5 h-3.5" />}
                  />
                  <Button
                    onClick={handleSavePublicUrl}
                    variant="primary"
                    size="sm"
                  >
                    Guardar
                  </Button>
                </div>

                {project.voiceAudioUrls?.[selectedSlotId] && (
                  <p className="text-[10px] text-primary font-medium flex items-center gap-1 pt-1 border-t border-primary/10">
                    <CheckCircle2 className="w-3 h-3" /> Audio listo para Shotstack
                  </p>
                )}
              </Card>

              {/* Voice info banner */}
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-slate-400">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-300">Voz configurada en ElevenLabs</p>
                  <p>
                    La voz es siempre la misma (pre-configurada en tu cuenta de ElevenLabs).
                    Configurá <code className="bg-slate-800 px-1 rounded">ELEVENLABS_API_KEY</code> y{' '}
                    <code className="bg-slate-800 px-1 rounded">ELEVENLABS_VOICE_ID</code> en{' '}
                    <code className="bg-slate-800 px-1 rounded">.env.local</code>.
                  </p>
                </div>
              </div>

              {/* Navigation between items */}
              <div className="flex justify-between pt-2">
                {(() => {
                  const idx = voiceItems.findIndex(i => i.id === selectedSlotId);
                  const prev = voiceItems[idx - 1] as VoiceItem | undefined;
                  const next = voiceItems[idx + 1] as VoiceItem | undefined;
                  return (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!prev}
                        onClick={() => prev && setSelectedSlotId(prev.id)}
                      >
                        ← {prev?.label ?? ''}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!next}
                        onClick={() => next && setSelectedSlotId(next.id)}
                      >
                        {next?.label ?? ''} →
                      </Button>
                    </>
                  );
                })()}
              </div>
            </>
          ) : (
            <Card className="flex items-center justify-center h-48">
              <div className="text-center space-y-2">
                <Mic className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-slate-500 text-sm">
                  No hay escenas activas. Activá al menos un slot en el módulo de Contenido.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
