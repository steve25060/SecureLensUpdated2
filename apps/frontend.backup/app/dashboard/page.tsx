'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Plus, Calendar, Shield, ShieldAlert, Globe, GitBranch, Layers } from 'lucide-react';
import type { DashboardOverview, RecentScan, ScanActivity } from '@/types/dashboard';

// ─── Seed data (shown when API is unreachable) ─────────────────────────────────
const SEED: DashboardOverview = {
  securityScores: [
    { name: 'Overall Security Score', score: 84, label: 'Great',     color: 'green',  change: '+12 pts vs last 7 days' },
    { name: 'Authentication Score',   score: 42, label: 'Poor',      color: 'red',    change: '-8 pts vs last 7 days'  },
    { name: 'API Security Score',     score: 91, label: 'Excellent', color: 'green',  change: '+15 pts vs last 7 days' },
    { name: 'Headers Score',          score: 78, label: 'Good',      color: 'yellow', change: '+5 pts vs last 7 days'  },
    { name: 'Dependency Score',       score: 88, label: 'Good',      color: 'green',  change: '+10 pts vs last 7 days' },
    { name: 'Secrets Score',          score: 93, label: 'Excellent', color: 'green',  change: '+18 pts vs last 7 days' },
  ],
  riskOverview: {
    total: 51,
    critical: { count: 2,  pct: 4  },
    high:     { count: 12, pct: 24 },
    medium:   { count: 12, pct: 24 },
    low:      { count: 25, pct: 48 },
  },
  findingsOverTime: [
    { date: 'May 10', critical: 2,  high: 8,  medium: 15, low: 25 },
    { date: 'May 11', critical: 3,  high: 12, medium: 18, low: 30 },
    { date: 'May 12', critical: 1,  high: 10, medium: 12, low: 22 },
    { date: 'May 13', critical: 4,  high: 15, medium: 20, low: 35 },
    { date: 'May 14', critical: 2,  high: 11, medium: 16, low: 28 },
    { date: 'May 15', critical: 3,  high: 14, medium: 18, low: 32 },
    { date: 'May 16', critical: 2,  high: 12, medium: 12, low: 25 },
  ],
  topVulnerabilityTypes: [
    { name: 'Missing Security Header',    count: 12 },
    { name: 'Weak Cookie Settings',       count: 8  },
    { name: 'SQL Injection',              count: 6  },
    { name: 'Cross-Site Scripting (XSS)', count: 5  },
    { name: 'Vulnerable Dependency',      count: 4  },
  ],
  recentScans: [
    { id: 'scan-001', target: 'acme.com',          type: 'WEBSITE',  status: 'COMPLETED', score: 84, findingsCount: 51, time: 'Just now' },
    { id: 'scan-002', target: 'vulnerable-app',    type: 'GITHUB',   status: 'COMPLETED', score: 67, findingsCount: 38, time: '2h ago'   },
    { id: 'scan-003', target: 'staging.acme.com',  type: 'WEBSITE',  status: 'COMPLETED', score: 72, findingsCount: 34, time: '1d ago'   },
    { id: 'scan-004', target: 'shopify-clone',     type: 'COMBINED', status: 'COMPLETED', score: 90, findingsCount: 23, time: '1d ago'   },
    { id: 'scan-005', target: 'legacy-api',        type: 'GITHUB',   status: 'FAILED',    score: null, findingsCount: 0, time: '2d ago'  },
  ],
  scanActivity: [
    { message: 'Nuclei Scan Completed',        detail: '45 findings',       time: '1m ago', type: 'success' },
    { message: 'OWASP ZAP Completed',          detail: '12 alerts',         time: '2m ago', type: 'success' },
    { message: 'Nmap Scan Completed',          detail: '8 open ports',      time: '3m ago', type: 'success' },
    { message: 'Asset Discovery Completed',    detail: '23 assets found',   time: '4m ago', type: 'success' },
    { message: 'Scan Correlation Completed',   detail: '51 unique findings', time: '5m ago', type: 'info'    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (score: number) => {
  if (score >= 80) return { ring: '#22c55e', label: 'text-green-400' };
  if (score >= 60) return { ring: '#eab308', label: 'text-yellow-400' };
  if (score >= 40) return { ring: '#f97316', label: 'text-orange-400' };
  return { ring: '#ef4444', label: 'text-red-400' };
};

const riskDonutData = (r: DashboardOverview['riskOverview']) => [
  { name: 'Critical', value: r.critical.count, color: '#ef4444' },
  { name: 'High',     value: r.high.count,     color: '#f97316' },
  { name: 'Medium',   value: r.medium.count,   color: '#eab308' },
  { name: 'Low',      value: r.low.count,      color: '#22c55e' },
];

const typeBadge = (type: RecentScan['type']) => {
  const map = {
    WEBSITE:  { label: 'Website',  cls: 'bg-blue-500/20 text-blue-400',   icon: <Globe size={10} /> },
    GITHUB:   { label: 'GitHub',   cls: 'bg-purple-500/20 text-purple-400', icon: <GitBranch size={10} /> },
    COMBINED: { label: 'Both',     cls: 'bg-teal-500/20 text-teal-400',   icon: <Layers size={10} /> },
  };
  return map[type];
};

const statusBadge = (status: RecentScan['status']) => ({
  COMPLETED: 'bg-green-500/20 text-green-400',
  FAILED:    'bg-red-500/20 text-red-400',
  RUNNING:   'bg-yellow-500/20 text-yellow-400',
  PENDING:   'bg-gray-500/20 text-gray-400',
}[status]);

const activityDot = (type: ScanActivity['type']) => ({
  success: 'bg-green-400',
  info:    'bg-blue-400',
  warning: 'bg-yellow-400',
  error:   'bg-red-400',
}[type]);

// ─── Score Gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score, label, name, change }: { score: number; label: string; name: string; change: string }) {
  const { ring, label: labelCls } = scoreColor(score);
  const data = [{ value: score }, { value: 100 - score }];
  const isPositive = change.startsWith('+');
  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center gap-2"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs text-gray-400 text-center font-medium">{name}</p>
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              <Cell fill={ring} />
              <Cell fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${labelCls}`}>{score}</span>
          <span className="text-[10px] text-gray-500">/100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold ${labelCls}`}>{label}</span>
      <span className={`text-[10px] ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview>(SEED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    fetch('/api/dashboard/overview', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => setData(json))
      .catch(() => { /* keep seed data */ })
      .finally(() => setLoading(false));
  }, []);

  const donut = riskDonutData(data.riskOverview);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here&apos;s what&apos;s happening with your security posture.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm hover:border-gray-600 transition-colors">
            <Calendar size={14} /> Last 7 days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
            <Plus size={14} /> New Scan
          </button>
        </div>
      </div>

      {/* ── Security Score Gauges ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.securityScores.map(s => (
            <ScoreGauge key={s.name} score={s.score} label={s.label} name={s.name} change={s.change} />
          ))}
        </div>
      )}

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Risk Overview donut */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Risk Overview</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} cx="50%" cy="50%" innerRadius={42} outerRadius={58} dataKey="value" strokeWidth={0}>
                    {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{data.riskOverview.total}</span>
                <span className="text-[10px] text-gray-400">Total Findings</span>
              </div>
            </div>
            <div className="mt-4 w-full space-y-2">
              {[
                { label: 'Critical', ...data.riskOverview.critical, color: 'bg-red-500' },
                { label: 'High',     ...data.riskOverview.high,     color: 'bg-orange-500' },
                { label: 'Medium',   ...data.riskOverview.medium,   color: 'bg-yellow-500' },
                { label: 'Low',      ...data.riskOverview.low,      color: 'bg-green-500' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.color}`} />
                    <span className="text-gray-400">{r.label}</span>
                  </div>
                  <span className="text-gray-300">{r.count} <span className="text-gray-500">({r.pct}%)</span></span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors">View all findings →</button>
        </div>

        {/* Findings Over Time chart */}
        <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Findings Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.findingsOverTime}>
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" />
              <Line type="monotone" dataKey="high"     stroke="#f97316" strokeWidth={2} dot={false} name="High" />
              <Line type="monotone" dataKey="medium"   stroke="#eab308" strokeWidth={2} dot={false} name="Medium" />
              <Line type="monotone" dataKey="low"      stroke="#22c55e" strokeWidth={2} dot={false} name="Low" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Vulnerability Types */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Vulnerability Types</h3>
          <div className="space-y-3">
            {data.topVulnerabilityTypes.map(v => (
              <div key={v.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate pr-2">{v.name}</span>
                <span className="text-white font-semibold shrink-0">{v.count}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors">View all analytics →</button>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Scans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Target', 'Type', 'Status', 'Score', 'Findings', 'Time'].map(h => (
                    <th key={h} className="pb-2 text-left text-gray-500 font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.recentScans.map(scan => {
                  const type = typeBadge(scan.type);
                  return (
                    <tr key={scan.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-200 font-medium">{scan.target}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${type.cls}`}>
                          {type.icon}{type.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusBadge(scan.status)}`}>
                          {scan.status === 'COMPLETED' ? 'Completed' : scan.status === 'FAILED' ? 'Failed' : scan.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-semibold" style={{ color: scan.score ? scoreColor(scan.score).ring : '#6b7280' }}>
                        {scan.score ? `${scan.score}/100` : '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-300">{scan.findingsCount}</td>
                      <td className="py-2.5 text-gray-500">{scan.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors">View all scans →</button>
        </div>

        {/* Scan Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Scan Activity</h3>
          <div className="space-y-4">
            {data.scanActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activityDot(a.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 font-medium">{a.message}</p>
                  <p className="text-[11px] text-gray-500">{a.detail}</p>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors">View full timeline →</button>
        </div>
      </div>
    </motion.div>
  );
}
