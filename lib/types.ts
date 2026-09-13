// Paleta de colores del curso / identidad visual
export interface ColorPalette {
  primary: string;     // Color institucional principal (default #00998b)
  secondary: string;   // Color secundario (default #025268)
  accent: string;      // Color de acento (default #c6c19d)
  background: string;  // Fondo de slides (default #ffffff)
  text: string;        // Color de texto principal (default #2f2722)
}

// Identidad visual del curso
export interface CourseIdentity {
  logoUrl: string | null;
  colors: ColorPalette;
  fontFamily: string;
  brandName: string;      // Nombre de la marca/institución (ej: "SUAMA")
  brandTagline?: string;  // Slogan o bajada opcional (ej: "E-LEARNING · TRAINING · ADVISORY")
  websiteUrl?: string;    // Web opcional (ej: "www.suamahub.com")
}

// Un slide individual dentro de un módulo
export interface CourseSlide {
  id: string;              // 'slide_01', 'slide_02', etc.
  title: string;           // Título del slide
  content: string;         // Texto principal o idea fuerza
  bulletPoints?: string[]; // Lista de puntos (opcional)
  note?: string;           // Nota del presentador (no aparece en el video)
  mediaId?: string;        // ID del media item vinculado a este slide (opcional)
}

// Material descargable asociado a un módulo (PDF imprimible)
export interface DownloadableMaterial {
  id: string;
  title: string;           // Nombre de la guía / PDF
  description: string;     // Descripción breve
  driveUrl?: string;       // URL del PDF en Google Drive (opcional)
  sections: MaterialSection[]; // Secciones del contenido de la guía
}

export interface MaterialSection {
  title: string;
  items: string[];         // Preguntas o puntos de la sección
}

// Actividad práctica del módulo
export interface PracticeActivity {
  id: string;
  title: string;
  description: string;     // Instrucción de la actividad
  steps?: string[];        // Pasos guiados
  driveUrl?: string;       // URL de la plantilla en Drive (si existe)
}

// Pregunta de evaluación
export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];       // Exactamente 4 opciones (A, B, C, D)
  correctIndex: number;    // Índice de la respuesta correcta (0-3)
  explanation?: string;    // Justificación pedagógica opcional
}

// Evaluación final del curso
export interface CourseExam {
  title: string;
  passingScore: number;    // Mínimo de respuestas correctas para aprobar (ej: 2)
  totalQuestions: number;  // Total de preguntas (ej: 3)
  questions: ExamQuestion[];
}

// Item de media (imagen o video de fondo)
export interface MediaItem {
  id: string;
  placeholderId: string;
  type: 'image' | 'video';
  source: 'upload' | 'ai' | 'drive';
  url: string | null;
  fileName?: string;
  aiPrompt?: string;
  generationStatus?: 'idle' | 'generating' | 'success' | 'failed';
}

// Módulo completo del curso
export interface CourseModule {
  id: string;              // 'module_00', 'module_01', 'module_02', 'module_03', 'module_close'
  type: 'intro' | 'content' | 'closing'; // tipo de módulo
  title: string;           // Nombre del módulo
  objective?: string;      // Objetivo de aprendizaje del módulo
  active: boolean;         // Si se incluye en la producción
  
  // Video
  videoScript: string;     // Guión completo narrado del video (varios párrafos)
  slides: CourseSlide[];   // Slides del video
  
  // Media
  backgroundMediaId?: string; // Media de fondo general del módulo
  media: Record<string, MediaItem>; // placeholderId → MediaItem
  
  // Audio
  voiceAudioUrl?: string;  // URL del audio generado con ElevenLabs
  
  // Materiales del módulo
  downloadableMaterials: DownloadableMaterial[];
  activities: PracticeActivity[];
  
  // Render
  renderStatus?: 'idle' | 'rendering' | 'success' | 'failed';
  renderProgress?: number;
  renderedVideoUrl?: string; // URL del MP4 final en Shotstack/Drive
}

// Curso completo
export interface Course {
  id: string;
  courseName: string;       // Nombre del curso
  slug: string;             // Identificador único del catálogo (ej: 'ikigai_emprender')
  description: string;
  estimatedDuration: string;// "60–90 minutos"
  level: string;            // "introductorio" | "intermedio" | "avanzado"
  identity: CourseIdentity;
  modules: CourseModule[];
  exam: CourseExam;
  createdAt?: string;
  updatedAt?: string;
}

// Metadata del catálogo de cursos
export interface CourseMeta {
  id: string;
  slug: string;
  name: string;
  label: string;
  description: string;
  estimatedDuration: string;
  level: string;
  moduleCount: number;
}
