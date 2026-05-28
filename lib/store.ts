import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ColorPalette, Slot, MediaItem, RiskSubModule } from './types';
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
  setVoiceAudioUrl: (url: string | null) => void;
  
  // Render
  setRenderStatus: (status: 'idle' | 'rendering' | 'success' | 'failed', progress?: number) => void;
  
  // Reset
  resetToDemo: () => void;
  loadTutorial: (tutorialId: 'tutorial_01' | 'tutorial_02') => void;
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
        
      setVoiceAudioUrl: (url) =>
        set((state) => ({
          project: { ...state.project, voiceAudioUrl: url },
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
    }),
    {
      name: 'suama-project-storage',
      // only persist basic configurations if needed, but for simplicity persist entire state
    }
  )
);
