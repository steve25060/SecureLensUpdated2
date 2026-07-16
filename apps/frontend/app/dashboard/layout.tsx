'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/common/Sidebar';
import Header from '@/components/dashboard/common/Header';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(124,58,237,0.08)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.06)_0%,_transparent_50%)]" />
      </div>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
