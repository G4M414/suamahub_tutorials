'use client';

import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function Toggle({ checked, onChange, label, className = '' }: ToggleProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`block w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-primary shadow-[0_0_10px_rgba(0,153,139,0.3)]' : 'bg-slate-800 border border-slate-700'
          }`}
        />
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
            checked ? 'transform translate-x-5' : ''
          }`}
        />
      </div>
      {label && <span className="ml-3 text-sm font-medium text-slate-300">{label}</span>}
    </label>
  );
}
