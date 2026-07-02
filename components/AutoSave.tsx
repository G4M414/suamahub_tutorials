'use client';

import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/lib/store';
import { useUiStore } from '@/lib/ui-store';

const DEMO_CLIENT = 'SUAMA Demo Client';
const DEBOUNCE_MS = 2500;

// Autoguardado: sube el proyecto a Notion (sync por módulo) 2,5s después del
// último cambio. Notion queda siempre como BBDD al día, sin depender de que el
// operador apriete "Guardar".
//
// Reglas de seguridad:
// - No corre durante el cambio de cliente (suppressSave): así nunca sube un
//   estado a medias mientras se limpian/recargan los assets.
// - No corre para el cliente demo ni sin cliente elegido.
// - Sólo reacciona a cambios reales del proyecto (dep = project), no a flags.
export default function AutoSave() {
  const project = useProjectStore((s) => s.project);
  const first = useRef(true);
  const prevTutorialId = useRef(project.tutorialId);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Saltar el primer render (hidratación), no es un cambio del usuario.
    if (first.current) {
      first.current = false;
      return;
    }
    // Saltar cuando cambia el tutorial (carga de plantilla o migración de ID).
    if (prevTutorialId.current !== project.tutorialId) {
      prevTutorialId.current = project.tutorialId;
      return;
    }
    if (useUiStore.getState().suppressSave) return;
    const name = project.clientName?.trim();
    if (!name || name === DEMO_CLIENT) return;

    useUiStore.getState().setDirty(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      useUiStore.getState().setSaving(true);
      try {
        const r = await fetch('/api/notion/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project, estado: 'Borrador' }),
        });
        if (r.ok) useUiStore.getState().setDirty(false);
      } catch {
        /* reintenta en el próximo cambio */
      } finally {
        useUiStore.getState().setSaving(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // Sólo cambios del proyecto. suppressSave se lee con getState() a propósito,
    // para no re-disparar el guardado al reanudar tras un cambio de cliente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  return null;
}
