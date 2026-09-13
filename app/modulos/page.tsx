'use client';

import React, { useState } from 'react';
import { useCourseStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import SlidePreview from '@/components/SlidePreview';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  HelpCircle,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function ModulosContenido() {
  const {
    course,
    activeModuleId,
    setActiveModuleId,
    toggleModule,
    updateModuleVideoScript,
    updateModuleSlide,
    addSlide,
    removeSlide,
    updateDownloadableMaterial,
    updateActivity,
  } = useCourseStore();

  const [activeTab, setActiveTab] = useState<'slides' | 'materials' | 'activities'>('slides');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  const currentModule =
    course.modules.find((m) => m.id === activeModuleId) || course.modules[0];

  const currentSlide = currentModule?.slides[selectedSlideIndex] || currentModule?.slides[0];

  // Helper para bullet points de slides
  const handleBulletChange = (slideId: string, index: number, value: string) => {
    const currentSlideObj = currentModule.slides.find((s) => s.id === slideId);
    if (!currentSlideObj) return;
    const newBullets = [...(currentSlideObj.bulletPoints || [])];
    newBullets[index] = value;
    updateModuleSlide(currentModule.id, slideId, { bulletPoints: newBullets });
  };

  const handleAddBullet = (slideId: string) => {
    const currentSlideObj = currentModule.slides.find((s) => s.id === slideId);
    if (!currentSlideObj) return;
    const newBullets = [...(currentSlideObj.bulletPoints || []), ''];
    updateModuleSlide(currentModule.id, slideId, { bulletPoints: newBullets });
  };

  const handleRemoveBullet = (slideId: string, index: number) => {
    const currentSlideObj = currentModule.slides.find((s) => s.id === slideId);
    if (!currentSlideObj) return;
    const newBullets = [...(currentSlideObj.bulletPoints || [])];
    newBullets.splice(index, 1);
    updateModuleSlide(currentModule.id, slideId, { bulletPoints: newBullets });
  };

  // Helper para items de secciones de materiales
  const handleMaterialItemChange = (
    materialId: string,
    sectionIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const material = currentModule.downloadableMaterials.find((m) => m.id === materialId);
    if (!material) return;
    const newSections = [...material.sections];
    newSections[sectionIndex].items[itemIndex] = value;
    updateDownloadableMaterial(currentModule.id, materialId, { sections: newSections });
  };

  const handleAddMaterialItem = (materialId: string, sectionIndex: number) => {
    const material = currentModule.downloadableMaterials.find((m) => m.id === materialId);
    if (!material) return;
    const newSections = [...material.sections];
    newSections[sectionIndex].items.push('');
    updateDownloadableMaterial(currentModule.id, materialId, { sections: newSections });
  };

  const handleRemoveMaterialItem = (
    materialId: string,
    sectionIndex: number,
    itemIndex: number
  ) => {
    const material = currentModule.downloadableMaterials.find((m) => m.id === materialId);
    if (!material) return;
    const newSections = [...material.sections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    updateDownloadableMaterial(currentModule.id, materialId, { sections: newSections });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-primary" />
            Editor de Módulos y Contenido
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Editá el guión narrativo, las diapositivas del video, las guías de los alumnos y las actividades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/materiales">
            <Button variant="outline" className="text-xs border-slate-700 bg-slate-900 text-slate-200">
              <Printer className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Vista Imprimible PDF
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Module Selector (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
            Estructura del Curso
          </span>

          <div className="space-y-1.5">
            {course.modules.map((m, idx) => {
              const isSelected = m.id === currentModule?.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveModuleId(m.id);
                    setSelectedSlideIndex(0);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-900 border-primary shadow-lg shadow-primary/10 text-white font-bold'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-teal-400">
                      {m.type === 'intro' ? 'Intro' : m.type === 'closing' ? 'Cierre' : `Módulo ${idx}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {m.slides.length} slides
                    </span>
                  </div>
                  <span className="text-xs line-clamp-1 font-bold">{m.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Module Editor (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {currentModule && (
            <Card className="p-6 border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    {currentModule.type === 'intro' ? 'Módulo de Bienvenida' : currentModule.type === 'closing' ? 'Módulo de Cierre' : 'Módulo Temático'}
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">{currentModule.title}</h2>
                  {currentModule.objective && (
                    <p className="text-xs text-slate-400 mt-1 italic">
                      Objetivo: {currentModule.objective}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleModule(currentModule.id, !currentModule.active)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      currentModule.active
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {currentModule.active ? 'Módulo Activo' : 'Módulo Inactivo'}
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                <button
                  onClick={() => setActiveTab('slides')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'slides'
                      ? 'bg-primary text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Video y Diapositivas ({currentModule.slides.length})
                </button>

                <button
                  onClick={() => setActiveTab('materials')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'materials'
                      ? 'bg-primary text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Materiales Descargables ({currentModule.downloadableMaterials.length})
                </button>

                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'activities'
                      ? 'bg-primary text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Actividades ({currentModule.activities.length})
                </button>
              </div>

              {/* ── TAB 1: VIDEO Y SLIDES ── */}
              {activeTab === 'slides' && (
                <div className="space-y-6">
                  {/* Guión Completo Narrado */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Guión Completo Narrado (Texto de Voz en Off)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {currentModule.videoScript.split(/\s+/).filter(Boolean).length} palabras (~{Math.round(currentModule.videoScript.split(/\s+/).filter(Boolean).length / 2.2)} seg)
                      </span>
                    </div>
                    <textarea
                      value={currentModule.videoScript}
                      onChange={(e) => updateModuleVideoScript(currentModule.id, e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-200 focus:border-primary outline-none leading-relaxed resize-y"
                      placeholder="Escribí el texto completo que narrará la voz en off..."
                    />
                  </div>

                  {/* Diapositivas Header */}
                  <div className="flex items-center justify-between pt-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Diapositivas del Video
                    </h3>
                    <Button
                      onClick={() => {
                        addSlide(currentModule.id);
                        setSelectedSlideIndex(currentModule.slides.length);
                      }}
                      variant="outline"
                      className="text-xs font-bold border-slate-700 bg-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-primary" />
                      Agregar Slide
                    </Button>
                  </div>

                  {/* Carousel selector de slides */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {currentModule.slides.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlideIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          selectedSlideIndex === idx
                            ? 'bg-primary/20 text-teal-300 border-primary/50'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Slide {idx + 1}: {s.title.slice(0, 18)}...
                      </button>
                    ))}
                  </div>

                  {/* Editor del slide seleccionado + Preview interactivo */}
                  {currentSlide && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2">
                      {/* Left: Fields (6 cols) */}
                      <div className="xl:col-span-6 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-300">
                            Título del Slide
                          </label>
                          <Input
                            value={currentSlide.title}
                            onChange={(e) =>
                              updateModuleSlide(currentModule.id, currentSlide.id, {
                                title: e.target.value,
                              })
                            }
                            className="bg-slate-950 border-slate-800 text-xs font-bold text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-300">
                            Contenido Principal / Idea Fuerza
                          </label>
                          <TextArea
                            value={currentSlide.content}
                            onChange={(e) =>
                              updateModuleSlide(currentModule.id, currentSlide.id, {
                                content: e.target.value,
                              })
                            }
                            rows={3}
                            className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                          />
                        </div>

                        {/* Bullet points dinámicos */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-300">
                              Viñetas / Puntos Clave
                            </label>
                            <button
                              onClick={() => handleAddBullet(currentSlide.id)}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Agregar punto
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(currentSlide.bulletPoints || []).map((bp, bpIdx) => (
                              <div key={bpIdx} className="flex items-center gap-2">
                                <Input
                                  value={bp}
                                  onChange={(e) =>
                                    handleBulletChange(currentSlide.id, bpIdx, e.target.value)
                                  }
                                  placeholder={`Punto ${bpIdx + 1}...`}
                                  className="bg-slate-950 border-slate-800 text-xs"
                                />
                                <button
                                  onClick={() => handleRemoveBullet(currentSlide.id, bpIdx)}
                                  className="p-2 text-slate-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {currentModule.slides.length > 1 && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                if (confirm('¿Eliminar esta diapositiva?')) {
                                  removeSlide(currentModule.id, currentSlide.id);
                                  setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
                                }
                              }}
                              className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar esta diapositiva
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Live Preview (6 cols) */}
                      <div className="xl:col-span-6 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            Vista Previa Fiel (Shotstack 16:9)
                          </span>
                          <span className="text-[10px] text-teal-400 font-bold">
                            Slide {selectedSlideIndex + 1} de {currentModule.slides.length}
                          </span>
                        </div>

                        <SlidePreview
                          slide={currentSlide}
                          identity={course.identity}
                          index={selectedSlideIndex}
                          totalSlides={currentModule.slides.length}
                          mediaUrl={
                            currentSlide.mediaId && currentModule.media[currentSlide.mediaId]?.url
                              ? currentModule.media[currentSlide.mediaId].url
                              : currentModule.backgroundMediaId &&
                                currentModule.media[currentModule.backgroundMediaId]?.url
                              ? currentModule.media[currentModule.backgroundMediaId].url
                              : null
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: MATERIALES DESCARGABLES ── */}
              {activeTab === 'materials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">Guías y Materiales Descargables</h3>
                      <p className="text-xs text-slate-400">PDFs de trabajo para que el alumno descargue en su LMS</p>
                    </div>

                    <Link href="/materiales">
                      <Button variant="outline" className="text-xs border-primary/30 text-teal-300">
                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                        Imprimir / Guardar PDFs
                      </Button>
                    </Link>
                  </div>

                  {currentModule.downloadableMaterials.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                      Este módulo no tiene materiales descargables asignados.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentModule.downloadableMaterials.map((mat) => (
                        <Card key={mat.id} className="p-5 border-slate-800 bg-slate-950 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <Input
                                value={mat.title}
                                onChange={(e) =>
                                  updateDownloadableMaterial(currentModule.id, mat.id, {
                                    title: e.target.value,
                                  })
                                }
                                className="text-sm font-bold text-white bg-slate-900 border-slate-700"
                              />
                              <TextArea
                                value={mat.description}
                                onChange={(e) =>
                                  updateDownloadableMaterial(currentModule.id, mat.id, {
                                    description: e.target.value,
                                  })
                                }
                                rows={2}
                                className="text-xs text-slate-300 bg-slate-900 border-slate-700"
                              />
                            </div>
                          </div>

                          {/* Secciones de preguntas/items */}
                          <div className="space-y-4 pt-2 border-t border-slate-800/80">
                            {mat.sections.map((sec, secIdx) => (
                              <div key={secIdx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                                <h4 className="text-xs font-black text-teal-400 uppercase tracking-wider">
                                  {sec.title}
                                </h4>

                                <div className="space-y-2">
                                  {sec.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-500 w-5">
                                        {itemIdx + 1}.
                                      </span>
                                      <Input
                                        value={item}
                                        onChange={(e) =>
                                          handleMaterialItemChange(mat.id, secIdx, itemIdx, e.target.value)
                                        }
                                        className="text-xs bg-slate-950 border-slate-800 text-slate-200"
                                      />
                                      <button
                                        onClick={() => handleRemoveMaterialItem(mat.id, secIdx, itemIdx)}
                                        className="p-1.5 text-slate-500 hover:text-red-400"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <button
                                  onClick={() => handleAddMaterialItem(mat.id, secIdx)}
                                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 mt-2"
                                >
                                  <Plus className="w-3 h-3" /> Agregar ítem / pregunta
                                </button>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: ACTIVIDADES PRÁCTICAS ── */}
              {activeTab === 'activities' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-white">Actividades Prácticas del Módulo</h3>
                    <p className="text-xs text-slate-400">Instrucciones y pasos de ejercitación para el estudiante</p>
                  </div>

                  {currentModule.activities.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                      Este módulo no tiene actividades prácticas asignadas.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentModule.activities.map((act) => (
                        <Card key={act.id} className="p-5 border-slate-800 bg-slate-950 space-y-3">
                          <Input
                            value={act.title}
                            onChange={(e) =>
                              updateActivity(currentModule.id, act.id, { title: e.target.value })
                            }
                            className="text-sm font-bold text-white bg-slate-900 border-slate-700"
                          />
                          <TextArea
                            value={act.description}
                            onChange={(e) =>
                              updateActivity(currentModule.id, act.id, { description: e.target.value })
                            }
                            rows={2}
                            className="text-xs text-slate-300 bg-slate-900 border-slate-700"
                          />

                          {act.steps && act.steps.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                                Pasos Secuenciales
                              </span>
                              <div className="space-y-1.5">
                                {act.steps.map((st, stIdx) => (
                                  <div key={stIdx} className="flex items-start gap-2 text-xs text-slate-300">
                                    <span className="font-bold text-primary">{stIdx + 1}.</span>
                                    <span>{st}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
