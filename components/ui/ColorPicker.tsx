'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close popover when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col space-y-1.5 font-sans relative">
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>}
      
      <div className="flex items-center space-x-2">
        {/* Color preview circle (button trigger) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border border-slate-700 shadow-inner cursor-pointer transition-all duration-200 hover:scale-105 outline-none focus:ring-2 focus:ring-primary/45"
          style={{ backgroundColor: color || '#ffffff' }}
        />
        
        {/* Text Input for HEX */}
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-950/40 border border-slate-800 focus:border-primary/50 text-slate-100 text-sm font-mono rounded-lg px-3 py-2 w-28 uppercase outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          placeholder="#FFFFFF"
        />
      </div>

      {/* Color picker Popover */}
      {isOpen && mounted && (
        <div 
          ref={popoverRef}
          className="absolute z-50 top-18 left-0 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-fade-in"
        >
          <HexColorPicker color={color} onChange={onChange} />
          <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
            <span>HEX: <span className="font-mono text-white uppercase">{color}</span></span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary hover:underline font-semibold"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
