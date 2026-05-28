'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface ModuleShellProps {
  children: React.ReactNode;
}

export default function ModuleShell({ children }: ModuleShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 antialiased font-sans">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Content Area - shifted right to account for Sidebar width */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Header - fixed top of content area */}
        <Header />

        {/* Scrollable Page Content */}
        <main className="flex-1 p-8 overflow-y-auto relative animate-fade-in">
          {/* Radial light effect background */}
          <div className="glow-bg" />
          
          {children}
        </main>
      </div>
    </div>
  );
}
