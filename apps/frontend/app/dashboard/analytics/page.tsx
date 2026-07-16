'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Shield, AlertTriangle, Activity,
  Target, Clock, ChevronDown, Download, RefreshCw, ArrowRight,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({
    findingsOverTime: [],
    severityData: [],
    topCategories: [],
    riskScoreOverTime: [],
    recentScans: [],
    stats: { totalFindings: 0, avgRiskScore: 0, scanCompletionRate: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => { loadAnalytics(); }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/analytics/overview?range=${timeRange}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData || { findingsOverTime: [], severityData: [], topCategories: [], riskScoreOverTime: [], recentScans: [], stats: { totalFindings: 0, avgRiskScore: 0, scanCompletionRate: 0 } });
      }
    } catch (error) { console.error('Failed to load analytics:', error); }
    finally { setLoading(false); }
  };

  const stats = [
    { label: 'Total Findings', value: data.stats?.totalFindings || 0, change: '+12%', up: true, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Avg Risk Score', value: data.stats?.avgRiskScore || 0, change: '-3 pts', up: false, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Scan Completion', value: `${data.stats?.scanCompletionRate || 0}%`, change: '+5%', up: true, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Protected Assets', value: '428', change: '+24', up: true, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Security metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white/[0.04] rounded-xl text-gray-500 hover:text-gray-300 transition-colors">
            <RefreshCw size={18} />
          </motion.button>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} whileHover={{ y: -1 }}
              className={`${stat.bg} border border-white/[0.04] rounded-xl p-5 transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={stat.color} />
                {stat.up ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-xs mt-2 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Findings Over Time</h2>
          {data.findingsOverTime && data.findingsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.findingsOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.2} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#colorCritical)" name="Critical" />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="url(#colorHigh)" name="High" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Severity Distribution</h2>
          {data.severityData && data.severityData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={data.severityData.filter((s: any) => s.value > 0)} cx={40} cy={40} innerRadius={20} outerRadius={35} dataKey="value" stroke="none">
                    {data.severityData.filter((s: any) => s.value > 0).map((e: any) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.severityData.map((s: any) => (
                  <div key={s.name} className="text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="text-gray-600 ml-5">{s.value} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No data</div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Risk Score Trend</h2>
          {data.riskScoreOverTime && data.riskScoreOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data.riskScoreOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">No trend data</div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Top Categories</h2>
          {data.topCategories && data.topCategories.length > 0 ? (
            <div className="space-y-3">
              {data.topCategories.slice(0, 5).map((cat: any, i: number) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-600 font-mono w-3">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{cat.name}</span>
                      <span className="text-xs text-gray-500">{cat.count}</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500"
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No category data</div>
          )}
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Scans</h2>
          <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 group/btn">
            View all <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {data.recentScans && data.recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="pb-2.5 text-left text-gray-500 font-medium pr-4 text-[11px] uppercase tracking-wider">Workspace</th>
                  <th className="pb-2.5 text-left text-gray-500 font-medium pr-4 text-[11px] uppercase tracking-wider">Type</th>
                  <th className="pb-2.5 text-left text-gray-500 font-medium pr-4 text-[11px] uppercase tracking-wider">Status</th>
                  <th className="pb-2.5 text-left text-gray-500 font-medium pr-4 text-[11px] uppercase tracking-wider">Findings</th>
                  <th className="pb-2.5 text-left text-gray-500 font-medium pr-4 text-[11px] uppercase tracking-wider">Risk Score</th>
                  <th className="pb-2.5 text-left text-gray-500 font-medium text-[11px] uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.recentScans.slice(0, 5).map((scan: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 text-gray-200 font-medium">{scan.workspace || 'N/A'}</td>
                    <td className="py-3 pr-4 text-gray-500">{scan.type || 'Full Scan'}</td>
                    <td className="py-3 pr-4"><span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-[10px]">{scan.status || 'Completed'}</span></td>
                    <td className="py-3 pr-4 font-bold text-white">{scan.findings || 0}</td>
                    <td className="py-3 pr-4 font-bold" style={{ color: (scan.score || 0) >= 80 ? '#22c55e' : '#f97316' }}>{scan.score || 0}/100</td>
                    <td className="py-3 text-gray-500">{scan.duration || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No recent scans</div>
        )}
      </motion.div>
    </motion.div>
  );
}
