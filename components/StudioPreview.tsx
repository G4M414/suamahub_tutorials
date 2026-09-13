'use client';

import React from 'react';
import { useCourseStore } from '@/lib/store';
import SlidePreview from '@/components/SlidePreview';

export default function StudioPreview() {
  const { course, activeModuleId } = useCourseStore();
  const currentModule =
    course.modules.find((m) => m.id === activeModuleId) || course.modules[0];

  if (!currentModule || currentModule.slides.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-500">
        Sin diapositivas disponibles para previsualizar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SlidePreview
        slide={currentModule.slides[0]}
        identity={course.identity}
        index={0}
        totalSlides={currentModule.slides.length}
        mediaUrl={
          currentModule.slides[0].mediaId && currentModule.media[currentModule.slides[0].mediaId]?.url
            ? currentModule.media[currentModule.slides[0].mediaId].url
            : currentModule.backgroundMediaId && currentModule.media[currentModule.backgroundMediaId]?.url
            ? currentModule.media[currentModule.backgroundMediaId].url
            : null
        }
      />
    </div>
  );
}
