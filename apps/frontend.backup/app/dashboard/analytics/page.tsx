'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Shield, AlertTriangle, Activity,
  Target, Clock, ChevronDown, Info, Download, Plus,
  Calendar, Filter, RefreshCw,
} from 'lucide-react';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const findingsOverTime = [
  { date: 'May 10', critical: 18, high: 32, medium: 45, low: 28, info: 10 },
  { date: 'May 11', critical: 20, high: 35, medium: 48, low: 30, info: 12 },
  { date: 'May 12', critical: 15, high: 28, medium: 42, low: 25, info: 9  },
  { date: 'May 13', critical: 22, high: 38, medium: 52, low: 33, info: 14 },
  { date: 'May 14', critical: 17, high: 30, medium: 46, low: 27, info: 11 },
  { date: 'May 15', critical: 19, high: 34, medium: 50, low: 31, info: 13 },
  { date: 'May 16', critical: 18, high: 42, medium: 52, low: 30, info: 12 },
];

const severityData = [
  { name: 'Critical', value: 18,  pct: 12.7, color: '#ef4444' },
  { name: 'High',     value: 42,  pct: 29.6, color: '#f97316' },
  { name: 'Medium',   value: 52,  pct: 36.6, color: '#eab308' },
  { name: 'Low',      value: 30,  pct: 21.1, color: '#22c55e' },
  { name: 'Info',     value: 12,  pct: 8.5,  color: '#3b82f6' },
];

const topCategories = [
  { name: 'Injection Flaws',           count: 36, pct: 25.6, color: '#ef4444' },
  { name: 'Broken Access Control',     count: 29, pct: 20.9, color: '#f97316' },
  { name: 'Security Misconfigurations',count: 26, pct: 18.6, color: '#eab308' },
  { name: 'XSS',                       count: 23, pct: 16.3, color: '#22c55e' },
  { name: 'Others',                    count: 26, pct: 18.6, color: '#3b82f6' },
];

const riskScoreOverTime = [
  { date: 'Apr 17', score: 68 }, { date: 'Apr 24', score: 72 }, { date: 'May 1', score: 65 },
  { date: 'May 8',  score: 70 }, { date: 'May 16', score: 72 },
];

const recentScans = [
  { workspace: 'acme.com',         type: 'Website Analysis',  status: 'Completed', findings: 22, score: 85, duration: '12m 45s', completedAt: 'May 16, 2024 10:30 AM' },
  { workspace: 'vulnerable-app',   type: 'Full Scan',         status: 'Completed', findings: 18, score: 68, duration: '24m 12s', completedAt: 'May 16, 2024 09:15 AM' },
  { workspace: 'staging.acme.com', type: 'Vulnerability Scan',status: 'Completed', findings: 8,  score: 45, duration: '8m 22s',  completedAt: 'May 16, 2024 08:45 AM' },
  { workspace: 'shopify-clone',    type: 'Website Analysis',  status: 'Completed', findings: 5,  score: 32, duration: '6m 18s',  completedAt: 'May 15, 2024 11:20 PM' },
  { workspace: 'api.acme.com',     type: 'API Scan',          status: 'Completed', findings: 3,  score: 28, duration: '9m 5s',   completedAt: 'May 15, 2024 10:10 PM' },
];

const insights = [
  { icon: TrendingDown, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', title: 'Critical findings decreased by 28%', sub: 'Great job! Keep maintaining your security posture.' },
  { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', title: 'Injection flaws are the top risk', sub: 'Consider prioritizing fixes for injection vulnerabilities.' },
  { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Scan coverage improved by 18%', sub: 'You scanned more assets this week.' },
];

const stats = [
  { label: 'Total Scans',        value: '24',   change: '+26%', up: true,  icon: Activity,  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  { label: 'Assets Scanned',     value: '1,248',change: '+18%', up: true,  icon: Target,    color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Findings',           value: '142',  change: '-12%', up: false, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Critical Findings',  value: '18',   change: '-26%', up: false, icon: Shield,    color: 'text-red-400',    bg: 'bg-red-500/10' },
  { label: 'Avg Risk Score',     value: '72',   change: '-8 pts',up: false,icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const scoreColor = (s: number) =>
  s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : s >= 40 ? 'text-orange-400' : 'text-red-400';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('May 10 – May 16, 2024');
  const [chartMode, setChartMode] = useState<'Daily' | 'Weekly'>('Daily');

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visualize security trends and metrics across your organization.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            <Calendar size={14} />
            {timeRange}
            <ChevronDown size={14} className="text-gray-500" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            <Download size={14} />
            Export Dashboard
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors">
            <Plus size={14} />
            Add Widget
          </button>
        </div>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <motion.div {...fade(0.05)} className="flex items-center gap-1 border-b border-gray-800">
        {['Overview', 'Trends', 'Assets', 'Vulnerabilities', 'Compliance', 'Attack Surface', 'Benchmarks'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === 'Overview'
                ? 'text-violet-400 border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fade(0.05 + i * 0.05)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={16} className={s.color} />
              </div>
              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            {/* Sparkline placeholder */}
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={findingsOverTime.map((d, idx) => ({ v: d.critical + idx * 2 }))}>
                  <Line type="monotone" dataKey="v" stroke={s.color.replace('text-', '#').replace('-400', '')} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Findings Over Time */}
        <motion.div {...fade(0.15)} className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Findings Over Time</h2>
              <Info size={13} className="text-gray-600" />
            </div>
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value as 'Daily' | 'Weekly')}
              className="bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded-lg px-3 py-1.5 outline-none"
            >
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap mb-3">
            {[{ label: 'Critical', color: '#ef4444' }, { label: 'High', color: '#f97316' }, { label: 'Medium', color: '#eab308' }, { label: 'Low', color: '#22c55e' }, { label: 'Info', color: '#3b82f6' }].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={findingsOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {[{ id: 'critical', color: '#ef4444' }, { id: 'high', color: '#f97316' }, { id: 'medium', color: '#eab308' }, { id: 'low', color: '#22c55e' }].map((g) => (
                  <linearGradient key={g.id} id={`grad-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={g.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={g.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#grad-critical)" />
              <Area type="monotone" dataKey="high"     stroke="#f97316" strokeWidth={2} fill="url(#grad-high)"     />
              <Area type="monotone" dataKey="medium"   stroke="#eab308" strokeWidth={2} fill="url(#grad-medium)"   />
              <Area type="monotone" dataKey="low"      stroke="#22c55e" strokeWidth={2} fill="url(#grad-low)"      />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Score Over Time */}
        <motion.div {...fade(0.2)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white">Risk Score Over Time</h2>
            <button className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1">
              Last 30 days <ChevronDown size={12} />
            </button>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-white">72</span>
            <span className="text-sm text-gray-400 pb-1">/100</span>
            <span className="text-xs text-red-400 font-medium pb-1 flex items-center gap-0.5 ml-1">
              <TrendingDown size={11} /> -8 pts
            </span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={riskScoreOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6, fill: '#a78bfa' }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Top Vulnerability Categories */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white">Top Vulnerability Categories</h3>
              <button className="text-xs text-violet-400 hover:text-violet-300">View all →</button>
            </div>
            <div className="space-y-2.5">
              {topCategories.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">{c.name}</span>
                    <span className="text-gray-400 font-medium">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Second Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Findings by Severity donut */}
        <motion.div {...fade(0.25)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white">Findings by Severity</h2>
            <Info size={13} className="text-gray-600" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={severityData} cx={65} cy={65} innerRadius={40} outerRadius={62}
                    dataKey="value" stroke="none">
                    {severityData.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">142</span>
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {severityData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="text-gray-400">{s.value} <span className="text-gray-600">({s.pct}%)</span></span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div {...fade(0.3)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Insights</h2>
              <Info size={13} className="text-gray-600" />
            </div>
            <button className="text-xs text-violet-400 hover:text-violet-300">View all →</button>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-xl border ${ins.bg}`}>
                <ins.icon size={16} className={`${ins.color} mt-0.5 shrink-0`} />
                <div>
                  <p className="text-xs font-medium text-white">{ins.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{ins.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Findings by Source bar chart */}
        <motion.div {...fade(0.35)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white">Findings by Source</h2>
            <div className="flex items-center gap-2 ml-auto">
              <span className="flex items-center gap-1 text-[11px] text-blue-400"><span className="w-2 h-2 rounded-sm bg-blue-400" /> Nuclei</span>
              <span className="flex items-center gap-1 text-[11px] text-violet-400"><span className="w-2 h-2 rounded-sm bg-violet-400" /> OWASP ZAP</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { name: 'Critical', nuclei: 12, zap: 6  },
              { name: 'High',     nuclei: 16, zap: 16 },
              { name: 'Medium',   nuclei: 18, zap: 18 },
              { name: 'Low',      nuclei: 8,  zap: 16 },
              { name: 'Info',     nuclei: 4,  zap: 4  },
            ]} barCategoryGap="35%" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="nuclei" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="zap"    fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Recent Scans Performance ────────────────────────────────────── */}
      <motion.div {...fade(0.4)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Recent Scans Performance</h2>
            <Info size={13} className="text-gray-600" />
          </div>
          <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View all scans →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-800">
                {['Workspace', 'Scan Type', 'Status', 'Findings', 'Risk Score', 'Duration', 'Completed At'].map((h) => (
                  <th key={h} className="pb-3 text-xs font-medium text-gray-500 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 pr-4 font-medium text-white">{scan.workspace}</td>
                  <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">{scan.type}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-orange-400 font-medium">{scan.findings}</span>
                    <span className="text-gray-600 ml-1">●</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-bold ${scoreColor(scan.score)}`}>{scan.score}</span>
                    <span className="text-gray-500 text-xs">/100</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 flex items-center gap-1">
                    <Clock size={12} className="text-gray-600" />{scan.duration}
                  </td>
                  <td className="py-3 text-gray-400 text-xs whitespace-nowrap">{scan.completedAt}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
