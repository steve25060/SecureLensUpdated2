'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/common/Sidebar';
import Header from '@/components/dashboard/common/Header';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-900 text-white" style={{ backgroundColor: '#0a0a0f', color: '#f1f5f9' }}>
      {/* Sidebar */}
      <Sidebar />
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
