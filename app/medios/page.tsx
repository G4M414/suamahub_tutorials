'use client';

import React, { useState, useRef } from 'react';
import { useProjectStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Upload,
  Sparkles,
  Trash2,
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Link,
} from 'lucide-react';

// Convierte cualquier URL de Drive a formato embeddable para <img> preview
function drivePreviewUrl(url: string): string {
  if (!url || url.startsWith('blob:') || url.startsWith('/') || !url.includes('drive.google')) return url;
  const matchUc = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const matchView = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const fileId = matchUc?.[1] ?? matchView?.[1];
  if (fileId) {
    // Proxy server-side — evita CORS y problemas de cookies de Google
    return `/api/drive/proxy?id=${fileId}`;
  }
  return url;
}

// Mapa de imágenes mock realistas de Unsplash según el tipo de riesgo/diapositiva
const MOCK_ASSETS_MAP: Record<string, { type: 'image' | 'video'; url: string; prompt: string }> = {
  // Tutorial 01 (Riesgos)
  portada_img: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    prompt: 'Fachada elegante de hotel de lujo y restaurante, estilo fotográfico premium, iluminación cálida de atardecer.'
  },
  objetivos_img: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    prompt: 'Instructor de seguridad laboral impartiendo una charla a un grupo de mozos y personal de hotelería en una sala de conferencias.'
  },
  media_08a: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    prompt: 'Piso de porcelanato brillante en pasillo de hotel, mojado, con un cartel amarillo triangular de advertencia de resbalones.'
  },
  media_08b: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&auto=format&fit=crop&q=80',
    prompt: 'Cuchillo de chef profesional bien afilado picando vegetales sobre tabla de madera en cocina comercial limpia.'
  },
  media_08c: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    prompt: 'Olla de metal hirviendo con vapor saliendo de la tapa en hornalla de cocina, mangos orientados hacia adentro.'
  },
  media_08d: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
    prompt: 'Electricista revisando de forma segura un tablero de disyuntores eléctricos industriales, con guantes protectores.'
  },
  media_08e: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=800&auto=format&fit=crop&q=80',
    prompt: 'Campana extractora de acero inoxidable en una cocina de restaurante, extremadamente limpia y libre de grasa.'
  },
  media_08f: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    prompt: 'Envases plásticos de productos de limpieza industrial con etiquetas de advertencia de seguridad químicas claras y guantes de nitrilo al lado.'
  },
  media_08g: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    prompt: 'Mucama de hotel haciendo una cama correctamente con postura ergonómica, doblando las rodillas en lugar de la espalda.'
  },
  
  // Tutorial 02 (Incendios)
  media_08a_fire: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1599824425139-688755609d94?w=800&auto=format&fit=crop&q=80',
    prompt: 'Materiales sólidos de oficina (papel, cartón, madera) ardiendo de forma controlada en un entorno de pruebas, mostrando las clases de fuego.'
  },
  media_08b_fire: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1597838816882-4551b030fc22?w=800&auto=format&fit=crop&q=80',
    prompt: 'Línea de extintores portátiles de polvo químico ABC y CO2 colgados en una pared gris corporativa, con manómetros e inspecciones al día.'
  },
  media_08c_fire: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1610473523588-460ca4c68022?w=800&auto=format&fit=crop&q=80',
    prompt: 'Persona utilizando un extintor de incendios a favor del viento, apuntando la manguera a la base de las llamas en un ejercicio de simulación.'
  }
};

export default function ImagenesyVideos() {
  const { project, updateMedia } = useProjectStore();
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string>('portada_img');
  const [activeTab, setActiveTab] = useState<'drive' | 'upload' | 'ai'>('drive');
  const [driveUrl, setDriveUrl] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('imagen2');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // La portada va a pantalla completa (16:9); el resto ocupa el panel derecho del split (1:1)
  const getAspectRatio = (id: string) => id === 'portada_img' ? '16:9' : '1:1';
  const getAspectLabel = (id: string) => id === 'portada_img' ? '16:9 — pantalla completa' : '1:1 — panel derecho';

  // Obtener placeholders requeridos dinámicamente según slots activos
  const requiredPlaceholders: { id: string; name: string; type: 'image' | 'video' }[] = [];

  const isSlot01Active  = project.slots.find(s => s.id === 'SLOT_01')?.active;
  const isSlot02Active  = project.slots.find(s => s.id === 'SLOT_02')?.active;
  const isSlot03BActive = project.slots.find(s => s.id === 'SLOT_03B')?.active;
  const slot08 = project.slots.find(s => s.id === 'SLOT_08');
  const activeRiskModules = slot08?.active ? (slot08.riskModules?.filter(rm => rm.active) || []) : [];

  if (isSlot01Active) {
    requiredPlaceholders.push({ id: 'portada_img', name: 'Imagen de Portada', type: 'image' });
  }
  if (isSlot02Active) {
    requiredPlaceholders.push({ id: 'objetivos_img', name: 'Imagen de Objetivos', type: 'image' });
  }
  if (isSlot03BActive) {
    requiredPlaceholders.push({ id: 'slot_03b_img', name: 'Obligaciones y Derechos (imagen)', type: 'image' });
  }
  
  activeRiskModules.forEach(rm => {
    requiredPlaceholders.push({ 
      id: rm.mediaId, 
      name: `Riesgo: ${rm.name}`, 
      type: rm.videoUrl ? 'video' : 'image' 
    });
  });

  const selectedItemInfo = requiredPlaceholders.find(p => p.id === selectedPlaceholder);
  const currentMediaState = project.media[selectedPlaceholder] || {
    id: `media_${selectedPlaceholder}`,
    placeholderId: selectedPlaceholder,
    type: 'image',
    source: 'upload',
    url: null
  };

  // Sincronizar prompt y driveUrl por defecto según el placeholder
  React.useEffect(() => {
    if (selectedPlaceholder) {
      const mockData = MOCK_ASSETS_MAP[selectedPlaceholder] || { prompt: 'Fotografía realista en alta calidad...' };
      setAiPrompt(currentMediaState.aiPrompt || mockData.prompt);
      // Mostrar la URL de Drive si ya existe
      if (currentMediaState.source === 'upload' && currentMediaState.url?.startsWith('http')) {
        setDriveUrl(currentMediaState.url);
      } else {
        setDriveUrl('');
      }
    }
  }, [selectedPlaceholder, currentMediaState.aiPrompt, currentMediaState.source, currentMediaState.url]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    updateMedia(selectedPlaceholder, {
      url: localUrl,
      fileName: file.name,
      source: 'upload',
      generationStatus: 'generating',
    });

    setIsUploading(true);
    try {
      const subfolder = file.type.startsWith('video/') ? 'Videos' : 'Imágenes';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('clientName', project.clientName || 'Sin nombre');
      fd.append('subfolder', subfolder);

      const res = await fetch('/api/drive/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      updateMedia(selectedPlaceholder, {
        url: data.url,           // URL pública de Drive
        fileName: file.name,
        source: 'upload',
        generationStatus: 'success',
      });
    } catch (err) {
      console.error('Drive upload error:', err);
      // Mantener la preview local pero marcar como pendiente de subir
      updateMedia(selectedPlaceholder, { generationStatus: 'success' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDriveUrlSave = () => {
    const url = driveUrl.trim();
    if (!url) return;
    updateMedia(selectedPlaceholder, {
      url,
      source: 'upload',
      generationStatus: 'success',
      fileName: undefined,
    });
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    updateMedia(selectedPlaceholder, { generationStatus: 'generating', aiPrompt });

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          clientName: project.clientName || 'Sin nombre',
          placeholderId: selectedPlaceholder,
          aspectRatio: getAspectRatio(selectedPlaceholder),
          model: aiModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Fallback to mock when API key not configured yet
        if (data.error?.includes('GEMINI_API_KEY')) {
          const mockData = MOCK_ASSETS_MAP[selectedPlaceholder] || {
            type: 'image' as const,
            url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
          };
          updateMedia(selectedPlaceholder, {
            url: mockData.url,
            type: mockData.type,
            source: 'ai',
            generationStatus: 'success',
            aiPrompt,
          });
          return;
        }
        throw new Error(data.error);
      }

      updateMedia(selectedPlaceholder, {
        url: data.url,
        type: 'image',
        source: 'ai',
        generationStatus: 'success',
        aiPrompt,
      });
    } catch (err) {
      console.error('AI generate error:', err);
      updateMedia(selectedPlaceholder, { generationStatus: 'idle' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveMedia = () => {
    updateMedia(selectedPlaceholder, {
      url: null,
      fileName: undefined,
      aiPrompt: undefined,
      generationStatus: 'idle'
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Módulo 3</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Imágenes y Videos</h1>
        <p className="text-sm text-slate-400">
          Subí tus propios archivos locales o utilizá IA (Gemini Imagen 2.0 y Google Veo) para generar assets multimedia.
        </p>
      </div>

      {requiredPlaceholders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm border-dashed">
          <HelpCircle className="w-12 h-12 text-slate-600 mb-2" />
          <h3 className="font-semibold text-slate-400">No hay placeholders visuales activos</h3>
          <p className="text-xs text-slate-500 max-w-xs text-center mt-1">
            Habilitá las escenas (Portada, Objetivos o Módulos de Riesgo) en el panel de **Contenido Textual** para ver sus placeholders multimedia aquí.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Placeholders Grid (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-4 space-y-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider px-2">Recursos Requeridos</h2>
              <div className="space-y-1.5">
                {requiredPlaceholders.map((ph) => {
                  const isSelected = ph.id === selectedPlaceholder;
                  const itemMedia = project.media[ph.id];
                  const hasAsset = itemMedia && itemMedia.url !== null;
                  
                  return (
                    <button
                      key={ph.id}
                      onClick={() => {
                        setSelectedPlaceholder(ph.id);
                        if (itemMedia?.source) {
                          setActiveTab(itemMedia.source);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-white shadow-[0_0_10px_rgba(0,153,139,0.05)]'
                          : 'bg-transparent border-slate-900/30 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {hasAsset ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={drivePreviewUrl(itemMedia.url!)} alt="Mini preview" className="w-full h-full object-cover" />
                          ) : ph.type === 'video' ? (
                            <VideoIcon className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{ph.name}</p>
                          <span className="text-[10px] text-slate-500 leading-none">
                            {ph.type === 'video' ? 'Video (16:9 MP4)' : 'Imagen (16:9 JPG/PNG)'}
                          </span>
                        </div>
                      </div>

                      <div className="ml-2 shrink-0">
                        {hasAsset ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                        ) : (
                          <span className="text-[10px] bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded font-semibold">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Asset Loader and Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedItemInfo ? (
              <Card className="space-y-6">
                {/* Header selected item */}
                <div className="pb-4 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Elemento Seleccionado</span>
                    <h3 className="text-base font-bold text-white mt-1">{selectedItemInfo.name}</h3>
                  </div>
                  
                  {currentMediaState.url && (
                    <Button
                      onClick={handleRemoveMedia}
                      variant="danger"
                      size="sm"
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Remover Medio
                    </Button>
                  )}
                </div>

                {/* Displaying Image/Video preview if loaded */}
                <div className="aspect-video w-full rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden flex items-center justify-center relative group">
                  {currentMediaState.generationStatus === 'generating' ? (
                    <div className="text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-white">Generando con IA...</p>
                        <p className="text-[10px] text-slate-500">Gemini Imagen está procesando tu prompt…</p>
                      </div>
                    </div>
                  ) : currentMediaState.url ? (
                    <>
                      {currentMediaState.type === 'video' ? (
                        <div className="w-full h-full relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={currentMediaState.url} alt="Video poster" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary backdrop-blur-sm">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={drivePreviewUrl(currentMediaState.url)}
                          alt="Asset preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Floating tag of source */}
                      <span className="absolute bottom-3 left-3 text-[10px] bg-slate-900/80 backdrop-blur border border-slate-800/60 px-2 py-1 rounded font-semibold text-slate-300">
                        {currentMediaState.source === 'ai'
                          ? 'IA ✨'
                          : currentMediaState.url?.startsWith('http')
                          ? '🔗 Drive / URL pública'
                          : '📁 Archivo local (preview)'}
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-600">
                      {selectedItemInfo.type === 'video' ? (
                        <VideoIcon className="w-12 h-12 mx-auto mb-2 text-slate-800" />
                      ) : (
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-800" />
                      )}
                      <p className="text-xs font-semibold text-slate-400">Sin archivo multimedia</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Elegí la opción de carga manual o generación por IA para asignar un recurso visual a esta escena.</p>
                    </div>
                  )}
                </div>

                {/* Tabs: Drive URL | Upload local | IA */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex border-b border-slate-800">
                    {(['drive', 'upload', 'ai'] as const).map((tab) => {
                      const labels = { drive: 'URL de Drive ★', upload: 'Archivo local', ai: 'Generar con IA' };
                      const icons = { drive: <Link className="w-3.5 h-3.5" />, upload: <Upload className="w-3.5 h-3.5" />, ai: <Sparkles className="w-3.5 h-3.5" /> };
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex items-center space-x-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                            activeTab === tab
                              ? 'border-primary text-primary'
                              : 'border-transparent text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {icons[tab]}
                          <span>{labels[tab]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab: Drive URL — flujo recomendado para producción */}
                  {activeTab === 'drive' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-slate-300">
                        <Link className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white">Flujo recomendado:</strong> subí el archivo a Google Drive → botón derecho → "Obtener enlace" → pegá la URL pública aquí. Shotstack accede directamente a esa URL al renderizar.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={driveUrl}
                          onChange={e => setDriveUrl(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleDriveUrlSave()}
                          placeholder="https://drive.google.com/uc?id=..."
                          className="flex-1 px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-mono"
                        />
                        <Button
                          onClick={handleDriveUrlSave}
                          disabled={!driveUrl.trim()}
                          variant="primary"
                          size="sm"
                        >
                          Guardar
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Formato correcto: <code className="bg-slate-800 px-1 rounded">https://drive.google.com/uc?id=TU_FILE_ID</code>
                        {' · '}Aspect ratio recomendado: <strong className="text-slate-400">{getAspectLabel(selectedPlaceholder)}</strong>
                      </p>
                    </div>
                  )}

                  {/* Tab: Upload local — PENDIENTE */}
                  {activeTab === 'upload' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Upload className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-slate-300">Subida automática — Próximamente</p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Esta función requiere <strong className="text-slate-400">Google Workspace</strong> (Unidades Compartidas) o integración con <strong className="text-slate-400">Cloudinary</strong> para almacenar archivos con URL pública accesible por Shotstack.
                          </p>
                          <div className="pt-2 border-t border-slate-700/50 space-y-1">
                            <p className="text-[11px] font-semibold text-slate-400">Mientras tanto, usá este flujo:</p>
                            <ol className="text-[11px] text-slate-500 space-y-1 list-decimal list-inside">
                              <li>Subí el archivo a tu Google Drive manualmente</li>
                              <li>Clic derecho → &quot;Obtener enlace&quot; → &quot;Cualquiera con el enlace&quot;</li>
                              <li>Cambiá <code className="bg-slate-800 px-1 rounded">/file/d/ID/view</code> por <code className="bg-slate-800 px-1 rounded">/uc?id=ID</code></li>
                              <li>Pegá esa URL en la pestaña <strong className="text-primary">URL de Drive ★</strong></li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: AI Generation */}
                  {activeTab === 'ai' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          label="Prompt para la IA"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Ej: Describa la imagen detalladamente..."
                        />
                        <span className="text-[9px] text-slate-500 block leading-tight">
                          Prompt base pre-cargado para esta escena · Gemini generará en <strong className="text-slate-400">{getAspectLabel(selectedPlaceholder)}</strong>
                        </span>
                      </div>

                      <div className="flex gap-4">
                        {/* Selector de Modelo según Tipo */}
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Modelo IA</label>
                          <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            className="w-full bg-slate-950/40 border border-slate-800 focus:border-primary/50 text-slate-200 text-xs rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          >
                            {selectedItemInfo.type === 'video' ? (
                              <>
                                <option value="veo">Google Veo 3.1 — Gemini</option>
                                <option value="kling">Kling 3.0</option>
                              </>
                            ) : (
                              <>
                                <option value="nanobanana">Nano Banana 2 — Gemini</option>
                                <option value="gpt-image">GPT Image 2.0 — OpenAI</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Button execute */}
                        <div className="flex items-end shrink-0">
                          <Button
                            onClick={handleAIGenerate}
                            loading={isGenerating}
                            disabled={!aiPrompt.trim()}
                            icon={<Sparkles className="w-4 h-4" />}
                          >
                            Generar Recurso
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
