import { ColorPalette, CourseMeta } from './types';

export const SUAMA_COLORS: ColorPalette = {
  primary: '#00998b',    // Teal SUAMA
  secondary: '#025268',  // Deep Blue
  accent: '#c6c19d',     // Dorado / Arena
  background: '#ffffff', // Fondo para slides (blanco)
  text: '#2f2722',       // Texto principal oscuro
};

export const AVAILABLE_FONTS = [
  { id: 'inter', name: 'Inter (Sans-serif)', value: 'var(--font-inter)' },
  { id: 'lato', name: 'Lato', value: 'var(--font-lato)' },
  { id: 'roboto', name: 'Roboto', value: 'var(--font-roboto)' },
  { id: 'outfit', name: 'Outfit', value: 'var(--font-outfit)' },
  { id: 'montserrat', name: 'Montserrat', value: 'var(--font-montserrat)' },
  { id: 'playfair', name: 'Playfair Display (Serif)', value: 'var(--font-playfair)' },
];

export const COURSE_CATALOG: CourseMeta[] = [
  {
    id: 'ikigai_emprender',
    slug: 'ikigai_emprender',
    name: 'Ikigai para emprender con propósito',
    label: 'Curso 01 — IKIGAI',
    description: 'Herramienta de autoconocimiento y exploración para identificar caminos emprendedores',
    estimatedDuration: '60–90 minutos',
    level: 'introductorio',
    moduleCount: 3,
  },
];
