'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Search, Shield, Lock, Code2, Package, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const ENGINES = [
  { name: 'Semgrep',       desc: 'SAST Scanner',          defaultOn: true  },
  { name: 'Gitleaks',      desc: 'Secret Detection',       defaultOn: true  },
  { name: 'Trivy',         desc: 'Dependency Scanner',     defaultOn: true  },
  { name: 'Nuclei Templates', desc: 'CVE Detection',      defaultOn: true  },
  { name: 'Checkov',       desc: 'IaC Security',           defaultOn: false },
];

const RECENT_SCANS = [
  { repo: 'demo/vulnerable-app',    branch: 'main',    status: 'COMPLETED', findings: 38, score: 67, date: '2h ago'  },
  { repo: 'demo/shopify-clone',     branch: 'develop', status: 'COMPLETED', findings: 14, score: 82, date: '1d ago'  },
  { repo: 'demo/payment-service',   branch: 'main',    status: 'COMPLETED', findings: 7,  score: 91, date: '3d ago'  },
  { repo: 'demo/legacy-api',        branch: 'master',  status: 'FAILED',    findings: 0,  score: 0,  date: '5d ago'  },
];

export default function GitHubScanPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [engines, setEngines] = useState(ENGINES.filter(e => e.defaultOn).map(e => e.name));
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [prAnalysis, setPrAnalysis] = useState(true);
  const [autoscan, setAutoscan] = useState(false);
  const [scanning, setScanning] = useState(false);

  const toggle = (name: string) =>
    setEngines(prev => prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]);

  const startScan = () => {
    if (!repoUrl) return;
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">GitHub Scan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Scan your GitHub repositories for security vulnerabilities in source code.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Repo input */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Repository</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Repository URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <GitBranch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500" />
                </div>
                <button className="px-4 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 text-sm text-gray-300 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors">
                  <GitBranch size={13} /> Connect GitHub
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500">
                  <option>main</option><option>master</option><option>develop</option><option>staging</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-gray-300">Include submodules</span>
                </label>
              </div>
            </div>
          </div>

          {/* Engines */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Scan Engines</h3>
              <button onClick={() => setEngines(ENGINES.map(e => e.name))} className="text-xs text-violet-400 hover:text-violet-300">Select All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENGINES.map(eng => (
                <label key={eng.name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  engines.includes(eng.name) ? 'border-violet-500/50 bg-violet-600/5' : 'border-gray-700 hover:border-gray-600'
                }`}>
                  <input type="checkbox" checked={engines.includes(eng.name)} onChange={() => toggle(eng.name)} className="mt-0.5 w-4 h-4 accent-violet-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{eng.name}</p>
                    <p className="text-xs text-gray-500">{eng.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Scan settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Scan Settings</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-2">Scan Depth</label>
              <div className="flex gap-2">
                {(['quick', 'standard', 'deep'] as const).map(d => (
                  <button key={d} onClick={() => setDepth(d)}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-all capitalize font-medium ${
                      depth === d ? 'border-violet-500 bg-violet-600/20 text-violet-300' : 'border-gray-700 text-gray-400 hover:border-gray-600'
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
                <div key={opt.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                  <button onClick={() => opt.set(!opt.val)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${opt.val ? 'bg-violet-600' : 'bg-gray-700'}`}
                    style={{ height: '22px', width: '40px' }}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${opt.val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* What gets scanned */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">What gets scanned</h3>
            <div className="space-y-3">
              {[
                { icon: Code2,   label: 'Source code analysis',           color: 'text-blue-400'   },
                { icon: Lock,    label: 'Hardcoded secrets detection',      color: 'text-red-400'    },
                { icon: Package, label: 'Dependency vulnerabilities',       color: 'text-orange-400' },
                { icon: Shield,  label: 'Security misconfigurations',      color: 'text-yellow-400' },
                { icon: Search,  label: 'OWASP Top 10 checks',             color: 'text-green-400'  },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <Icon size={14} className={item.color} />
                    <span className="text-xs text-gray-300">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          <button onClick={startScan} disabled={!repoUrl || scanning}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {scanning ? <><span className="animate-spin">⟳</span> Starting…</> : <><GitBranch size={16} /> Start GitHub Scan</>}
          </button>
        </div>
      </div>

      {/* Recent scans */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent GitHub Scans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {['Repository', 'Branch', 'Status', 'Findings', 'Risk Score', 'Date'].map(h => (
                  <th key={h} className="pb-2.5 text-left text-gray-500 font-medium pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {RECENT_SCANS.map((scan, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pr-6 text-gray-200 font-medium">{scan.repo}</td>
                  <td className="py-3 pr-6 text-gray-400">{scan.branch}</td>
                  <td className="py-3 pr-6">
                    <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      scan.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {scan.status === 'COMPLETED' ? <CheckCircle2 size={9} /> : <AlertTriangle size={9} />}
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-3 pr-6 text-gray-300">{scan.findings}</td>
                  <td className="py-3 pr-6 font-bold" style={{ color: scan.score >= 80 ? '#22c55e' : scan.score >= 60 ? '#eab308' : '#ef4444' }}>
                    {scan.score ? `${scan.score}/100` : '—'}
                  </td>
                  <td className="py-3 text-gray-500 flex items-center gap-1"><Clock size={10} />{scan.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
