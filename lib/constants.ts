import { ColorPalette } from './types';

export const SUAMA_COLORS: ColorPalette = {
  primary: '#00998b',    // Focoltone 2279 (Teal)
  secondary: '#025268',  // Focoltone 6043 (Deep Blue)
  accent: '#c6c19d',     // Focoltone 5008 (Dorado/Arena)
  background: '#ffffff', // Fondo para slides (blanco)
  text: '#2f2722',       // Focoltone 6033 (Oscuro / Text)
};

export const AVAILABLE_FONTS = [
  { id: 'inter', name: 'Inter (Sans-serif)', value: 'var(--font-inter)' },
  { id: 'harabara', name: 'Harabara (Títulos - SUAMA)', value: 'var(--font-harabara)' },
  { id: 'kiona', name: 'Kiona (Subtítulos - SUAMA)', value: 'var(--font-kiona)' },
  { id: 'roboto', name: 'Roboto', value: 'var(--font-roboto)' },
  { id: 'outfit', name: 'Outfit', value: 'var(--font-outfit)' },
];

export const SLOT_INFO = {
  SLOT_01: { name: 'Portada', description: 'Presentación del tutorial y logo del cliente' },
  SLOT_02: { name: 'Objetivos', description: 'Objetivos y temario del curso' },
  SLOT_03: { name: 'Marco Legal', description: 'Leyes y normativas vigentes aplicables' },
  SLOT_03B: { name: 'Obligaciones, Deberes y Derechos', description: 'Derechos y obligaciones de trabajadores y empleadores' },
  SLOT_04: { name: 'Definiciones Clave', description: 'Glosario de conceptos de prevención' },
  SLOT_05: { name: 'Razones para la Prevención', description: 'Motivaciones morales, legales y económicas' },
  SLOT_06: { name: 'Principios Clave', description: 'Principios de prevención y responsabilidades' },
  SLOT_07: { name: 'Gestión y Roles', description: 'Análisis de peligros, jerarquía de controles y roles' },
  SLOT_08: { name: 'Módulos de Riesgo', description: 'Riesgos específicos del sector y sus medidas preventivas' },
  SLOT_09: { name: 'Tips Finales', description: 'Recomendaciones y reflexiones finales' },
  SLOT_10: { name: 'Cierre', description: 'Cierre del tutorial, contacto y logo' },
};
