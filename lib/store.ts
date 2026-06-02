import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ColorPalette, Slot, MediaItem, RiskSubModule, NotionClient } from './types';
import { mockProjectTutorial01, mockProjectTutorial02 } from './mock-data';

interface ProjectStore {
  project: Project;
  
  // Setters
  setProjectName: (name: string) => void;
  setClientName: (name: string) => void;
  setCompanyName: (name: string) => void;
  setIndustry: (industry: string) => void;
  
  // Identity
  updateColors: (colors: Partial<ColorPalette>) => void;
  updateFont: (font: string) => void;
  updateLogo: (logoUrl: string | null) => void;
  setSecondaryText: (text: string) => void;
  loadClientIdentity: (client: NotionClient) => void;
  loadProjectState: (state: Partial<Project>) => void;
  applyNotionAssets: (assets: Record<string, { linkDrive: string | null; audioUrl: string | null }>) => void;
  clearClientAssets: () => void;
  
  // Slots
  toggleSlot: (slotId: string, active: boolean) => void;
  updateSlotFields: (slotId: string, fields: Record<string, any>) => void;
  
  // Risk Modules
  toggleRiskModule: (moduleId: string, active: boolean) => void;
  updateRiskModule: (moduleId: string, updates: Partial<RiskSubModule>) => void;
  
  // Media
  updateMedia: (placeholderId: string, updates: Partial<MediaItem>) => void;
  
  // Voice Script
  updateVoiceScript: (slotId: string, script: string) => void;
  setVoiceAudioUrl: (slotId: string, url: string | null) => void;
  
  // Render
  setRenderStatus: (status: 'idle' | 'rendering' | 'success' | 'failed', progress?: number) => void;
  
  // Reset
  resetToDemo: () => void;
  loadTutorial: (tutorialId: 'tutorial_01' | 'tutorial_02') => void;
  fillMissingScripts: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      project: { ...mockProjectTutorial01 },
      
      setProjectName: (name) =>
        set((state) => ({
          project: { ...state.project, projectName: name },
        })),
        
      setClientName: (name) =>
        set((state) => ({
          project: { ...state.project, clientName: name },
        })),

      setCompanyName: (name) =>
        set((state) => ({
          project: { ...state.project, companyName: name },
        })),

      setIndustry: (industry) =>
        set((state) => ({
          project: { ...state.project, industry },
        })),
        
      updateColors: (colors) =>
        set((state) => ({
          project: {
            ...state.project,
            identity: {
              ...state.project.identity,
              colors: { ...state.project.identity.colors, ...colors },
            },
          },
        })),
        
      updateFont: (font) =>
        set((state) => ({
          project: {
            ...state.project,
            identity: { ...state.project.identity, fontFamily: font },
          },
        })),
        
      updateLogo: (logoUrl) =>
        set((state) => ({
          project: {
            ...state.project,
            identity: { ...state.project.identity, logoUrl },
          },
        })),
        
      setSecondaryText: (text) =>
        set((state) => ({
          project: {
            ...state.project,
            identity: { ...state.project.identity, secondaryText: text },
          },
        })),

      // Carga la identidad de un cliente desde Notion.
      // Quirúrgico: solo pisa datos del cliente + identidad visual.
      // NO toca slots, media, voiceScript ni tutorialId (el contenido se conserva).
      loadClientIdentity: (client) =>
        set((state) => ({
          project: {
            ...state.project,
            clientName: client.clientName || state.project.clientName,
            companyName: client.companyName || state.project.companyName,
            industry: client.industry || state.project.industry,
            identity: {
              ...state.project.identity,
              logoUrl: client.logoUrl ?? state.project.identity.logoUrl,
              fontFamily: client.fontFamily || state.project.identity.fontFamily,
              colors: { ...state.project.identity.colors, ...client.colors },
              secondaryText: client.secondaryText ?? state.project.identity.secondaryText ?? '',
              assetsFolderUrl: client.assetsFolderUrl ?? state.project.identity.assetsFolderUrl,
            },
          },
        })),

      // Restaura el estado COMPLETO de un proyecto guardado en Notion
      // (imágenes, voz, audio, slots, identidad). Reemplaza, no mergea.
      loadProjectState: (s) =>
        set((cur) => ({
          project: {
            ...cur.project,
            ...(s.projectName !== undefined ? { projectName: s.projectName } : {}),
            ...(s.clientName !== undefined ? { clientName: s.clientName } : {}),
            ...(s.companyName !== undefined ? { companyName: s.companyName } : {}),
            ...(s.industry !== undefined ? { industry: s.industry } : {}),
            ...(s.tutorialId !== undefined ? { tutorialId: s.tutorialId } : {}),
            ...(s.identity ? { identity: s.identity } : {}),
            ...(s.slots ? { slots: s.slots } : {}),
            ...(s.media ? { media: s.media } : {}),
            ...(s.voiceScript ? { voiceScript: s.voiceScript } : {}),
            ...(s.voiceAudioUrls ? { voiceAudioUrls: s.voiceAudioUrls } : {}),
          },
        })),

      // Aplica los assets por módulo traídos de Notion (filas con Link Drive).
      // Mapea moduleName → placeholder/slotId con el MISMO criterio que el sync:
      //   slots normales: Nombre interno = slot.title; placeholder SLOT_01→portada_img,
      //   SLOT_02→objetivos_img (o slot.mediaId); audio → voiceAudioUrls[slot.id]
      //   módulos de riesgo: Nombre interno = rm.name; placeholder = rm.mediaId; audio → rm.id
      applyNotionAssets: (assets) =>
        set((state) => {
          const media = { ...state.project.media };
          const voiceAudioUrls = { ...state.project.voiceAudioUrls };

          const setMedia = (placeholderId: string, url: string) => {
            const existing = media[placeholderId];
            media[placeholderId] = existing
              ? { ...existing, url }
              : { id: `media_${placeholderId}_${Date.now()}`, placeholderId, type: 'image', source: 'upload', url };
          };

          for (const slot of state.project.slots) {
            if (slot.id === 'SLOT_08' && slot.riskModules) {
              for (const rm of slot.riskModules) {
                const a = assets[rm.name];
                if (!a) continue;
                if (a.linkDrive) setMedia(rm.mediaId, a.linkDrive);
                if (a.audioUrl) voiceAudioUrls[rm.id] = a.audioUrl;
              }
            } else {
              const a = assets[slot.title];
              if (!a) continue;
              const mediaId = slot.id === 'SLOT_01' ? 'portada_img'
                            : slot.id === 'SLOT_02' ? 'objetivos_img'
                            : slot.mediaId ?? null;
              if (mediaId && a.linkDrive) setMedia(mediaId, a.linkDrive);
              if (a.audioUrl) voiceAudioUrls[slot.id] = a.audioUrl;
            }
          }

          return { project: { ...state.project, media, voiceAudioUrls } };
        }),

      // Limpia los assets propios del cliente anterior (imágenes/videos + audios)
      // dejando el contenido textual y la estructura de slots intactos.
      // Se llama al cambiar de cliente: así un cliente sin links en Notion queda
      // efectivamente vacío en vez de heredar los medios del cliente previo.
      clearClientAssets: () =>
        set((state) => {
          const media: Record<string, MediaItem> = {};
          for (const [key, item] of Object.entries(state.project.media)) {
            media[key] = { ...item, url: null, generationStatus: 'idle' };
          }
          return { project: { ...state.project, media, voiceAudioUrls: {} } };
        }),

      toggleSlot: (slotId, active) =>
        set((state) => ({
          project: {
            ...state.project,
            slots: state.project.slots.map((slot) =>
              slot.id === slotId ? { ...slot, active } : slot
            ),
          },
        })),
        
      updateSlotFields: (slotId, fields) =>
        set((state) => ({
          project: {
            ...state.project,
            slots: state.project.slots.map((slot) =>
              slot.id === slotId
                ? { ...slot, fields: { ...slot.fields, ...fields } }
                : slot
            ),
          },
        })),
        
      toggleRiskModule: (moduleId, active) =>
        set((state) => ({
          project: {
            ...state.project,
            slots: state.project.slots.map((slot) => {
              if (slot.id === 'SLOT_08' && slot.riskModules) {
                return {
                  ...slot,
                  riskModules: slot.riskModules.map((mod) =>
                    mod.id === moduleId ? { ...mod, active } : mod
                  ),
                };
              }
              return slot;
            }),
          },
        })),
        
      updateRiskModule: (moduleId, updates) =>
        set((state) => ({
          project: {
            ...state.project,
            slots: state.project.slots.map((slot) => {
              if (slot.id === 'SLOT_08' && slot.riskModules) {
                return {
                  ...slot,
                  riskModules: slot.riskModules.map((mod) =>
                    mod.id === moduleId ? { ...mod, ...updates } : mod
                  ),
                };
              }
              return slot;
            }),
          },
        })),
        
      updateMedia: (placeholderId, updates) =>
        set((state) => {
          const currentMedia = state.project.media[placeholderId] || {
            id: `media_${placeholderId}_${Date.now()}`,
            placeholderId,
            type: 'image',
            source: 'upload',
            url: null,
          };
          return {
            project: {
              ...state.project,
              media: {
                ...state.project.media,
                [placeholderId]: { ...currentMedia, ...updates },
              },
            },
          };
        }),
        
      updateVoiceScript: (slotId, script) =>
        set((state) => ({
          project: {
            ...state.project,
            voiceScript: {
              ...state.project.voiceScript,
              [slotId]: script,
            },
          },
        })),
        
      setVoiceAudioUrl: (slotId, url) =>
        set((state) => ({
          project: {
            ...state.project,
            voiceAudioUrls: url
              ? { ...state.project.voiceAudioUrls, [slotId]: url }
              : Object.fromEntries(
                  Object.entries(state.project.voiceAudioUrls).filter(([k]) => k !== slotId)
                ),
          },
        })),
        
      setRenderStatus: (status, progress = 0) =>
        set((state) => ({
          project: {
            ...state.project,
            renderStatus: status,
            renderProgress: progress,
          },
        })),
        
      resetToDemo: () =>
        set(() => ({
          project: JSON.parse(JSON.stringify(mockProjectTutorial01)),
        })),

      loadTutorial: (tutorialId) =>
        set(() => ({
          project: JSON.parse(
            JSON.stringify(
              tutorialId === 'tutorial_01'
                ? mockProjectTutorial01
                : mockProjectTutorial02
            )
          ),
        })),

      fillMissingScripts: () =>
        set((state) => {
          const template = state.project.tutorialId === 'tutorial_01'
            ? mockProjectTutorial01
            : mockProjectTutorial02;
          const filled: Record<string, string> = {};
          for (const [key, val] of Object.entries(template.voiceScript)) {
            if (!state.project.voiceScript[key]?.trim()) {
              filled[key] = val as string;
            }
          }
          if (Object.keys(filled).length === 0) return state;
          return {
            project: {
              ...state.project,
              voiceScript: { ...state.project.voiceScript, ...filled },
            },
          };
        }),
    }),
    {
      name: 'suama-project-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const DEFAULT_LOGO = '/logo-suama.jpg';
        const logo = state.project.identity.logoUrl;

        // Reemplazar blob URLs (solo válidas en la sesión original) con el logo default
        if (logo?.startsWith('blob:')) {
          state.project.identity.logoUrl = DEFAULT_LOGO;
        }

        // Limpiar media con blob URLs — quedan sin URL para re-subir
        const cleanedMedia = { ...state.project.media };
        for (const key of Object.keys(cleanedMedia)) {
          if (cleanedMedia[key]?.url?.startsWith('blob:')) {
            cleanedMedia[key] = { ...cleanedMedia[key], url: null, generationStatus: 'idle' };
          }
        }
        state.project.media = cleanedMedia;
      },
    }
  )
);
