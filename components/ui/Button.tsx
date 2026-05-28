'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(0,153,139,0.25)] hover:shadow-[0_0_20px_rgba(0,153,139,0.4)] focus:ring-primary/50',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white shadow-[0_0_15px_rgba(2,82,104,0.25)] hover:shadow-[0_0_20px_rgba(2,82,104,0.4)] focus:ring-secondary/50',
    accent: 'bg-accent hover:bg-accent/90 text-slate-900 focus:ring-accent/50',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500/50',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
