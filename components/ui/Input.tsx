'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, type = 'text', value, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3.5 text-slate-500 pointer-events-none">{icon}</div>}
          <input
            type={type}
            ref={ref}
            value={value ?? ''}
            className={`w-full bg-slate-950/40 border ${
              error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-800 focus:border-primary/50 focus:ring-primary/20'
            } text-slate-100 placeholder-slate-500 text-sm rounded-lg py-2 ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } outline-none transition-all duration-200 focus:ring-4 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
