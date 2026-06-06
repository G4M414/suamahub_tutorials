export interface ColorPalette {
  primary: string;     // Color institucional principal (default teal #00998b)
  secondary: string;   // Color secundario (default azul profundo #025268)
  accent: string;      // Color de acento (default dorado/arena #c6c19d)
  background: string;  // Color de fondo para slides (default blanco #ffffff o gris #e3e3e3)
  text: string;        // Color de texto principal (default oscuro #2f2722)
}

export interface ClientIdentity {
  logoUrl: string | null;
  colors: ColorPalette;
  fontFamily: string;
  secondaryText?: string;    // Texto secundario de marca (slogan / bajada), opcional
  assetsFolderUrl?: string;  // Link a la carpeta Assets del cliente en Drive
}

// Identidad de un cliente leída desde Notion (Notion → Dashboard)
export interface NotionClient {
  pageId: string;
  clientName: string;
  companyName: string;
  industry: string;
  tipo: string; // 'Plataforma' | 'Partner' | 'Cliente' (etiqueta, no cambia el flujo)
  logoUrl: string | null;
  assetsFolderUrl: string | null;
  fontFamily: string;
  secondaryText: string;
  colors: Partial<ColorPalette>;
}

export interface SlotField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'list' | 'definitions';
  value: string | string[] | DefinitionItem[];
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface RiskSubModule {
  id: string; // e.g. '08a', '08b'
  name: string; // e.g. 'Resbalones y caídas'
  active: boolean;
  causes: string[];
  measures: string[];
  mediaId: string; // maps to a media item for this risk
  videoUrl?: string;
}

export interface Slot {
  id: string; // 'SLOT_01' to 'SLOT_10'
  title: string; // e.g. 'Portada'
  active: boolean;
  fields: Record<string, string | string[] | DefinitionItem[]>;
  riskModules?: RiskSubModule[]; // Only populated for SLOT_08
  mediaId?: string; // optional single-image placeholder (e.g. SLOT_03B → 'slot_03b_img')
}

export interface MediaItem {
  id: string; // unique identifier
  placeholderId: string; // e.g., 'portada_img', '08a_media'
  type: 'image' | 'video';
  source: 'upload' | 'ai';
  url: string | null; // URL string or object URL for preview
  fileName?: string;
  aiPrompt?: string;
  generationStatus?: 'idle' | 'generating' | 'success' | 'failed';
}

export interface Project {
  id: string;
  projectName: string;
  clientName: string;
  companyName: string;
  industry: string;
  tutorialId: 'tutorial_01' | 'tutorial_02';
  // Portada: 'template' = diseño SUAMA (título+logo sobre fondo);
  //          'custom'   = imagen/video propio a pantalla completa, sin overlay.
  portadaMode?: 'template' | 'custom';
  // Cierre (igual que la portada): 'template' = diseño con mensaje/logo;
  //          'custom'   = imagen/video propio a pantalla completa, sin overlay.
  cierreMode?: 'template' | 'custom';
  identity: ClientIdentity;
  slots: Slot[];
  media: Record<string, MediaItem>; // maps placeholderId -> MediaItem
  voiceScript: Record<string, string>; // maps slotId -> voice text script
  voiceAudioUrls: Record<string, string>; // maps slotId -> audio URL
  renderStatus?: 'idle' | 'rendering' | 'success' | 'failed';
  renderProgress?: number;
}
