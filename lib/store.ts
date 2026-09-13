import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Course,
  CourseIdentity,
  CourseSlide,
  DownloadableMaterial,
  PracticeActivity,
  MediaItem,
  CourseExam,
  ExamQuestion,
} from './types';
import { IKIGAI_COURSE, COURSE_DATA } from './course-data';

interface CourseStore {
  course: Course;
  activeModuleId: string;

  // Navegación / Selección
  setActiveModuleId: (moduleId: string) => void;

  // Curso
  loadCourse: (slug: string) => void;
  loadCourseState: (state: Partial<Course>) => void;

  // Identidad
  updateIdentity: (identity: Partial<CourseIdentity>) => void;

  // Módulos
  toggleModule: (moduleId: string, active: boolean) => void;
  updateModuleVideoScript: (moduleId: string, script: string) => void;
  
  // Slides
  updateModuleSlide: (moduleId: string, slideId: string, updates: Partial<CourseSlide>) => void;
  addSlide: (moduleId: string) => void;
  removeSlide: (moduleId: string, slideId: string) => void;
  reorderSlides: (moduleId: string, slides: CourseSlide[]) => void;

  // Materiales
  updateDownloadableMaterial: (moduleId: string, materialId: string, updates: Partial<DownloadableMaterial>) => void;
  
  // Actividades
  updateActivity: (moduleId: string, activityId: string, updates: Partial<PracticeActivity>) => void;

  // Media
  updateMedia: (moduleId: string, placeholderId: string, updates: Partial<MediaItem>) => void;

  // Voz
  setVoiceAudioUrl: (moduleId: string, url: string | null) => void;

  // Examen
  updateExam: (exam: Partial<CourseExam>) => void;
  updateExamQuestion: (questionId: string, updates: Partial<ExamQuestion>) => void;
  addExamQuestion: () => void;
  removeExamQuestion: (questionId: string) => void;

  // Render
  setModuleRenderStatus: (moduleId: string, status: 'idle' | 'rendering' | 'success' | 'failed', progress?: number) => void;
  setModuleRenderedUrl: (moduleId: string, url: string) => void;

  // Reset
  resetToDefault: () => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      course: { ...IKIGAI_COURSE },
      activeModuleId: 'module_00',

      setActiveModuleId: (moduleId) => set({ activeModuleId: moduleId }),

      loadCourse: (slug) => {
        const found = COURSE_DATA[slug];
        if (found) {
          set({ course: JSON.parse(JSON.stringify(found)), activeModuleId: found.modules[0]?.id ?? 'module_00' });
        }
      },

      loadCourseState: (state) =>
        set((prev) => ({
          course: { ...prev.course, ...state },
        })),

      updateIdentity: (identity) =>
        set((state) => ({
          course: {
            ...state.course,
            identity: {
              ...state.course.identity,
              ...identity,
              colors: {
                ...state.course.identity.colors,
                ...(identity.colors ?? {}),
              },
            },
          },
        })),

      toggleModule: (moduleId, active) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) =>
              m.id === moduleId ? { ...m, active } : m
            ),
          },
        })),

      updateModuleVideoScript: (moduleId, script) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) =>
              m.id === moduleId ? { ...m, videoScript: script } : m
            ),
          },
        })),

      updateModuleSlide: (moduleId, slideId, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) => {
              if (m.id !== moduleId) return m;
              return {
                ...m,
                slides: m.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)),
              };
            }),
          },
        })),

      addSlide: (moduleId) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) => {
              if (m.id !== moduleId) return m;
              const nextNum = m.slides.length + 1;
              const newSlide: CourseSlide = {
                id: `slide_${moduleId}_${String(nextNum).padStart(2, '0')}`,
                title: `Nueva diapositiva ${nextNum}`,
                content: 'Texto principal de la diapositiva...',
                bulletPoints: ['Punto clave 1'],
              };
              return {
                ...m,
                slides: [...m.slides, newSlide],
              };
            }),
          },
        })),

      removeSlide: (moduleId, slideId) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) => {
              if (m.id !== moduleId) return m;
              return {
                ...m,
                slides: m.slides.filter((s) => s.id !== slideId),
              };
            }),
          },
        })),

      reorderSlides: (moduleId, slides) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) =>
              m.id === moduleId ? { ...m, slides } : m
            ),
          },
        })),

      updateDownloadableMaterial: (moduleId, materialId, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) => {
              if (m.id !== moduleId) return m;
              return {
                ...m,
                downloadableMaterials: m.downloadableMaterials.map((mat) =>
                  mat.id === materialId ? { ...mat, ...updates } : mat
                ),
              };
            }),
          },
        })),

      updateActivity: (moduleId, activityId, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) => {
              if (m.id !== moduleId) return m;
              return {
                ...m,
                activities: m.activities.map((act) =>
                  act.id === activityId ? { ...act, ...updates } : act
                ),
              };
            }),
          },
        })),

      updateMedia: (moduleId, placeholderId, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) => {
              if (m.id !== moduleId) return m;
              const currentMedia = m.media[placeholderId] ?? {
                id: `${moduleId}_${placeholderId}`,
                placeholderId,
                type: 'image',
                source: 'upload',
                url: null,
                generationStatus: 'idle',
              };
              return {
                ...m,
                media: {
                  ...m.media,
                  [placeholderId]: {
                    ...currentMedia,
                    ...updates,
                  },
                },
              };
            }),
          },
        })),

      setVoiceAudioUrl: (moduleId, url) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) =>
              m.id === moduleId ? { ...m, voiceAudioUrl: url ?? undefined } : m
            ),
          },
        })),

      updateExam: (exam) =>
        set((state) => ({
          course: {
            ...state.course,
            exam: {
              ...state.course.exam,
              ...exam,
            },
          },
        })),

      updateExamQuestion: (questionId, updates) =>
        set((state) => ({
          course: {
            ...state.course,
            exam: {
              ...state.course.exam,
              questions: state.course.exam.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
            },
          },
        })),

      addExamQuestion: () =>
        set((state) => {
          const nextIndex = state.course.exam.questions.length + 1;
          const newQ: ExamQuestion = {
            id: `q_${String(nextIndex).padStart(2, '0')}`,
            question: 'Nueva pregunta de opción múltiple...',
            options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
            correctIndex: 0,
          };
          return {
            course: {
              ...state.course,
              exam: {
                ...state.course.exam,
                totalQuestions: state.course.exam.questions.length + 1,
                questions: [...state.course.exam.questions, newQ],
              },
            },
          };
        }),

      removeExamQuestion: (questionId) =>
        set((state) => {
          const updated = state.course.exam.questions.filter((q) => q.id !== questionId);
          return {
            course: {
              ...state.course,
              exam: {
                ...state.course.exam,
                totalQuestions: updated.length,
                questions: updated,
              },
            },
          };
        }),

      setModuleRenderStatus: (moduleId, status, progress) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) =>
              m.id === moduleId
                ? {
                    ...m,
                    renderStatus: status,
                    ...(progress !== undefined ? { renderProgress: progress } : {}),
                  }
                : m
            ),
          },
        })),

      setModuleRenderedUrl: (moduleId, url) =>
        set((state) => ({
          course: {
            ...state.course,
            modules: state.course.modules.map((m) =>
              m.id === moduleId ? { ...m, renderedVideoUrl: url, renderStatus: 'success', renderProgress: 100 } : m
            ),
          },
        })),

      resetToDefault: () => {
        set({ course: JSON.parse(JSON.stringify(IKIGAI_COURSE)), activeModuleId: 'module_00' });
      },
    }),
    {
      name: 'suama-elearning-store',
    }
  )
);

// Alias para compatibilidad de componentes existentes
export const useProjectStore = useCourseStore;
