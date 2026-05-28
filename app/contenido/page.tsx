'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/lib/store';
import { SLOT_INFO } from '@/lib/constants';
import { DefinitionItem, RiskSubModule } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import { Plus, Trash2, HelpCircle, Layers, ClipboardEdit } from 'lucide-react';

export default function ContenidoTextual() {
  const { 
    project, 
    toggleSlot, 
    updateSlotFields, 
    toggleRiskModule, 
    updateRiskModule 
  } = useProjectStore();

  const [selectedSlotId, setSelectedSlotId] = useState<string>('SLOT_01');
  const [selectedRiskId, setSelectedRiskId] = useState<string>('08a');

  const selectedSlot = project.slots.find(s => s.id === selectedSlotId);
  const info = SLOT_INFO[selectedSlotId as keyof typeof SLOT_INFO] || { name: 'Escena', description: '' };

  const handleFieldChange = (fieldName: string, value: any) => {
    if (selectedSlot) {
      updateSlotFields(selectedSlotId, { [fieldName]: value });
    }
  };

  // Helper para listas dinámicas (ej. leyes, principios)
  const handleListChange = (fieldName: string, index: number, value: string) => {
    if (selectedSlot) {
      const currentList = [...(selectedSlot.fields[fieldName] as string[] || [])];
      currentList[index] = value;
      updateSlotFields(selectedSlotId, { [fieldName]: currentList });
    }
  };

  const handleAddListItem = (fieldName: string) => {
    if (selectedSlot) {
      const currentList = [...(selectedSlot.fields[fieldName] as string[] || [])];
      currentList.push('');
      updateSlotFields(selectedSlotId, { [fieldName]: currentList });
    }
  };

  const handleRemoveListItem = (fieldName: string, index: number) => {
    if (selectedSlot) {
      const currentList = [...(selectedSlot.fields[fieldName] as string[] || [])];
      currentList.splice(index, 1);
      updateSlotFields(selectedSlotId, { [fieldName]: currentList });
    }
  };

  // Helper para glosario/definiciones (SLOT_04)
  const handleDefinitionChange = (index: number, key: 'term' | 'definition', value: string) => {
    if (selectedSlot) {
      const currentDefs = [...(selectedSlot.fields.definitions as DefinitionItem[] || [])];
      currentDefs[index] = { ...currentDefs[index], [key]: value };
      updateSlotFields(selectedSlotId, { definitions: currentDefs });
    }
  };

  const handleAddDefinition = () => {
    if (selectedSlot) {
      const currentDefs = [...(selectedSlot.fields.definitions as DefinitionItem[] || [])];
      currentDefs.push({ term: '', definition: '' });
      updateSlotFields(selectedSlotId, { definitions: currentDefs });
    }
  };

  const handleRemoveDefinition = (index: number) => {
    if (selectedSlot) {
      const currentDefs = [...(selectedSlot.fields.definitions as DefinitionItem[] || [])];
      currentDefs.splice(index, 1);
      updateSlotFields(selectedSlotId, { definitions: currentDefs });
    }
  };

  // Helper para cambios en riesgos (SLOT_08)
  const activeRisk = selectedSlot?.riskModules?.find(rm => rm.id === selectedRiskId);

  const handleRiskChange = (updates: Partial<RiskSubModule>) => {
    updateRiskModule(selectedRiskId, updates);
  };

  const handleRiskListChange = (key: 'causes' | 'measures', index: number, value: string) => {
    if (activeRisk) {
      const currentList = [...activeRisk[key]];
      currentList[index] = value;
      updateRiskModule(selectedRiskId, { [key]: currentList });
    }
  };

  const handleAddRiskListItem = (key: 'causes' | 'measures') => {
    if (activeRisk) {
      const currentList = [...activeRisk[key]];
      currentList.push('');
      updateRiskModule(selectedRiskId, { [key]: currentList });
    }
  };

  const handleRemoveRiskListItem = (key: 'causes' | 'measures', index: number) => {
    if (activeRisk) {
      const currentList = [...activeRisk[key]];
      currentList.splice(index, 1);
      updateRiskModule(selectedRiskId, { [key]: currentList });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Módulo 2</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contenido Textual</h1>
        <p className="text-sm text-slate-400">
          Personalizá los textos predefinidos para adaptarlos a la actividad del cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Escenas List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider px-2">Escenas del Tutorial</h2>
            
            <div className="space-y-1">
              {project.slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const slotInfo = SLOT_INFO[slot.id as keyof typeof SLOT_INFO] || { name: slot.title, description: '' };
                
                return (
                  <div
                    key={slot.id}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-white shadow-[0_0_10px_rgba(0,153,139,0.05)]'
                        : 'bg-transparent border-slate-900/30 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedSlotId(slot.id)}
                      className="flex-1 text-left flex items-start space-x-2.5 overflow-hidden"
                    >
                      <div className="w-5 h-5 shrink-0 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {slot.id.replace('SLOT_', '')}
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{slotInfo.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{slotInfo.description}</p>
                      </div>
                    </button>

                    <div className="ml-2 shrink-0">
                      <Toggle
                        checked={slot.active}
                        onChange={(checked) => toggleSlot(slot.id, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Side: Editor Panel (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSlot ? (
            <Card className="space-y-6">
              {/* Header Editor */}
              <div className="pb-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                      {selectedSlot.id}
                    </span>
                    <h2 className="text-lg font-bold text-white leading-none">{info.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{info.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Escena Incluida:</span>
                  <Toggle
                    checked={selectedSlot.active}
                    onChange={(checked) => toggleSlot(selectedSlot.id, checked)}
                  />
                </div>
              </div>

              {/* Form Fields depend on slot type */}
              {!selectedSlot.active ? (
                <div className="p-8 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800/80">
                  <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <h3 className="font-semibold text-slate-400 text-sm mt-3">Esta escena está desactivada</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Activala usando el botón superior para editar y renderizar su contenido en el video.</p>
                  <Button 
                    className="mt-4" 
                    size="sm" 
                    variant="ghost"
                    onClick={() => toggleSlot(selectedSlot.id, true)}
                  >
                    Activar Escena
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Título y Subtítulo para Portada */}
                  {selectedSlot.id === 'SLOT_01' && (
                    <div className="space-y-4">
                      <Input
                        label="Título del Tutorial"
                        value={selectedSlot.fields.title as string || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Ingrese el título principal"
                      />
                      <Input
                        label="Subtítulo / Bajada"
                        value={selectedSlot.fields.subtitle as string || ''}
                        onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                        placeholder="Ingrese el subtítulo"
                      />
                    </div>
                  )}

                  {/* Objetivos */}
                  {selectedSlot.id === 'SLOT_02' && (
                    <TextArea
                      label="Texto de Objetivos"
                      value={selectedSlot.fields.objectivesText as string || ''}
                      onChange={(e) => handleFieldChange('objectivesText', e.target.value)}
                      placeholder="Ingrese los objetivos del curso"
                      rows={5}
                    />
                  )}

                  {/* Marco Legal */}
                  {selectedSlot.id === 'SLOT_03' && (
                    <div className="space-y-5">
                      <TextArea
                        label="Descripción del Marco Legal"
                        value={selectedSlot.fields.description as string || ''}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        placeholder="Descripción introductoria"
                        rows={3}
                      />
                      
                      {/* Dynamic List for laws */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leyes / Decretos Aplicables</label>
                        <div className="space-y-2">
                          {(selectedSlot.fields.laws as string[] || []).map((law, idx) => (
                            <div key={idx} className="flex space-x-2">
                              <Input
                                value={law}
                                onChange={(e) => handleListChange('laws', idx, e.target.value)}
                                placeholder={`Norma #${idx + 1}`}
                                className="flex-1"
                              />
                              <Button
                                variant="danger"
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none shrink-0"
                                onClick={() => handleRemoveListItem('laws', idx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => handleAddListItem('laws')}
                        >
                          Añadir Ley
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Definiciones Clave */}
                  {selectedSlot.id === 'SLOT_04' && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Glosario de Conceptos</label>
                      <div className="space-y-4">
                        {(selectedSlot.fields.definitions as DefinitionItem[] || []).map((def, idx) => (
                          <div key={idx} className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-3 relative">
                            <button
                              onClick={() => handleRemoveDefinition(idx)}
                              className="absolute top-3 right-3 text-slate-500 hover:text-rose-400"
                              title="Eliminar definición"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <Input
                              label="Término / Palabra Clave"
                              value={def.term}
                              onChange={(e) => handleDefinitionChange(idx, 'term', e.target.value)}
                              placeholder="Ej: Accidente"
                            />
                            <TextArea
                              label="Significado / Definición"
                              value={def.definition}
                              onChange={(e) => handleDefinitionChange(idx, 'definition', e.target.value)}
                              placeholder="Ej: Acontecimiento inesperado que produce..."
                              rows={2.5}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={handleAddDefinition}
                      >
                        Añadir Definición
                      </Button>
                    </div>
                  )}

                  {/* Razones para la Prevención */}
                  {selectedSlot.id === 'SLOT_05' && (
                    <div className="space-y-4">
                      <TextArea
                        label="Razón Moral / Ética"
                        value={selectedSlot.fields.moral as string || ''}
                        onChange={(e) => handleFieldChange('moral', e.target.value)}
                        placeholder="El trabajo no debe perjudicar la salud..."
                        rows={2}
                      />
                      <TextArea
                        label="Razón Legal"
                        value={selectedSlot.fields.legal as string || ''}
                        onChange={(e) => handleFieldChange('legal', e.target.value)}
                        placeholder="Es obligación del empleador..."
                        rows={2}
                      />
                      <TextArea
                        label="Razón Económica"
                        value={selectedSlot.fields.economic as string || ''}
                        onChange={(e) => handleFieldChange('economic', e.target.value)}
                        placeholder="Los accidentes reducen utilidades..."
                        rows={2}
                      />
                      <TextArea
                        label="Razón Competitiva / Reputación"
                        value={selectedSlot.fields.competitive as string || ''}
                        onChange={(e) => handleFieldChange('competitive', e.target.value)}
                        placeholder="Mejora la productividad..."
                        rows={2}
                      />
                    </div>
                  )}

                  {/* Principios Clave */}
                  {selectedSlot.id === 'SLOT_06' && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Principios de Seguridad</label>
                      <div className="space-y-2">
                        {(selectedSlot.fields.principles as string[] || []).map((principle, idx) => (
                          <div key={idx} className="flex space-x-2">
                            <TextArea
                              value={principle}
                              onChange={(e) => handleListChange('principles', idx, e.target.value)}
                              placeholder={`Principio #${idx + 1}`}
                              className="flex-1"
                              rows={2}
                            />
                            <Button
                              variant="danger"
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none shrink-0 self-start"
                              onClick={() => handleRemoveListItem('principles', idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => handleAddListItem('principles')}
                      >
                        Añadir Principio
                      </Button>
                    </div>
                  )}

                  {/* Gestión y Roles */}
                  {selectedSlot.id === 'SLOT_07' && (
                    <div className="space-y-4">
                      <TextArea
                        label="Gestión de la Prevención"
                        value={selectedSlot.fields.managementDescription as string || ''}
                        onChange={(e) => handleFieldChange('managementDescription', e.target.value)}
                        placeholder="Descripción general"
                        rows={2.5}
                      />
                      <TextArea
                        label="Análisis de Peligros"
                        value={selectedSlot.fields.dangerAnalysis as string || ''}
                        onChange={(e) => handleFieldChange('dangerAnalysis', e.target.value)}
                        placeholder="Explicación del área de riesgo..."
                        rows={2}
                      />
                      <TextArea
                        label="Jerarquía de Controles"
                        value={selectedSlot.fields.hierarchyOfControls as string || ''}
                        onChange={(e) => handleFieldChange('hierarchyOfControls', e.target.value)}
                        placeholder="1. Eliminar, 2. Sustituir..."
                        rows={2}
                      />
                      
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Organigrama y Responsabilidades</label>
                        <div className="space-y-2">
                          {(selectedSlot.fields.responsibilities as string[] || []).map((resp, idx) => (
                            <div key={idx} className="flex space-x-2">
                              <Input
                                value={resp}
                                onChange={(e) => handleListChange('responsibilities', idx, e.target.value)}
                                placeholder="Puesto: Responsabilidad"
                                className="flex-1"
                              />
                              <Button
                                variant="danger"
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none shrink-0"
                                onClick={() => handleRemoveListItem('responsibilities', idx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => handleAddListItem('responsibilities')}
                        >
                          Añadir Responsabilidad
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Módulos de Riesgo (SLOT_08) */}
                  {selectedSlot.id === 'SLOT_08' && (
                    <div className="space-y-6">
                      {/* Sub-tabs for specific risks */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Riesgos Específicos Habilitados</label>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {selectedSlot.riskModules?.map((mod) => (
                            <div 
                              key={mod.id} 
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                                mod.id === selectedRiskId 
                                  ? 'bg-primary/10 border-primary text-white' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                              onClick={() => setSelectedRiskId(mod.id)}
                            >
                              <span className="truncate">{mod.name}</span>
                              <Toggle
                                checked={mod.active}
                                onChange={(checked) => toggleRiskModule(mod.id, checked)}
                                className="scale-75 origin-right"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Editing Active Risk details */}
                      {activeRisk ? (
                        <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-5">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Módulo {activeRisk.id}</span>
                              <h3 className="text-sm font-bold text-white mt-0.5">{activeRisk.name}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400">Riesgo Activo:</span>
                              <Toggle
                                checked={activeRisk.active}
                                onChange={(checked) => toggleRiskModule(activeRisk.id, checked)}
                              />
                            </div>
                          </div>

                          {!activeRisk.active ? (
                            <div className="py-8 text-center">
                              <HelpCircle className="w-6 h-6 text-slate-600 mx-auto" />
                              <p className="text-xs text-slate-500 mt-2">Este riesgo específico está desactivado y no saldrá en el video.</p>
                            </div>
                          ) : (
                            <div className="space-y-5">
                              <Input
                                label="Nombre del Riesgo"
                                value={activeRisk.name}
                                onChange={(e) => handleRiskChange({ name: e.target.value })}
                                placeholder="Nombre descriptivo"
                              />

                              {/* Causes list */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Causas del Riesgo</label>
                                <div className="space-y-2">
                                  {activeRisk.causes.map((cause, idx) => (
                                    <div key={idx} className="flex space-x-2">
                                      <Input
                                        value={cause}
                                        onChange={(e) => handleRiskListChange('causes', idx, e.target.value)}
                                        placeholder="Causa de riesgo"
                                        className="flex-1"
                                      />
                                      <Button
                                        variant="danger"
                                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none shrink-0"
                                        onClick={() => handleRemoveRiskListItem('causes', idx)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Plus className="w-3.5 h-3.5" />}
                                  onClick={() => handleAddRiskListItem('causes')}
                                >
                                  Añadir Causa
                                </Button>
                              </div>

                              {/* Measures list */}
                              <div className="space-y-2 pt-2 border-t border-slate-800">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Medidas Preventivas</label>
                                <div className="space-y-2">
                                  {activeRisk.measures.map((measure, idx) => (
                                    <div key={idx} className="flex space-x-2">
                                      <TextArea
                                        value={measure}
                                        onChange={(e) => handleRiskListChange('measures', idx, e.target.value)}
                                        placeholder="Medida preventiva"
                                        className="flex-1"
                                        rows={2}
                                      />
                                      <Button
                                        variant="danger"
                                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none shrink-0 self-start"
                                        onClick={() => handleRemoveRiskListItem('measures', idx)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<Plus className="w-3.5 h-3.5" />}
                                  onClick={() => handleAddRiskListItem('measures')}
                                >
                                  Añadir Medida
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          Seleccioná un riesgo para editar sus causas y medidas preventivas.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tips Finales */}
                  {selectedSlot.id === '09' && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lista de Recomendaciones</label>
                      <div className="space-y-2">
                        {(selectedSlot.fields.tips as string[] || []).map((tip, idx) => (
                          <div key={idx} className="flex space-x-2">
                            <TextArea
                              value={tip}
                              onChange={(e) => handleListChange('tips', idx, e.target.value)}
                              placeholder={`Recomendación #${idx + 1}`}
                              className="flex-1"
                              rows={2}
                            />
                            <Button
                              variant="danger"
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none shrink-0 self-start"
                              onClick={() => handleRemoveListItem('tips', idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => handleAddListItem('tips')}
                      >
                        Añadir Tip
                      </Button>
                    </div>
                  )}

                  {/* Cierre */}
                  {selectedSlot.id === 'SLOT_10' && (
                    <div className="space-y-4">
                      <TextArea
                        label="Mensaje de Cierre / Despedida"
                        value={selectedSlot.fields.closingMessage as string || ''}
                        onChange={(e) => handleFieldChange('closingMessage', e.target.value)}
                        placeholder="Ingrese el mensaje de cierre"
                        rows={3}
                      />
                      <Input
                        label="Dirección Web"
                        value={selectedSlot.fields.web as string || ''}
                        onChange={(e) => handleFieldChange('web', e.target.value)}
                        placeholder="Ej: artprevencionsmg.com.ar"
                      />
                      <Input
                        label="Texto Secundario de Cierre"
                        value={selectedSlot.fields.brandText as string || ''}
                        onChange={(e) => handleFieldChange('brandText', e.target.value)}
                        placeholder="Ej: Sistema de Autoprotección"
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
              <ClipboardEdit className="w-12 h-12 text-slate-600 mb-2" />
              Seleccioná una escena del menú lateral para editar su contenido textual.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
