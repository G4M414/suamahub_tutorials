import { CourseModule, CourseIdentity, ColorPalette, CourseSlide } from './types';

export const SLIDE_DEFAULT_DURATION = 7.0; // segundos por defecto por slide si no hay audio
export const CROSSFADE_DURATION = 1.0;     // segundos de transición entre slides

/**
 * Escapa strings para HTML seguro
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Genera el HTML completo para un slide en resolución 1920x1080
 * siguiendo la identidad visual de SUAMA HUB
 */
export function renderSlideHtml(
  slide: CourseSlide,
  identity: CourseIdentity,
  index: number,
  totalSlides: number,
  mediaUrl?: string | null
): string {
  const { colors, brandName, brandTagline, websiteUrl, logoUrl } = identity;

  const fontStack =
    identity.fontFamily === 'playfair'
      ? `'Playfair Display', Georgia, serif`
      : identity.fontFamily === 'lato'
      ? `'Lato', sans-serif`
      : identity.fontFamily === 'outfit'
      ? `'Outfit', sans-serif`
      : identity.fontFamily === 'montserrat'
      ? `'Montserrat', sans-serif`
      : `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

  const bulletsHtml =
    slide.bulletPoints && slide.bulletPoints.length > 0
      ? `<div style="margin-top: 32px; display: flex; flex-direction: column; gap: 16px;">
          ${slide.bulletPoints
            .map(
              (bp) => `
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${colors.primary}; margin-top: 8px; flex-shrink: 0; box-shadow: 0 0 10px rgba(0,153,139,0.3);"></div>
              <span style="font-size: 26px; color: ${colors.text}; line-height: 1.4; font-weight: 500;">
                ${escapeHtml(bp)}
              </span>
            </div>
          `
            )
            .join('')}
        </div>`
      : '';

  const mediaSideHtml = mediaUrl
    ? `<div style="
        width: 46%; height: 860px;
        position: relative;
        border-radius: 36px;
        overflow: hidden;
        border: 2px solid ${colors.accent};
        box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        background: #f1f5f9;
      ">
        <img src="${escapeHtml(mediaUrl)}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(2,82,104,0.4) 100%);"></div>
      </div>`
    : `<div style="
        width: 46%; height: 860px;
        position: relative;
        border-radius: 36px;
        overflow: hidden;
        border: 2px solid ${colors.accent}66;
        background: linear-gradient(135deg, ${colors.secondary}15 0%, ${colors.primary}20 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.05);
      ">
        <!-- Elemento gráfico concéntrico estilo SUAMA -->
        <div style="position: absolute; right: -120px; top: 50%; transform: translateY(-50%); width: 440px; height: 440px; border-radius: 50%; border: 16px solid ${colors.primary}33; pointer-events: none;"></div>
        <div style="position: absolute; right: -70px; top: 50%; transform: translateY(-50%); width: 340px; height: 340px; border-radius: 50%; border: 12px solid ${colors.accent}55; pointer-events: none;"></div>
        
        <div style="text-align: center; z-index: 2;">
          <div style="display: inline-block; padding: 10px 24px; border-radius: 9999px; background: ${colors.primary}; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;">
            ${escapeHtml(brandName)}
          </div>
          <h3 style="font-size: 38px; color: ${colors.secondary}; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">
            ${escapeHtml(slide.title)}
          </h3>
          <p style="font-size: 22px; color: ${colors.text}aa; max-width: 480px; margin: 0 auto; line-height: 1.5;">
            ${escapeHtml(brandTagline || 'Soluciones sistémicas para decisiones críticas')}
          </p>
        </div>
      </div>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Lato:wght@400;700;900&family=Outfit:wght@400;600;800&family=Montserrat:wght@400;600;800&family=Playfair+Display:wght@600;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: ${colors.background};
      font-family: ${fontStack};
      color: ${colors.text};
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<body>
  <!-- Barra superior de marca -->
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 10px; background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%);"></div>

  <!-- Contenedor principal 1920x1080 -->
  <div style="
    width: 1920px;
    height: 1080px;
    padding: 90px 100px 70px 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  ">
    <!-- Columna Izquierda: Contenido pedagógico -->
    <div style="width: 50%; display: flex; flex-direction: column; justify-content: space-between; height: 860px; z-index: 10;">
      
      <!-- Top header del slide -->
      <div>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
          <div style="font-size: 15px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: ${colors.primary};">
            ${escapeHtml(brandTagline || 'FORMACIÓN · SERVICIOS · DATOS')}
          </div>
          <div style="height: 1px; width: 40px; background: ${colors.accent};"></div>
          <div style="font-size: 14px; font-weight: 700; color: ${colors.secondary}; opacity: 0.7;">
            ${index + 1} / ${totalSlides}
          </div>
        </div>

        <h1 style="
          font-size: 50px;
          line-height: 1.15;
          font-weight: 800;
          color: ${colors.secondary};
          letter-spacing: -1px;
          margin-bottom: 24px;
        ">
          ${escapeHtml(slide.title)}
        </h1>

        <div style="
          font-size: 30px;
          line-height: 1.45;
          color: ${colors.text};
          font-weight: 400;
          margin-bottom: 12px;
        ">
          ${escapeHtml(slide.content)}
        </div>

        ${bulletsHtml}
      </div>

      <!-- Footer del slide -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 14px;">
          ${
            logoUrl
              ? `<img src="${escapeHtml(logoUrl)}" style="height: 42px; object-fit: contain;" />`
              : `<div style="font-weight: 800; font-size: 20px; color: ${colors.primary};">${escapeHtml(brandName)}</div>`
          }
          <span style="font-size: 15px; font-weight: 600; color: ${colors.secondary}aa;">
            ${escapeHtml(websiteUrl || 'www.suamahub.com')}
          </span>
        </div>

        <div style="font-size: 13px; font-weight: 700; color: ${colors.accent}; letter-spacing: 1px; text-transform: uppercase;">
          SUAMA HUB E-LEARNING
        </div>
      </div>
    </div>

    <!-- Columna Derecha: Panel visual -->
    ${mediaSideHtml}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Construye el objeto Edit para Shotstack correspondiente a un CourseModule
 */
export async function buildModuleEdit(
  module: CourseModule,
  identity: CourseIdentity,
  audioDurationSeconds?: number
) {
  const slides = module.slides;
  const slideCount = Math.max(1, slides.length);

  // Si hay duración de audio, la dividimos equitativamente entre slides
  // de lo contrario usamos la duración estándar por slide.
  const totalDuration = audioDurationSeconds && audioDurationSeconds > 0
    ? audioDurationSeconds
    : slideCount * SLIDE_DEFAULT_DURATION;

  const durationPerSlide = Math.max(3.5, totalDuration / slideCount);

  // Background media URL general del módulo
  const bgMediaUrl = module.backgroundMediaId && module.media[module.backgroundMediaId]?.url
    ? module.media[module.backgroundMediaId].url
    : null;

  // Track 1: Clips HTML de cada Slide
  const htmlClips = slides.map((slide, index) => {
    const slideMediaUrl = slide.mediaId && module.media[slide.mediaId]?.url
      ? module.media[slide.mediaId].url
      : bgMediaUrl;

    const htmlContent = renderSlideHtml(slide, identity, index, slideCount, slideMediaUrl);
    const start = +(index * durationPerSlide).toFixed(2);
    const length = +(durationPerSlide + (index < slideCount - 1 ? CROSSFADE_DURATION : 0)).toFixed(2);

    return {
      asset: {
        type: 'html',
        html: htmlContent,
        width: 1920,
        height: 1080,
      },
      start,
      length,
      transition: index > 0 ? { in: 'fade' } : undefined,
    };
  });

  const tracks: Array<{ clips: any[] }> = [
    {
      clips: htmlClips,
    },
  ];

  // Track de audio de locución (ElevenLabs)
  const soundTrack: { src: string } | undefined = module.voiceAudioUrl
    ? { src: module.voiceAudioUrl }
    : undefined;

  const edit = {
    timeline: {
      background: identity.colors.background || '#ffffff',
      sound: soundTrack,
      tracks,
    },
    output: {
      format: 'mp4',
      resolution: '1080',
      aspectRatio: '16:9',
      fps: 25,
    },
  };

  return {
    edit,
    totalDuration: +(slideCount * durationPerSlide).toFixed(2),
  };
}

/**
 * Valida que no haya URLs locales o blob: en el timeline
 */
export function collectInvalidAssetUrls(timeline: any): string[] {
  const invalid: string[] = [];
  if (timeline.sound?.src && !timeline.sound.src.startsWith('http')) {
    invalid.push(timeline.sound.src);
  }
  return invalid;
}
