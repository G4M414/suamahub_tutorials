'use client';

import { useEffect, useRef } from 'react';
import { useCourseStore } from '@/lib/store';
import { useUiStore } from '@/lib/ui-store';

/**
 * Componente silencioso que detecta cambios en el Course activo
 * y actualiza el estado sucio (dirty) en la UI.
 */
export default function AutoSave() {
  const course = useCourseStore((s) => s.course);
  const { setDirty, suppressSave } = useUiStore();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (suppressSave) return;
    setDirty(true);
  }, [course, setDirty, suppressSave]);

  return null;
}
