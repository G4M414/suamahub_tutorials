'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useProjectStore } from '@/lib/store';
import { useUiStore } from '@/lib/ui-store';
import { AVAILABLE_FONTS, DEFAULT_BRANDS } from '@/lib/constants';
import { NotionClient } from '@/lib/types';
import ColorPicker from '@/components/ui/ColorPicker';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Upload, Trash2, ShieldAlert, Sparkles, Loader2, Users, RefreshCw, ExternalLink } from 'lucide-react';

export default function IdentidadVisual() {
  const { project, updateColors, updateFont, updateLogo, setClientName, setCompanyName, setIndustry, setSecondaryText, loadClientIdentity, applyNotionAssets, clearClientAssets } = useProjectStore();
  const { setSuppressSave, setDirty } = useUiStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(project.identity.logoUrl);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // ── Cargar cliente desde Notion (Notion → Dashboard) ──
  const [clients, setClients] = useState<NotionClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    setClientsError(null);
    try {
      const res = await fetch('/api/notion/clients');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al leer Notion');
      setClients(data.clients ?? []);
    } catch (err) {
      setClientsError(err instanceof Error ? err.message : 'Error al leer Notion');
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Brands default del sistema (SUAMA, BIORISK) + clientes de Notion.
  // Mismo comportamiento para todos. Los defaults son autoritativos para su
  // identidad (assets locales curados): si Notion trae un registro con el mismo
  // nombre, gana el default (evita logos rotos / datos incompletos en Notion).
  const selectableClients = useMemo(() => {
    const defaultNames = new Set(DEFAULT_BRANDS.map(b => b.clientName.trim().toLowerCase()));
    const notionExtra = clients.filter(c => !defaultNames.has(c.clientName.trim().toLowerCase()));
    return [...DEFAULT_BRANDS, ...notionExtra];
  }, [clients]);

  // El <select> usa estado local, que se pierde al navegar entre secciones.
  // Re-derivamos la selección desde el cliente cargado en el proyecto, así el
  // dropdown sigue mostrando al cliente activo al volver a esta pantalla.
  useEffect(() => {
    if (selectedClientId) return;
    const target = project.clientName.trim().toLowerCase();
    if (!target) return;
    const match = selectableClients.find(c => c.clientName.trim().toLowerCase() === target);
    if (match) setSelectedClientId(match.pageId);
  }, [selectableClients, project.clientName, selectedClientId]);

  const handleSelectClient = async (pageId: string) => {
    const client = selectableClients.find(c => c.pageId === pageId);
    if (!client) return;

    // GUARDIA: si hay cambios sin guardar del cliente actual, avisar antes de
    // cambiar (no se pierde nada sin tu OK).
    const current = project.clientName?.trim();
    if (useUiStore.getState().dirty && current && current !== 'SUAMA Demo Client' && current !== client.clientName) {
      const save = confirm(
        `Tenés cambios sin guardar de "${current}".\n\n` +
        `Aceptar = guardarlos en Notion antes de cambiar.\n` +
        `Cancelar = cambiar de cliente y descartarlos.`
      );
      if (save) {
        try {
          await fetch('/api/notion/sync', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project, estado: 'Borrador' }),
          });
        } catch { /* si falla el guardado, seguimos igual con el cambio */ }
      }
    }

    setSelectedClientId(pageId);
    setRestoreMsg(null);
    // Pausar el autoguardado mientras limpiamos y recargamos: así nunca se sube
    // a Notion un estado a medias (vacío) durante la transición.
    setSuppressSave(true);
    setDirty(false);
    try {
      // 0) Limpiar los assets del cliente anterior (imágenes/videos + audio).
      //    Si este cliente no tiene links en Notion, queda vacío en vez de
      //    heredar los medios del cliente previo. Los pasos 2 y 3 repueblan lo
      //    que SÍ exista para este cliente.
      clearClientAssets();
      // 1) Identidad visual (logo, colores, tipografía)
      loadClientIdentity(client);
      setLogoPreview(client.logoUrl ?? project.identity.logoUrl);
      // 2) Assets por módulo: lee las filas de Notion (Link Drive + Audio de cada
      //    módulo) y los mete en los medios/audio de la app. Notion es la BBDD:
      //    elegir el cliente repuebla todos sus assets guardados.
      const ar = await fetch(`/api/notion/load-assets?clientName=${encodeURIComponent(client.clientName)}&tutorialId=${project.tutorialId}`);
      const adata = await ar.json();
      const count = adata.assets ? Object.keys(adata.assets).length : 0;
      if (count > 0) {
        applyNotionAssets(adata.assets);
        setRestoreMsg(`✓ ${client.clientName}: ${count} módulo(s) con assets cargados desde Notion`);
        setTimeout(() => setRestoreMsg(null), 6000);
      }
    } catch {
      /* si falla, queda al menos la identidad cargada */
    } finally {
      // Reanudar el autoguardado. Como no se modificó dirty acá, no dispara un
      // guardado extra; sólo lo hará el próximo cambio real del usuario.
      setSuppressSave(false);
      setDirty(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    updateLogo(localUrl);

    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('clientName', project.clientName || 'Sin nombre');
      fd.append('subfolder', 'Logo');

      const res = await fetch('/api/drive/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Reemplazar blob URL con la URL permanente de Drive
      setLogoPreview(data.url);
      updateLogo(data.url);
    } catch (err) {
      console.error('Logo upload error:', err);
      // Mantener el preview local aunque falle Drive
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const DEFAULT_LOGO = '/logo-suama.jpg';

  const handleRemoveLogo = () => {
    setLogoPreview(DEFAULT_LOGO);
    updateLogo(DEFAULT_LOGO);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Atajos de brand: aplican la identidad COMPLETA del default (igual que el selector).


  const colors = project.identity.colors;
  const currentFont = AVAILABLE_FONTS.find(f => f.id === project.identity.fontFamily) || AVAILABLE_FONTS[0];

  // Estilo dinámico para la tipografía en la vista previa
  const getFontFamilyStyle = () => {
    if (project.identity.fontFamily === 'harabara') return 'font-sans tracking-wide font-extrabold';
    if (project.identity.fontFamily === 'kiona') return 'font-mono uppercase font-light tracking-widest';
    if (project.identity.fontFamily === 'lato') return 'font-sans font-bold tracking-tight';
    if (project.identity.fontFamily === 'roboto') return 'font-sans font-normal';
    if (project.identity.fontFamily === 'outfit') return 'font-sans font-semibold';
    return 'font-sans';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Módulo 1</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Identidad Visual</h1>
          <p className="text-sm text-slate-400">
            Definí los elementos que darán personalidad al video tutorial del cliente.
          </p>
        </div>
      </div>

      {/* Cargar cliente desde Notion */}
      <Card className="space-y-3 border-primary/20 bg-primary/[0.03]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cargar Cliente Existente</h2>
          </div>
          <button
            onClick={fetchClients}
            disabled={loadingClients}
            className="text-[11px] flex items-center gap-1 text-slate-400 hover:text-primary transition disabled:opacity-50"
            title="Refrescar lista desde Notion"
          >
            <RefreshCw className={`w-3 h-3 ${loadingClients ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Elegí un cliente guardado en Notion: carga su identidad visual y restaura automáticamente su último proyecto guardado (imágenes, voz y textos) si existe.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={e => handleSelectClient(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors disabled:opacity-50"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" style={{ background: '#020617', color: '#94a3b8' }}>
              {loadingClients ? 'Cargando clientes…' : '— Seleccionar cliente —'}
            </option>
            {(['Plataforma', 'Partner', 'Cliente'] as const).map(grupo => {
              const items = selectableClients.filter(c => (c.tipo || 'Cliente') === grupo);
              if (items.length === 0) return null;
              return (
                <optgroup key={grupo} label={grupo} style={{ background: '#0f172a', color: '#64748b' }}>
                  {items.map(c => (
                    <option key={c.pageId} value={c.pageId} style={{ background: '#020617', color: '#f1f5f9' }}>
                      {c.clientName}{c.companyName ? ` · ${c.companyName}` : ''}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        {clientsError && (
          <p className="text-xs text-rose-400">⚠ {clientsError}</p>
        )}
        {restoreMsg && (
          <p className="text-xs text-primary font-semibold">{restoreMsg}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Datos del cliente — Notion sync */}
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Datos del Cliente</h2>
            <p className="text-xs text-slate-400">
              Estos datos se guardan automáticamente en Notion al generar el video.
            </p>
            <div className="space-y-3">
              <Input
                label="Nombre del cliente"
                placeholder="Ej: Hotel Sheraton"
                value={project.clientName}
                onChange={e => setClientName(e.target.value)}
              />
              <Input
                label="Empresa / Razón social"
                placeholder="Ej: Starwood Hotels SA"
                value={project.companyName}
                onChange={e => setCompanyName(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Industria</label>
                <select
                  value={project.industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                  style={{ colorScheme: 'dark' }}
                >
                  {['Hotel', 'Restaurante', 'Empresa genérica', 'Construcción', 'Salud', 'Educación', 'Otro'].map(opt => (
                    <option key={opt} value={opt} style={{ backgroundColor: '#020617', color: 'white' }}>{opt}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Texto Secundario"
                placeholder="Ej: Capacitación obligatoria · Sistema de Autoprotección"
                value={project.identity.secondaryText ?? ''}
                onChange={e => setSecondaryText(e.target.value)}
              />
              {project.identity.assetsFolderUrl && (
                <a
                  href={project.identity.assetsFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir carpeta de Assets en Drive
                </a>
              )}
            </div>
          </Card>

          {/* Logo Card */}
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Logotipo del Cliente</h2>
            <p className="text-xs text-slate-400">Este logotipo aparecerá en la portada, cierre y de forma discreta en las diapositivas.</p>
            
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {logoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    <button 
                      onClick={handleRemoveLogo}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-500 transition-opacity duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <span className="text-[10px] text-slate-500 font-bold">SIN LOGO</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                  id="logo-upload-input"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isUploadingLogo}
                  icon={isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                >
                  {isUploadingLogo ? 'Subiendo a Drive…' : 'Subir PNG / SVG'}
                </Button>
                {logoPreview && (
                  <Button
                    onClick={handleRemoveLogo}
                    variant="danger"
                    size="sm"
                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-none"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remover Logo
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Colors Card */}
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Paleta de Colores</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSelectClient('default-suama')}
                  className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded font-semibold transition"
                  title="Aplicar identidad de marca SUAMA"
                >
                  SUAMA
                </button>
                <button
                  onClick={() => handleSelectClient('default-biorisk')}
                  className="text-[10px] bg-[#277f29]/10 hover:bg-[#277f29]/20 text-[#7a9c59] border border-[#277f29]/20 px-2 py-1 rounded font-semibold transition"
                  title="Aplicar identidad de marca Biorisk"
                >
                  Biorisk
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker 
                label="Color Primario" 
                color={colors.primary} 
                onChange={(c) => updateColors({ primary: c })} 
              />
              <ColorPicker 
                label="Color Secundario" 
                color={colors.secondary} 
                onChange={(c) => updateColors({ secondary: c })} 
              />
              <ColorPicker 
                label="Color Acento" 
                color={colors.accent} 
                onChange={(c) => updateColors({ accent: c })} 
              />
              <ColorPicker 
                label="Fondo Slides" 
                color={colors.background} 
                onChange={(c) => updateColors({ background: c })} 
              />
            </div>
            
            <div className="pt-2 border-t border-slate-800/60">
              <ColorPicker 
                label="Color del Texto" 
                color={colors.text} 
                onChange={(c) => updateColors({ text: c })} 
              />
            </div>
          </Card>

          {/* Typography Card */}
          <Card className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tipografía</h2>
            <p className="text-xs text-slate-400">Seleccioná la fuente preestablecida que se usará para los títulos y contenidos.</p>
            
            <div className="space-y-2">
              {AVAILABLE_FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => updateFont(font.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    project.identity.fontFamily === font.id
                      ? 'bg-primary/10 border-primary text-white shadow-[0_0_10px_rgba(0,153,139,0.1)]'
                      : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-medium">{font.name}</span>
                  <span className="text-xs font-mono opacity-65">Abc</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Vista Previa de Diapositiva (16:9)
            </h2>
            <span className="text-xs text-slate-500 font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
              Simulador Real-Time
            </span>
          </div>

          <Card className="p-0 border border-slate-800/80 shadow-2xl overflow-hidden">
            {/* The 16:9 slide container */}
            <div 
              className="w-full aspect-video relative flex flex-col justify-between p-8 md:p-12 transition-all duration-300 shadow-inner"
              style={{ backgroundColor: colors.background }}
            >
              {/* Header Corner Logo */}
              <div className="flex justify-between items-start">
                <div className="h-11 md:h-12 flex items-center">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo corner" className="h-full w-auto max-w-[240px] object-contain object-left" />
                  ) : (
                    <div className="flex items-center space-x-1.5 opacity-60">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: colors.primary }} />
                      <span className="text-xs font-bold" style={{ color: colors.text }}>Logo Cliente</span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] tracking-widest font-semibold opacity-40 uppercase" style={{ color: colors.text }}>
                  {project.projectName ? project.projectName : 'Prevención de Riesgos'}
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-4 my-auto max-w-xl">
                <div 
                  className={`text-xs font-bold uppercase tracking-wider w-fit px-2 py-0.5 rounded`}
                  style={{ backgroundColor: colors.accent, color: colors.background }}
                >
                  PREVENCIÓN DE RIESGOS
                </div>
                <h1 
                  className={`text-2xl md:text-4xl leading-tight ${getFontFamilyStyle()}`}
                  style={{ color: colors.primary }}
                >
                  {project.slots.find(s => s.id === 'SLOT_01')?.fields.title as string || 'Prevención de riesgos en hoteles y restaurantes'}
                </h1>
                <p 
                  className="text-xs md:text-sm font-medium opacity-80"
                  style={{ color: colors.text }}
                >
                  {project.slots.find(s => s.id === 'SLOT_01')?.fields.subtitle as string || 'Capacitación obligatoria de higiene y seguridad'}
                </p>
              </div>

              {/* Footer slide decorative bar */}
              <div className="flex justify-between items-center pt-4 border-t border-dashed" style={{ borderColor: `${colors.text}1c` }}>
                <span className="text-[9px] font-semibold tracking-wider opacity-65" style={{ color: colors.text }}>
                  {project.clientName}
                </span>
                
                {/* Visual accent blocks */}
                <div className="flex space-x-1">
                  <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <div className="w-2 h-1.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
                  <div className="w-2 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Info Banner */}
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-300">Nota sobre el formato final:</p>
              <p>El renderizador de video de Shotstack interpretará estos colores hexadecimales y tipografías para generar las plantillas de video finales con una resolución HD de 1920x1080.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
