'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, GitBranch, Layers, Shield, Clock, AlertTriangle, MoreHorizontal, Search, Play, Trash2, X, Check, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: 'WEBSITE' | 'GITHUB' | 'COMBINED';
  targetUrl?: string;
  repoUrl?: string;
  tags: string[];
  riskScore: number;
  findingsCount: number;
  status: string;
  createdAt: string;
}

const SEED_WORKSPACES: Workspace[] = [
  { id: 'ws-1', name: 'acme.com', description: 'Primary customer website', type: 'WEBSITE', targetUrl: 'https://acme.com', tags: ['production'], riskScore: 84, findingsCount: 51, status: 'ACTIVE', createdAt: 'Just now' },
  { id: 'ws-2', name: 'vulnerable-app', description: 'GitHub repository scan', type: 'GITHUB', repoUrl: 'https://github.com/demo/vulnerable-app', tags: ['testing'], riskScore: 67, findingsCount: 38, status: 'ACTIVE', createdAt: '2h ago' },
  { id: 'ws-3', name: 'shopify-clone', description: 'Combined web + code scan', type: 'COMBINED', targetUrl: 'https://shopify-clone.com', repoUrl: 'https://github.com/demo/shopify-clone', tags: ['ecommerce'], riskScore: 90, findingsCount: 23, status: 'ACTIVE', createdAt: '1d ago' },
  { id: 'ws-4', name: 'staging.acme.com', description: 'Staging environment', type: 'WEBSITE', targetUrl: 'https://staging.acme.com', tags: ['staging'], riskScore: 72, findingsCount: 34, status: 'ACTIVE', createdAt: '2d ago' },
];

const ENGINES = ['Nmap', 'httpx', 'WhatWeb', 'Nuclei', 'OWASP ZAP', 'testssl.sh', 'Semgrep', 'Gitleaks', 'Trivy'];

const typeConfig = {
  WEBSITE:  { label: 'Website',  icon: Globe,      cls: 'bg-blue-500/20 text-blue-400',    desc: 'Scan live websites, APIs, and associated endpoints' },
  GITHUB:   { label: 'GitHub',   icon: GitBranch,  cls: 'bg-purple-500/20 text-purple-400', desc: 'Scan code repositories for vulnerabilities' },
  COMBINED: { label: 'Combined', icon: Layers,      cls: 'bg-teal-500/20 text-teal-400',   desc: 'Website + GitHub repository in one scan' },
};

const scoreColor = (score: number) =>
  score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

// ─── Wizard ───────────────────────────────────────────────────────────────────
function CreateWizard({ onClose, onCreated }: { onClose: () => void; onCreated: (ws: Workspace) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', description: '', tags: [] as string[], type: 'WEBSITE' as Workspace['type'], targetUrl: '', repoUrl: '' });
  const [tagInput, setTagInput] = useState('');
  const [engines, setEngines] = useState(['Nmap', 'httpx', 'Nuclei', 'OWASP ZAP']);
  const [loading, setLoading] = useState(false);

  const steps = ['Workspace Details', 'Select Mode', 'Configure', 'Review'];

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...form, engines }),
      });
      const data = res.ok ? await res.json() : null;
      onCreated(data ?? { id: `ws-${Date.now()}`, ...form, riskScore: 0, findingsCount: 0, status: 'ACTIVE', createdAt: 'Just now' });
    } catch {
      onCreated({ id: `ws-${Date.now()}`, ...form, riskScore: 0, findingsCount: 0, status: 'ACTIVE', createdAt: 'Just now' });
    } finally { setLoading(false); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">Create Security Workspace</h2>
            <p className="text-sm text-gray-400">Set up your workspace and configure how you want to scan.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 px-6 py-4 border-b border-gray-800">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > i + 1 ? 'bg-violet-600 text-white' : step === i + 1 ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}>
                  {step > i + 1 ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-white' : step > i + 1 ? 'text-violet-400' : 'text-gray-500'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="mx-3 text-gray-700" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 p-6">
            <AnimatePresence mode="wait">
              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Workspace Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Acme Corp Security Analysis"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Description <span className="text-gray-500">(optional)</span></label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the purpose of this workspace..."
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500 resize-none" />
                    <p className="text-xs text-gray-500 mt-1">{form.description.length}/250</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Tags <span className="text-gray-500">(optional)</span></label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.tags.map(t => (
                        <span key={t} className="flex items-center gap-1 bg-violet-600/20 text-violet-300 text-xs px-2 py-1 rounded-full">
                          {t}<button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                      placeholder="Add tags and press Enter..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500" />
                    <p className="text-xs text-gray-500 mt-1">Example: production, customer-portal, critical</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-sm text-gray-400">Choose how you want to scan this workspace.</p>
                  {(['WEBSITE', 'GITHUB', 'COMBINED'] as const).map(t => {
                    const cfg = typeConfig[t];
                    const Icon = cfg.icon;
                    return (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${form.type === t ? 'border-violet-500 bg-violet-600/10' : 'border-gray-700 hover:border-gray-600'}`}>
                        <div className={`p-2.5 rounded-lg ${cfg.cls}`}><Icon size={18} /></div>
                        <div>
                          <p className="text-sm font-semibold text-white">{cfg.label === 'Combined' ? 'Combined Analysis' : `${cfg.label} Analysis`}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{cfg.desc}</p>
                        </div>
                        {form.type === t && <Check size={16} className="ml-auto text-violet-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  {(form.type === 'WEBSITE' || form.type === 'COMBINED') && (
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-1.5">Target URL</label>
                      <input value={form.targetUrl} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                        placeholder="https://example.com"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500" />
                    </div>
                  )}
                  {(form.type === 'GITHUB' || form.type === 'COMBINED') && (
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-1.5">GitHub Repository URL</label>
                      <input value={form.repoUrl} onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))}
                        placeholder="https://github.com/owner/repo"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-300">Scan Engines</label>
                      <button onClick={() => setEngines(ENGINES)} className="text-xs text-violet-400 hover:text-violet-300">Select All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ENGINES.map(e => (
                        <label key={e} className="flex items-center gap-2.5 cursor-pointer group">
                          <input type="checkbox" checked={engines.includes(e)} onChange={() => setEngines(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])}
                            className="w-4 h-4 accent-violet-500" />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{e}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-sm text-gray-400">Review your workspace configuration before creating.</p>
                  {[
                    { label: 'Name', value: form.name || '—' },
                    { label: 'Type', value: typeConfig[form.type].label },
                    { label: 'Target URL', value: form.targetUrl || '—' },
                    { label: 'Repository', value: form.repoUrl || '—' },
                    { label: 'Engines', value: engines.join(', ') || '—' },
                    { label: 'Tags', value: form.tags.join(', ') || '—' },
                  ].map(row => (
                    <div key={row.label} className="flex items-start gap-4 py-2.5 border-b border-gray-800">
                      <span className="text-sm text-gray-500 w-28 shrink-0">{row.label}</span>
                      <span className="text-sm text-gray-200">{row.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right preview panel */}
          <div className="border-l border-gray-800 p-6 bg-gray-900/50">
            <h4 className="text-sm font-semibold text-white mb-4">Workspace Preview</h4>
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{form.name || 'Workspace Name'}</p>
                  <p className="text-xs text-gray-500">{form.description || 'No description provided'}</p>
                </div>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map(t => <span key={t} className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-gray-400 mb-3">You&apos;ll be able to:</p>
            {['Run website, GitHub, or combined scans', 'Correlate findings and remove duplicates', 'View results in the unified dashboard', 'Get AI-powered insights and remediation steps', 'Export reports and share with your team'].map(item => (
              <div key={item} className="flex items-start gap-2 mb-2">
                <Check size={12} className="text-green-400 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-5 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.name}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
              Next: {steps[step]} →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Creating…' : 'Create Workspace'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Workspace Card ───────────────────────────────────────────────────────────
function WorkspaceCard({ ws, onDelete }: { ws: Workspace; onDelete: (id: string) => void }) {
  const cfg = typeConfig[ws.type];
  const Icon = cfg.icon;
  const color = scoreColor(ws.riskScore);

  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cfg.cls}`}><Icon size={16} /></div>
          <div>
            <h3 className="text-sm font-bold text-white">{ws.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{ws.targetUrl ?? ws.repoUrl ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"><Play size={13} /></button>
          <button onClick={() => onDelete(ws.id)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Risk Score</p>
          <p className="text-xl font-bold" style={{ color }}>{ws.riskScore}<span className="text-xs text-gray-500">/100</span></p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Findings</p>
          <p className="text-xl font-bold text-white">{ws.findingsCount}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
        </div>
      </div>

      {ws.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {ws.tags.map(t => <span key={t} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={11} />{ws.createdAt}
        </div>
        <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
          View details <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(SEED_WORKSPACES);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/workspaces', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => Array.isArray(data) && data.length > 0 && setWorkspaces(data))
      .catch(() => {});
  }, []);

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workspaces</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your security workspaces and scan configurations.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={15} /> New Workspace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Workspaces', value: workspaces.length, icon: Shield, color: 'text-violet-400' },
          { label: 'Active Scans', value: 1, icon: Play, color: 'text-green-400' },
          { label: 'Total Findings', value: workspaces.reduce((s, w) => s + w.findingsCount, 0), icon: AlertTriangle, color: 'text-orange-400' },
          { label: 'Avg Risk Score', value: Math.round(workspaces.reduce((s, w) => s + w.riskScore, 0) / workspaces.length) + '/100', icon: MoreHorizontal, color: 'text-blue-400' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className={stat.color} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search workspaces..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 max-w-sm" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(ws => (
          <WorkspaceCard key={ws.id} ws={ws} onDelete={id => setWorkspaces(p => p.filter(w => w.id !== id))} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500">No workspaces found.</div>
        )}
      </div>

      {/* Wizard modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateWizard
            onClose={() => setShowCreate(false)}
            onCreated={ws => setWorkspaces(p => [ws, ...p])}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
