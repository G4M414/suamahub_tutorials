'use client';

import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-slate-950/40 border ${
            error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-800 focus:border-primary/50 focus:ring-primary/20'
          } text-slate-100 placeholder-slate-500 text-sm rounded-lg px-4 py-3 outline-none transition-all duration-200 focus:ring-4 resize-y ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export default TextArea;
