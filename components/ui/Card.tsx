'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export default function Card({ children, className = '', hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`glass-panel rounded-xl overflow-hidden shadow-lg p-6 ${
        hoverable ? 'glass-panel-hover cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
