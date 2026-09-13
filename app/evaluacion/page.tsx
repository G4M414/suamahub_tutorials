'use client';

import React, { useState } from 'react';
import { useCourseStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import {
  CheckSquare,
  Plus,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  FileCode,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function EvaluacionPage() {
  const {
    course,
    updateExam,
    updateExamQuestion,
    addExamQuestion,
    removeExamQuestion,
  } = useCourseStore();

  const exam = course.exam;
  const [copied, setCopied] = useState(false);
  const [selectedStudentAnswers, setSelectedStudentAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Generador de formato GIFT (estándar Moodle / LMS)
  const generateGiftFormat = (): string => {
    return exam.questions
      .map((q, idx) => {
        const title = `::Q${idx + 1} - ${course.courseName}::`;
        const optionsGift = q.options
          .map((opt, oIdx) => {
            const isCorrect = oIdx === q.correctIndex;
            return isCorrect ? `  =${opt}` : `  ~${opt}`;
          })
          .join('\n');
        return `${title} ${q.question} {\n${optionsGift}\n}`;
      })
      .join('\n\n');
  };

  const handleCopyGift = () => {
    const giftText = generateGiftFormat();
    navigator.clipboard.writeText(giftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadGift = () => {
    const giftText = generateGiftFormat();
    const blob = new Blob([giftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Examen_${course.slug}_GIFT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simulación de examen del alumno
  const score = Object.entries(selectedStudentAnswers).reduce((acc, [qId, ansIndex]) => {
    const q = exam.questions.find((item) => item.id === qId);
    return acc + (q && q.correctIndex === ansIndex ? 1 : 0);
  }, 0);

  const passed = score >= exam.passingScore;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-primary" />
            Evaluación Final y Exportador para LMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configurá las preguntas del examen final y exportalas directamente en formato GIFT para Moodle u otros LMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyGift}
            variant="outline"
            className="text-xs font-bold border-slate-700 bg-slate-900 text-slate-200"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5 text-primary" />
            {copied ? '¡Copiado al Portapapeles!' : 'Copiar GIFT (Moodle)'}
          </Button>

          <Button
            onClick={handleDownloadGift}
            className="text-xs font-bold shadow-lg shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Descargar .gift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Questions Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
              Configuración General del Examen
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Título de la Evaluación</label>
              <Input
                value={exam.title}
                onChange={(e) => updateExam({ title: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Puntaje Mínimo de Aprobación</label>
                <Input
                  type="number"
                  min={1}
                  max={exam.questions.length}
                  value={exam.passingScore}
                  onChange={(e) => updateExam({ passingScore: parseInt(e.target.value) || 1 })}
                  className="bg-slate-950 border-slate-800 text-xs font-bold text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Total de Preguntas</label>
                <div className="h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 flex items-center text-xs font-bold text-teal-400">
                  {exam.questions.length} preguntas
                </div>
              </div>
            </div>
          </Card>

          {/* Questions list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Preguntas de Opción Múltiple
              </h3>
              <Button
                onClick={addExamQuestion}
                variant="outline"
                className="text-xs font-bold border-slate-700 bg-slate-900"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-primary" />
                Agregar Pregunta
              </Button>
            </div>

            {exam.questions.map((q, qIdx) => (
              <Card key={q.id} className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-black shrink-0">
                    {qIdx + 1}
                  </span>

                  <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">Enunciado de la Pregunta</label>
                    <TextArea
                      value={q.question}
                      onChange={(e) => updateExamQuestion(q.id, { question: e.target.value })}
                      rows={2}
                      className="bg-slate-950 border-slate-800 text-xs text-white font-medium"
                    />
                  </div>

                  {exam.questions.length > 1 && (
                    <button
                      onClick={() => removeExamQuestion(q.id)}
                      className="p-2 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 4 Options */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  <label className="text-[11px] font-bold text-slate-400">
                    Opciones de Respuesta (Marcá el radio de la correcta)
                  </label>

                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctIndex === oIdx;
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-primary/10 border-primary/50'
                            : 'bg-slate-950 border-slate-800/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={isCorrect}
                          onChange={() => updateExamQuestion(q.id, { correctIndex: oIdx })}
                          className="accent-teal-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-bold text-slate-400 w-4">{letter}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[oIdx] = e.target.value;
                            updateExamQuestion(q.id, { options: newOptions });
                          }}
                          className="flex-1 bg-transparent border-none text-xs text-slate-200 outline-none p-0"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="space-y-1 pt-2">
                  <label className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    Justificación Pedagógica (Feedback para el alumno)
                  </label>
                  <Input
                    value={q.explanation || ''}
                    onChange={(e) => updateExamQuestion(q.id, { explanation: e.target.value })}
                    placeholder="Explicación de por qué la opción es la correcta..."
                    className="bg-slate-950 border-slate-800 text-xs text-slate-300"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Student Simulation & GIFT Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Student Simulation Box */}
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Simulación para Alumno (LMS)
              </span>
              <span className="text-[10px] text-slate-400">Puntaje para aprobar: {exam.passingScore}/{exam.questions.length}</span>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {exam.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-white">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedStudentAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            setSelectedStudentAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                            setSubmitted(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-primary/20 border-primary text-teal-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-bold opacity-60">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                onClick={() => setSubmitted(true)}
                className="w-full text-xs font-bold"
              >
                Comprobar Respuestas
              </Button>
            </div>

            {submitted && (
              <div
                className={`p-4 rounded-xl border text-xs font-semibold ${
                  passed
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resultado: {score} de {exam.questions.length} correctas</span>
                </div>
                <p className="text-[11px] opacity-90">
                  {passed
                    ? '¡Aprobado! Cumple con el estándar pedagógico del curso.'
                    : 'No alcanza el puntaje mínimo de aprobación.'}
                </p>
              </div>
            )}
          </Card>

          {/* GIFT Code Preview */}
          <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-primary" />
                Código GIFT para LMS (Moodle / Canvas)
              </span>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-48 leading-relaxed">
              {generateGiftFormat()}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
