'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Search, Shield, Lock, Code2, Package, CheckCircle2, Clock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { scanService, AvailableEngine } from '@/services/scan.service';

const ENGINES = [
  { name: 'Semgrep',       desc: 'SAST Scanner',          defaultOn: true  },
  { name: 'Gitleaks',      desc: 'Secret Detection',       defaultOn: true  },
  { name: 'Trivy',         desc: 'Dependency Scanner',     defaultOn: true  },
  { name: 'Nuclei Templates', desc: 'CVE Detection',      defaultOn: true  },
  { name: 'Checkov',       desc: 'IaC Security',           defaultOn: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function GitHubScanPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [engines, setEngines] = useState(ENGINES.filter(e => e.defaultOn).map(e => e.name));
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [prAnalysis, setPrAnalysis] = useState(true);
  const [autoscan, setAutoscan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScans = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/scans?mode=github', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setRecentScans(Array.isArray(data) ? data : []);
        }
      } catch (error) { console.error('Failed to load recent scans:', error); }
      finally { setLoading(false); }
    };
    loadScans();
  }, []);

  const toggle = (name: string) =>
    setEngines(prev => prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]);

  const startScan = async () => {
    if (!repoUrl) return;
    setScanning(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/scans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ mode: 'github', target: repoUrl, branch, engines }),
      });
      if (response.ok) {
        const scansList = await fetch('/api/scans?mode=github', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (scansList.ok) setRecentScans(await scansList.json());
        setRepoUrl('');
      }
    } catch (error) { console.error('Failed to start scan:', error); }
    finally { setScanning(false); }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GitHub Scan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Scan your GitHub repositories for security vulnerabilities in source code.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Repository</h3>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Repository URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <GitBranch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] text-sm text-gray-300 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all">
                  <ExternalLink size={13} /> Connect
                </motion.button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors">
                  <option>main</option><option>master</option><option>develop</option><option>staging</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-500 rounded" />
                  <span className="text-sm text-gray-400">Include submodules</span>
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Scan Engines</h3>
              <button onClick={() => setEngines(ENGINES.map(e => e.name))} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Select All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENGINES.map(eng => (
                <label key={eng.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  engines.includes(eng.name) ? 'border-violet-500/30 bg-violet-600/10' : 'border-white/[0.06] hover:border-white/[0.1] bg-white/[0.02]'
                }`}>
                  <input type="checkbox" checked={engines.includes(eng.name)} onChange={() => toggle(eng.name)} className="mt-0.5 w-4 h-4 accent-violet-500 rounded" />
                  <div>
                    <p className="text-sm font-medium text-white">{eng.name}</p>
                    <p className="text-xs text-gray-500">{eng.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Scan Settings</h3>
            <div>
              <label className="text-xs text-gray-500 block mb-2">Scan Depth</label>
              <div className="flex gap-2">
                {(['quick', 'standard', 'deep'] as const).map(d => (
                  <button key={d} onClick={() => setDepth(d)}
                    className={`flex-1 py-2 text-sm rounded-xl border transition-all capitalize font-medium ${
                      depth === d ? 'border-violet-500/30 bg-violet-600/20 text-violet-300' : 'border-white/[0.06] text-gray-500 hover:border-white/[0.1] bg-white/[0.02]'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Enable PR Analysis', desc: 'Scan pull requests automatically', val: prAnalysis, set: setPrAnalysis },
                { label: 'Auto-scan on push', desc: 'Trigger scan on every git push', val: autoscan, set: setAutoscan },
              ].map(opt => (
                <div key={opt.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm text-gray-300">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                  <button onClick={() => opt.set(!opt.val)}
                    className={`relative w-10 rounded-full transition-all ${opt.val ? 'bg-violet-600' : 'bg-white/[0.06]'}`}
                    style={{ height: '22px', width: '40px' }}>
                    <motion.span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow" animate={{ x: opt.val ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">What gets scanned</h3>
            <div className="space-y-3">
              {[
                { icon: Code2,   label: 'Source code analysis',           color: 'text-blue-400' },
                { icon: Lock,    label: 'Hardcoded secrets detection',      color: 'text-red-400' },
                { icon: Package, label: 'Dependency vulnerabilities',       color: 'text-orange-400' },
                { icon: Shield,  label: 'Security misconfigurations',      color: 'text-yellow-400' },
                { icon: Search,  label: 'OWASP Top 10 checks',             color: 'text-green-400' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <Icon size={14} className={item.color} />
                    <span className="text-xs text-gray-400">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startScan} disabled={!repoUrl || scanning}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2">
            {scanning ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Starting…</> : <><ExternalLink size={16} /> Start GitHub Scan</>}
          </motion.button>
        </div>
      </div>

      <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent GitHub Scans</h3>
          <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 group/btn">
            View all <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-2" />
            Loading scans...
          </div>
        ) : recentScans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No scans yet. Start a GitHub scan above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Repository', 'Branch', 'Status', 'Findings', 'Risk Score', 'Date'].map(h => (
                    <th key={h} className="pb-2.5 text-left text-gray-500 font-medium pr-6 text-[11px] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentScans.map((scan: any, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-6 text-gray-200 font-medium">{scan.repoUrl || scan.target || '—'}</td>
                    <td className="py-3 pr-6 text-gray-500">{scan.branch || 'main'}</td>
                    <td className="py-3 pr-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        scan.status === 'completed' || scan.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {scan.status === 'completed' || scan.status === 'COMPLETED' ? <CheckCircle2 size={9} /> : <AlertTriangle size={9} />}
                        {scan.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-gray-400">{scan.findingsCount || 0}</td>
                    <td className="py-3 pr-6 font-bold" style={{ color: (scan.riskScore || 0) >= 80 ? '#22c55e' : (scan.riskScore || 0) >= 60 ? '#eab308' : '#ef4444' }}>
                      {scan.riskScore ? `${scan.riskScore}/100` : '—'}
                    </td>
                    <td className="py-3 text-gray-500 flex items-center gap-1"><Clock size={10} />{scan.createdAt || 'just now'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
