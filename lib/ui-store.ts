import { create } from 'zustand';

// Estado de UI efímero (NO se persiste): controla el autoguardado en Notion.
// - dirty: hay cambios del cliente actual sin subir a Notion.
// - suppressSave: pausa el autoguardado (durante el cambio de cliente, mientras
//   se limpia y se recargan los assets, para no subir un estado a medias).
// - saving: hay un guardado en curso (para el indicador del dashboard).
interface UiStore {
  dirty: boolean;
  suppressSave: boolean;
  saving: boolean;
  setDirty: (b: boolean) => void;
  setSuppressSave: (b: boolean) => void;
  setSaving: (b: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  dirty: false,
  suppressSave: false,
  saving: false,
  setDirty: (b) => set({ dirty: b }),
  setSuppressSave: (b) => set({ suppressSave: b }),
  setSaving: (b) => set({ saving: b }),
}));
