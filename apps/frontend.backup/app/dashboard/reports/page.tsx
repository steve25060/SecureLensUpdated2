'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FileText, ShieldAlert, CheckCircle2, TrendingUp, TrendingDown,
  Plus, Download, MoreVertical, ChevronLeft, ChevronRight,
  RefreshCw, Calendar, Clock, User, Filter,
} from 'lucide-react';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const summaryStats = [
  { label: 'Reports Generated', value: '28', change: '+18% vs last 30 days', up: true,  icon: FileText,     color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { label: 'Critical Findings',  value: '54', change: '+12% vs last 30 days', up: true,  icon: ShieldAlert,  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  { label: 'Resolved Findings',  value: '96', change: '+24% vs last 30 days', up: true,  icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  { label: 'Average Risk Score', value: '72', change: '-8 pts vs last 30 days',up: false, icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
];

const reportsOverTime = [
  { date: 'Apr 17', generated: 18, critical: 8  },
  { date: 'Apr 22', generated: 28, critical: 10 },
  { date: 'Apr 27', generated: 22, critical: 9  },
  { date: 'May 2',  generated: 35, critical: 12 },
  { date: 'May 7',  generated: 30, critical: 11 },
  { date: 'May 12', generated: 42, critical: 14 },
  { date: 'May 16', generated: 38, critical: 13 },
];

const severityData = [
  { name: 'Critical', value: 54,  pct: 22.3, color: '#ef4444' },
  { name: 'High',     value: 78,  pct: 32.2, color: '#f97316' },
  { name: 'Medium',   value: 68,  pct: 28.1, color: '#eab308' },
  { name: 'Low',      value: 30,  pct: 12.4, color: '#22c55e' },
  { name: 'Info',     value: 12,  pct: 5.0,  color: '#3b82f6' },
];

const scheduledReports = [
  { title: 'Executive Summary',        freq: 'Weekly',  next: 'May 20, 2024 9:00 AM',   icon: '📋' },
  { title: 'Security Posture Report',  freq: 'Weekly',  next: 'May 20, 2024 8:00 AM',   icon: '🛡️' },
  { title: 'Compliance Report',        freq: 'Monthly', next: 'Jun 1, 2024 9:00 AM',    icon: '✅' },
  { title: 'Vulnerability Trend Report',freq: 'Weekly', next: 'May 20, 2024 10:00 AM',  icon: '📈' },
  { title: 'Asset Inventory Report',   freq: 'Monthly', next: 'Jun 1, 2024 10:00 AM',   icon: '📦' },
];

const recentReports = [
  { title: 'Acme Corp - Executive Summary',  size: '2.4 MB', date: 'May 16, 2024 10:30 AM', icon: '📋', color: 'text-violet-400' },
  { title: 'Security Posture - Q2 Review',   size: '3.1 MB', date: 'May 15, 2024 09:15 AM', icon: '🛡️', color: 'text-blue-400' },
  { title: 'Vulnerability Analysis Report',  size: '1.8 MB', date: 'May 14, 2024 04:45 PM', icon: '🔍', color: 'text-orange-400' },
  { title: 'Compliance Report - May 2024',   size: '2.7 MB', date: 'May 13, 2024 11:20 AM', icon: '✅', color: 'text-green-400' },
  { title: 'Asset Inventory - Full Scan',    size: '1.2 MB', date: 'May 12, 2024 10:05 AM', icon: '📦', color: 'text-yellow-400' },
];

type ReportStatus = 'Completed' | 'Failed';

const reportHistory: Array<{
  name: string; workspace: string; type: string; generatedBy: string;
  generatedOn: string; status: ReportStatus;
}> = [
  { name: 'Acme Corp - Executive Summary',    workspace: 'acme.com',          type: 'Executive Summary',  generatedBy: 'Alex Johnson', generatedOn: 'May 16, 2024 10:30 AM', status: 'Completed' },
  { name: 'Security Posture - Q2 Review',     workspace: 'acme.com',          type: 'Security Posture',   generatedBy: 'Alex Johnson', generatedOn: 'May 15, 2024 09:15 AM', status: 'Completed' },
  { name: 'Vulnerability Analysis Report',    workspace: 'vulnerable-app',    type: 'Vulnerability',      generatedBy: 'Alex Johnson', generatedOn: 'May 14, 2024 04:45 PM', status: 'Completed' },
  { name: 'Compliance Report - May 2024',     workspace: 'acme.com',          type: 'Compliance',         generatedBy: 'Sarah Chen',   generatedOn: 'May 13, 2024 11:20 AM', status: 'Completed' },
  { name: 'Asset Inventory - Full Scan',      workspace: 'staging.acme.com',  type: 'Asset Inventory',    generatedBy: 'Mike Wilson',  generatedOn: 'May 12, 2024 10:05 AM', status: 'Failed' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const totalPages = 6;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Generate and analyze security reports across your organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            <Calendar size={14} /> Last 30 days
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors">
            <Plus size={14} /> Generate Report
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <motion.div key={s.label} {...fade(0.05 + i * 0.04)}
            className={`bg-gray-900 border rounded-xl p-4 ${s.bg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
              {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {s.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Reports Over Time */}
        <motion.div {...fade(0.15)} className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Reports Over Time</h2>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-violet-400">
                <span className="w-2 h-2 rounded-full bg-violet-400" /> Reports Generated
              </span>
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Critical Findings
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={reportsOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="generated" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 5 }} name="Generated" />
              <Line type="monotone" dataKey="critical"  stroke="#ef4444" strokeWidth={2}   dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} name="Critical"  />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-right">
            <button className="text-xs text-violet-400 hover:text-violet-300">View full analytics →</button>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Findings by Severity */}
          <motion.div {...fade(0.2)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Findings by Severity</h2>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={severityData} cx={40} cy={40} innerRadius={26} outerRadius={42} dataKey="value" stroke="none">
                      {severityData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-white">242</span>
                  <span className="text-[9px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {severityData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="text-gray-500">{s.value} <span className="text-gray-700">({s.pct}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Scheduled Reports */}
          <motion.div {...fade(0.25)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Scheduled Reports</h2>
              <button className="text-xs text-violet-400 hover:text-violet-300">View all →</button>
            </div>
            <div className="space-y-2.5">
              {scheduledReports.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-white">{r.title}</p>
                      <p className="text-[10px] text-gray-500">{r.freq}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">{r.next.split(' ').slice(0, 3).join(' ')}</p>
                    <p className="text-[10px] text-gray-600">{r.next.split(' ').slice(3).join(' ')}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2">
              <Plus size={12} /> New Scheduled Report
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom row: Report History + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Report History */}
        <motion.div {...fade(0.3)} className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Report History</h2>
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 transition-colors">
              <Filter size={12} /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  {['Report Name', 'Workspace', 'Type', 'Generated By', 'Generated On', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 text-xs font-medium text-gray-500 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportHistory.map((r, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium text-white text-xs whitespace-nowrap">{r.name}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{r.workspace}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">{r.type}</td>
                    <td className="py-3 pr-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center">
                          <User size={10} className="text-violet-400" />
                        </div>
                        <span className="text-gray-400 whitespace-nowrap">{r.generatedBy}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">{r.generatedOn}</td>
                    <td className="py-3 pr-4">
                      {r.status === 'Completed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {r.status === 'Completed' ? (
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                            <Download size={13} />
                          </button>
                        ) : (
                          <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                            <RefreshCw size={13} />
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                          <MoreVertical size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">Showing 1 to 5 of 28 reports</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3, '...', totalPages].map((p, i) => (
                <button key={i}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    p === page ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Reports sidebar */}
        <motion.div {...fade(0.35)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Reports</h2>
            <button className="text-xs text-violet-400 hover:text-violet-300">View all →</button>
          </div>
          <div className="space-y-3">
            {recentReports.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{r.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{r.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">PDF · {r.size}</p>
                    <p className="text-[10px] text-gray-600">{r.date}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-700 text-gray-400 hover:text-white transition-all shrink-0">
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
            View all reports →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
