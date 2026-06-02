'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/lib/store';
import { SUAMA_COLORS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  LayoutDashboard,
  Paintbrush,
  FileText,
  Image as ImageIcon,
  Mic,
  Video,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Layers,
  FileVideo,
  Settings,
  Save,
  Download,
  Loader2,
} from 'lucide-react';

export default function Home() {
  const { project, loadTutorial } = useProjectStore();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSaveToNotion = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, estado: 'Borrador' }),
      });
      const data = await res.json();
      setSaveMsg(data.ok ? '✓ Guardado en Notion' : `Error: ${data.error}`);
    } catch {
      setSaveMsg('Error al conectar con Notion');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  // Calcular métricas
  const totalSlots = project.slots.length;
  const activeSlots = project.slots.filter(s => s.active).length;
  const activeSlotsPercent = Math.round((activeSlots / totalSlots) * 100);

  const isSlot01Active = project.slots.find(s => s.id === 'SLOT_01')?.active;
  const slot08 = project.slots.find(s => s.id === 'SLOT_08');
  const activeRiskModules = slot08?.active ? (slot08.riskModules?.filter(rm => rm.active) || []) : [];

  const requiredMediaIds: string[] = [];
  if (isSlot01Active) requiredMediaIds.push('portada_img');
  activeRiskModules.forEach(rm => requiredMediaIds.push(rm.mediaId));

  const totalMediaRequired = requiredMediaIds.length;
  const totalMediaUploaded = requiredMediaIds.filter(id => project.media[id]?.url !== null).length;
  const mediaPercent = totalMediaRequired > 0 ? Math.round((totalMediaUploaded / totalMediaRequired) * 100) : 100;

  // Voz en off: contar cuántos audios/scripts activos están completos
  const activeSlotIds = project.slots.filter(s => s.active).map(s => s.id);
  const voiceScriptsCount = activeSlotIds.filter(id => {
    if (id === 'SLOT_08') {
      // Para SLOT_08, contamos los audios de los submódulos activos
      const activeRiskIds = activeRiskModules.map(rm => rm.id);
      const filledRisks = activeRiskIds.filter(rid => project.voiceScript[rid] && project.voiceScript[rid].trim() !== '');
      return filledRisks.length === activeRiskIds.length;
    }
    return project.voiceScript[id] && project.voiceScript[id].trim() !== '';
  }).length;
  
  const totalVoiceRequirements = activeSlotIds.includes('SLOT_08') 
    ? (activeSlotIds.length - 1 + activeRiskModules.length) 
    : activeSlotIds.length;

  const voiceScriptsFilled = activeSlotIds.reduce((acc, id) => {
    if (id === 'SLOT_08') {
      const activeRiskIds = activeRiskModules.map(rm => rm.id);
      const filled = activeRiskIds.filter(rid => project.voiceScript[rid] && project.voiceScript[rid].trim() !== '').length;
      return acc + filled;
    }
    return acc + (project.voiceScript[id] && project.voiceScript[id].trim() !== '' ? 1 : 0);
  }, 0);

  const voicePercent = totalVoiceRequirements > 0 ? Math.round((voiceScriptsFilled / totalVoiceRequirements) * 100) : 100;

  // Estado general de completitud
  const generalProgress = Math.round(
    ((project.identity.logoUrl ? 100 : 0) + activeSlotsPercent + mediaPercent + voicePercent) / 4
  );

  // Estimación de duración (150 palabras de voz en off por minuto)
  const totalWords = Object.entries(project.voiceScript)
    .filter(([key]) => {
      // Filtrar sólo las que están activas
      if (['SLOT_01', 'SLOT_02', 'SLOT_03', 'SLOT_04', 'SLOT_05', 'SLOT_06', 'SLOT_07', 'SLOT_09', 'SLOT_10'].includes(key)) {
        return project.slots.find(s => s.id === key)?.active;
      }
      // Si es un riesgo, ver si SLOT_08 y el riesgo están activos
      if (slot08?.active) {
        return slot08.riskModules?.find(rm => rm.id === key)?.active;
      }
      return false;
    })
    .reduce((acc, [_, text]) => acc + text.split(/\s+/).filter(Boolean).length, 0);
  
  const estimatedSeconds = Math.round((totalWords / 150) * 60) + (activeSlots * 2); // 2 segundos extra de transiciones por slide
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  // El dashboard (chrome de la app) mantiene SIEMPRE el brand SUAMA, no el del cliente.
  const currentThemeColor = SUAMA_COLORS.primary;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Panel General</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Configuración de Video Tutorial
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Cargá la identidad de marca, definí el contenido y los medios de apoyo para generar el video del cliente en Shotstack.
          </p>
        </div>

        {/* Save / Load Notion */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSaveToNotion}
            disabled={saving}
            variant="primary"
            size="sm"
            icon={saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          >
            {saving ? 'Guardando…' : 'Guardar en Notion'}
          </Button>
          {saveMsg && (
            <p className="text-[11px] text-center font-semibold text-primary">{saveMsg}</p>
          )}
        </div>

        {/* Template Selector */}
        <div className="flex flex-col space-y-2 bg-slate-950/50 border border-slate-800 p-4 rounded-xl md:w-80">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Cambiar Plantilla Madre</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (confirm('¿Querés cargar la plantilla de Riesgos en Hoteles y Restaurantes? Se perderán los cambios actuales.')) {
                  loadTutorial('tutorial_01');
                }
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                project.tutorialId === 'tutorial_01'
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,153,139,0.15)]'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Hoteles y Rest.
            </button>
            <button
              onClick={() => {
                if (confirm('¿Querés cargar la plantilla de Prevención de Incendios y Evacuación? Se perderán los cambios actuales.')) {
                  loadTutorial('tutorial_02');
                }
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                project.tutorialId === 'tutorial_02'
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,153,139,0.15)]'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Incendios y Evac.
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Ring Card */}
        <Card className="flex items-center space-x-6">
          <div className="relative w-20 h-20 shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="fill-none transition-all duration-500 ease-out"
                stroke={currentThemeColor}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - generalProgress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{generalProgress}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400">Progreso Total</h3>
            <p className="text-xl font-bold text-white mt-1">Configuración</p>
            <span className="text-[11px] text-slate-500 leading-none">Promedio de los 4 módulos</span>
          </div>
        </Card>

        {/* Stats 2: Active Slots */}
        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escenas Activas</h3>
            <p className="text-2xl font-bold text-white mt-1">{activeSlots} / {totalSlots}</p>
            <span className="text-[11px] text-blue-400">{activeSlotsPercent}% del video incluido</span>
          </div>
        </Card>

        {/* Stats 3: Media Uploaded */}
        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medios Listos</h3>
            <p className="text-2xl font-bold text-white mt-1">{totalMediaUploaded} / {totalMediaRequired}</p>
            <span className="text-[11px] text-amber-400">{mediaPercent}% imágenes/videos cargados</span>
          </div>
        </Card>

        {/* Stats 4: Estimated Duration */}
        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duración Est.</h3>
            <p className="text-2xl font-bold text-white mt-1">{formatDuration(estimatedSeconds)}</p>
            <span className="text-[11px] text-purple-400">{totalWords} palabras en guion</span>
          </div>
        </Card>
      </div>

      {/* Modules Flow and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Steps Flow (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wider flex items-center">
            <Settings className="w-4 h-4 mr-2 text-primary" />
            Flujo de Preparación
          </h2>

          <div className="space-y-4">
            {/* Step 1: Identidad */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/25 border border-slate-800 hover:border-slate-800/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Identidad Visual</h3>
                  {project.identity.logoUrl ? (
                    <span className="flex items-center text-xs text-primary font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Listo
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-amber-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Falta logo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Logo del cliente, paleta de colores corporativa y tipografía principal.</p>
                <div className="mt-3 flex items-center gap-3">
                  <Link href="/identidad">
                    <Button variant="ghost" size="sm" icon={<Paintbrush className="w-3 h-3" />}>
                      Configurar Identidad
                    </Button>
                  </Link>
                  {project.identity.logoUrl && (
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-5 h-5 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.identity.logoUrl} alt="logo" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: project.identity.colors.primary }} />
                        <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: project.identity.colors.secondary }} />
                        <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: project.identity.colors.accent }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Contenido */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/25 border border-slate-800 hover:border-slate-800/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Contenido Textual</h3>
                  <span className="flex items-center text-xs text-primary font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {activeSlots} / {totalSlots} escenas
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Habilitar/deshabilitar slots predefinidos y personalizar textos y listas de riesgos.</p>
                <div className="mt-3">
                  <Link href="/contenido">
                    <Button variant="ghost" size="sm" icon={<FileText className="w-3 h-3" />}>
                      Editar Textos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 3: Medios */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/25 border border-slate-800 hover:border-slate-800/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Imágenes y Videos</h3>
                  {totalMediaUploaded === totalMediaRequired ? (
                    <span className="flex items-center text-xs text-primary font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-amber-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Faltan {totalMediaRequired - totalMediaUploaded} archivos
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pegá URLs de Google Drive en cada placeholder.
                  <span className="text-slate-600"> · Subida automática: pendiente (requiere Workspace o Cloudinary)</span>
                </p>
                <div className="mt-3">
                  <Link href="/medios">
                    <Button variant="ghost" size="sm" icon={<ImageIcon className="w-3 h-3" />}>
                      Gestionar Medios
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 4: Voz en off */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/25 border border-slate-800 hover:border-slate-800/80 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Voz en Off</h3>
                  {voicePercent === 100 ? (
                    <span className="flex items-center text-xs text-primary font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Guiones listos
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-amber-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> {voiceScriptsFilled} / {totalVoiceRequirements} listos
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Revisar guion generado por slide y generar audio oficial con ElevenLabs.</p>
                <div className="mt-3">
                  <Link href="/voz">
                    <Button variant="ghost" size="sm" icon={<Mic className="w-3 h-3" />}>
                      Generar Locuciones
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Render Quick Panel */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wider">Resumen de Video</h2>
          
          <Card className="space-y-6 border border-slate-800/50">
            {/* Project Header Info */}
            <div className="space-y-2 pb-4 border-b border-slate-800/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cliente</span>
              <p className="text-lg font-bold text-white truncate">{project.clientName}</p>
              
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pt-2">Proyecto</span>
              <p className="text-sm font-semibold text-slate-300 truncate">{project.projectName}</p>
            </div>

            {/* Verification checklist */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Verificación de Render</span>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Identidad de Marca</span>
                  {project.identity.logoUrl ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Escenas seleccionadas</span>
                  {activeSlots > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Imágenes y Videos ({totalMediaUploaded}/{totalMediaRequired})</span>
                  {totalMediaUploaded === totalMediaRequired && totalMediaRequired > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Voz en Off generada</span>
                  {voicePercent === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Render Link CTA */}
            <div className="pt-2">
              <Link href="/generar">
                <Button 
                  className="w-full" 
                  variant={generalProgress === 100 ? 'primary' : 'secondary'}
                  icon={<FileVideo className="w-4 h-4" />}
                >
                  Ir a Generar MP4
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
