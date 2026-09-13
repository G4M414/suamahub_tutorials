'use client';

import React, { useState } from 'react';
import { useCourseStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  Printer,
  Download,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function MaterialesImprimiblesPage() {
  const { course } = useCourseStore();

  // Recopilamos todos los materiales de todos los módulos
  const allMaterials = course.modules.flatMap((m) =>
    m.downloadableMaterials.map((mat) => ({
      ...mat,
      moduleTitle: m.title,
      moduleId: m.id,
    }))
  );

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    allMaterials[0]?.id || 'mat_01_guia'
  );

  const currentMaterial =
    allMaterials.find((m) => m.id === selectedMaterialId) || allMaterials[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top action bar (hidden in print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-primary" />
            Materiales y Guías Imprimibles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plantillas descargables para el alumno con diseño editorial SUAMA optimizado para impresión A4 y guardado como PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            className="text-xs font-bold shadow-lg shadow-primary/20 bg-primary text-slate-950 hover:bg-teal-400"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Guardar como PDF
          </Button>
        </div>
      </div>

      {/* Guide selector tabs (hidden in print) */}
      <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-2">
        {allMaterials.map((mat) => {
          const isSelected = mat.id === currentMaterial?.id;
          return (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterialId(mat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-primary/20 text-teal-300 border-primary shadow-lg shadow-primary/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>{mat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Printable Sheet View */}
      {currentMaterial && (
        <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-14 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none max-w-4xl mx-auto space-y-8 font-sans">
          {/* Header Institucional SUAMA */}
          <div className="border-b-2 pb-6 flex items-start justify-between gap-6" style={{ borderColor: course.identity.colors.primary }}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: course.identity.colors.primary }}
                >
                  {course.identity.brandTagline || 'FORMACIÓN · SERVICIOS · DATOS'}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {currentMaterial.moduleTitle}
                </span>
              </div>

              <h1
                className="text-2xl md:text-3xl font-black tracking-tight"
                style={{ color: course.identity.colors.secondary }}
              >
                {currentMaterial.title}
              </h1>

              <p className="text-xs text-slate-600 font-medium max-w-xl">
                {currentMaterial.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div
                className="text-base font-black tracking-tighter"
                style={{ color: course.identity.colors.primary }}
              >
                {course.identity.brandName}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block">
                {course.identity.websiteUrl || 'www.suamahub.com'}
              </span>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                Guía de Trabajo
              </span>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Nombre del Estudiante:</span>
              <div className="h-6 border-b border-slate-300 mt-1"></div>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Fecha:</span>
              <div className="h-6 border-b border-slate-300 mt-1"></div>
            </div>
          </div>

          {/* Sections of Questions and Exercises */}
          <div className="space-y-6">
            {currentMaterial.sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="space-y-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm break-inside-avoid print:shadow-none"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span
                    className="w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0"
                    style={{ backgroundColor: course.identity.colors.primary }}
                  >
                    {sIdx + 1}
                  </span>
                  <h2
                    className="text-base font-black tracking-tight"
                    style={{ color: course.identity.colors.secondary }}
                  >
                    {sec.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {sec.items.map((item, iIdx) => (
                    <div key={iIdx} className="space-y-2">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {iIdx + 1}. {item}
                      </p>

                      {/* Work/Answer blank area */}
                      <div className="w-full min-h-[50px] p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 print:bg-white text-xs text-slate-400 italic">
                        [Espacio para respuesta del alumno]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer institucional del documento impreso */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>{course.courseName} · Material del Alumno</span>
            <span>Documento generado por {course.identity.brandName}</span>
            <span>Página 1 de 1</span>
          </div>
        </div>
      )}

      {/* Embedded print CSS for pure A4 clarity */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          aside, header, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
