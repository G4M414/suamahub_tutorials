'use client';

import React from 'react';
import { CourseSlide, CourseIdentity } from '@/lib/types';

interface SlidePreviewProps {
  slide: CourseSlide;
  identity: CourseIdentity;
  index: number;
  totalSlides: number;
  mediaUrl?: string | null;
  className?: string;
}

export default function SlidePreview({
  slide,
  identity,
  index,
  totalSlides,
  mediaUrl,
  className = '',
}: SlidePreviewProps) {
  const { colors, brandName, brandTagline, websiteUrl, logoUrl } = identity;

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-white select-none ${className}`}
      style={{
        backgroundColor: colors.background || '#ffffff',
        color: colors.text || '#2f2722',
      }}
    >
      {/* Top brand accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-2 z-20"
        style={{
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      />

      {/* Main slide layout */}
      <div className="w-full h-full p-6 md:p-8 flex justify-between items-center relative z-10 gap-6">
        {/* Left Column: Educational text */}
        <div className="w-1/2 h-full flex flex-col justify-between">
          <div>
            {/* Tagline & Counter */}
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-[10px] md:text-xs font-black tracking-widest uppercase truncate"
                style={{ color: colors.primary }}
              >
                {brandTagline || 'FORMACIÓN · SERVICIOS · DATOS'}
              </span>
              <span
                className="h-[1px] w-4"
                style={{ backgroundColor: colors.accent }}
              />
              <span
                className="text-[10px] md:text-xs font-bold opacity-75"
                style={{ color: colors.secondary }}
              >
                {index + 1} / {totalSlides}
              </span>
            </div>

            {/* Slide Title */}
            <h2
              className="text-lg md:text-2xl font-black leading-tight mb-3 line-clamp-2"
              style={{ color: colors.secondary }}
            >
              {slide.title}
            </h2>

            {/* Main Content */}
            <p
              className="text-xs md:text-sm font-medium leading-relaxed mb-3 line-clamp-4"
              style={{ color: colors.text }}
            >
              {slide.content}
            </p>

            {/* Bullet points */}
            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {slide.bulletPoints.slice(0, 4).map((bp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span
                      className="text-[11px] md:text-xs font-medium leading-snug line-clamp-1"
                      style={{ color: colors.text }}
                    >
                      {bp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer branding */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-5 max-w-[80px] object-contain"
                />
              ) : (
                <span
                  className="text-xs font-black"
                  style={{ color: colors.primary }}
                >
                  {brandName}
                </span>
              )}
              <span
                className="text-[10px] font-semibold opacity-70"
                style={{ color: colors.secondary }}
              >
                {websiteUrl || 'www.suamahub.com'}
              </span>
            </div>

            <span
              className="text-[9px] font-bold tracking-wider uppercase"
              style={{ color: colors.accent }}
            >
              E-LEARNING
            </span>
          </div>
        </div>

        {/* Right Column: Visual / Graphic panel */}
        <div className="w-1/2 h-full flex items-center justify-center">
          {mediaUrl ? (
            <div
              className="w-full h-full rounded-2xl overflow-hidden border relative shadow-md bg-slate-100"
              style={{ borderColor: colors.accent }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-full h-full rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden border shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${colors.secondary}10 0%, ${colors.primary}18 100%)`,
                borderColor: `${colors.accent}66`,
              }}
            >
              {/* Decorative concentric circle pattern */}
              <div
                className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full border-8 pointer-events-none opacity-40"
                style={{ borderColor: colors.primary }}
              />
              <div
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border-6 pointer-events-none opacity-60"
                style={{ borderColor: colors.accent }}
              />

              <div className="relative z-10">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {brandName}
                </span>
                <h4
                  className="text-sm md:text-base font-extrabold line-clamp-2"
                  style={{ color: colors.secondary }}
                >
                  {slide.title}
                </h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
