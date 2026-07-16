'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Plus, Calendar, Clock, Shield, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Search, Eye, BarChart3, PieChart, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

const reports = [
  { id: 1, name: 'Executive Security Summary', type: 'Executive', status: 'Completed', date: '2024-05-16', pages: 12, findings: 51, score: 84 },
  { id: 2, name: 'Weekly Vulnerability Report', type: 'Vulnerability', status: 'Completed', date: '2024-05-15', pages: 24, findings: 28, score: 72 },
  { id: 3, name: 'Compliance Audit: SOC 2', type: 'Compliance', status: 'Generating', date: '2024-05-14', pages: null, findings: null, score: null },
  { id: 4, name: 'Asset Inventory Overview', type: 'Asset', status: 'Completed', date: '2024-05-13', pages: 8, findings: null, score: 91 },
  { id: 5, name: 'Security Posture Assessment', type: 'Security', status: 'Completed', date: '2024-05-12', pages: 18, findings: 34, score: 78 },
];

const severityData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 28, color: '#f97316' },
  { name: 'Medium', value: 35, color: '#eab308' },
  { name: 'Low', value: 25, color: '#22c55e' },
];

const weeklyData = [
  { week: 'W1', critical: 5, high: 12, resolved: 8 },
  { week: 'W2', critical: 3, high: 15, resolved: 14 },
  { week: 'W3', critical: 7, high: 10, resolved: 12 },
  { week: 'W4', critical: 2, high: 8, resolved: 18 },
];

export default function ReportsPage() {
  const [search, setSearch] = useState('');

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Security reports and compliance documentation.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm font-medium transition-all shadow-lg shadow-violet-600/20">
          <Plus size={15} /> Generate Report
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Report Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }} />
              <Bar dataKey="critical" fill="#ef4444" radius={[4, 4, 0, 0]} name="Critical" />
              <Bar dataKey="high" fill="#f97316" radius={[4, 4, 0, 0]} name="High" />
              <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Severity Breakdown</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <RePieChart>
                <Pie data={severityData} cx={40} cy={40} innerRadius={20} outerRadius={35} dataKey="value" strokeWidth={0}>
                  {severityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 flex-1">
              {severityData.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-gray-400">{s.name}</span>
                  <span className="text-gray-500 ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4">
        {filtered.map((report, i) => (
          <motion.div key={report.id} variants={itemVariants}
            className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20">
                  <FileText size={18} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{report.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.06]">{report.type}</span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1"><Calendar size={10} />{report.date}</span>
                    {report.pages && <span className="text-[11px] text-gray-500">{report.pages} pages</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {report.score && (
                  <span className={`text-sm font-bold ${report.score >= 80 ? 'text-green-400' : report.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {report.score}/100
                  </span>
                )}
                <span className={`text-[10px] px-2.5 py-1 rounded-md border font-medium ${
                  report.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {report.status}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500"><Eye size={14} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500"><Download size={14} /></motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
