'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, GitBranch, Layers, Shield, Clock, AlertTriangle, MoreHorizontal, Search, Play, Trash2, X, Check, ChevronRight, ArrowRight, TrendingUp } from 'lucide-react';

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

const ENGINES = ['Nmap', 'httpx', 'WhatWeb', 'Nuclei', 'OWASP ZAP', 'testssl.sh', 'Semgrep', 'Gitleaks', 'Trivy'];

const typeConfig = {
  WEBSITE:  { label: 'Website',  icon: Globe,      cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    desc: 'Scan live websites, APIs, and associated endpoints' },
  GITHUB:   { label: 'GitHub',   icon: GitBranch,  cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20', desc: 'Scan code repositories for vulnerabilities' },
  COMBINED: { label: 'Combined', icon: Layers,      cls: 'bg-teal-500/10 text-teal-400 border-teal-500/20',   desc: 'Website + GitHub repository in one scan' },
};

const scoreColor = (score: number) =>
  score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

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
      if (res.ok) {
        const newWorkspace = await res.json();
        onCreated(newWorkspace);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background-secondary border border-white/[0.06] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
          <div>
            <h2 className="text-lg font-bold text-white">Create Security Workspace</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set up your workspace and configure how you want to scan.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="flex items-center gap-0 px-6 py-4 border-b border-white/[0.04]">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  step > i + 1 ? 'bg-violet-600 text-white' : step === i + 1 ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-white/[0.04] text-gray-500'
                }`}>
                  {step > i + 1 ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-white' : step > i + 1 ? 'text-violet-400' : 'text-gray-500'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="mx-3 text-gray-700" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Workspace Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Acme Corp Security Analysis"
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Description <span className="text-gray-500">(optional)</span></label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the purpose of this workspace..."
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none" />
                    <p className="text-xs text-gray-500 mt-1">{form.description.length}/250</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Tags <span className="text-gray-500">(optional)</span></label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.tags.map(t => (
                        <span key={t} className="flex items-center gap-1 bg-violet-600/10 text-violet-300 text-xs px-2 py-1 rounded-full border border-violet-500/20">
                          {t}<button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                      placeholder="Add tags and press Enter..."
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-sm text-gray-500">Choose how you want to scan this workspace.</p>
                  {(['WEBSITE', 'GITHUB', 'COMBINED'] as const).map(t => {
                    const cfg = typeConfig[t];
                    const Icon = cfg.icon;
                    return (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${form.type === t ? 'border-violet-500/50 bg-violet-600/10' : 'border-white/[0.06] hover:border-white/[0.1] bg-white/[0.02]'}`}>
                        <div className={`p-2.5 rounded-lg ${cfg.cls}`}><Icon size={18} /></div>
                        <div>
                          <p className="text-sm font-semibold text-white">{cfg.label === 'Combined' ? 'Combined Analysis' : `${cfg.label} Analysis`}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
                        </div>
                        {form.type === t && <Check size={16} className="ml-auto text-violet-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  {(form.type === 'WEBSITE' || form.type === 'COMBINED') && (
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-1.5">Target URL</label>
                      <input value={form.targetUrl} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                        placeholder="https://example.com"
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                    </div>
                  )}
                  {(form.type === 'GITHUB' || form.type === 'COMBINED') && (
                    <div>
                      <label className="text-sm font-medium text-gray-300 block mb-1.5">GitHub Repository URL</label>
                      <input value={form.repoUrl} onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))}
                        placeholder="https://github.com/owner/repo"
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-300">Scan Engines</label>
                      <button onClick={() => setEngines(ENGINES)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Select All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {ENGINES.map(e => (
                        <label key={e} className="flex items-center gap-2.5 cursor-pointer group p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                          <input type="checkbox" checked={engines.includes(e)} onChange={() => setEngines(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])}
                            className="w-4 h-4 accent-violet-500 rounded" />
                          <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{e}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <p className="text-sm text-gray-500">Review your workspace configuration before creating.</p>
                  {[
                    { label: 'Name', value: form.name || '—' },
                    { label: 'Type', value: typeConfig[form.type].label },
                    { label: 'Target URL', value: form.targetUrl || '—' },
                    { label: 'Repository', value: form.repoUrl || '—' },
                    { label: 'Engines', value: engines.join(', ') || '—' },
                    { label: 'Tags', value: form.tags.join(', ') || '—' },
                  ].map(row => (
                    <div key={row.label} className="flex items-start gap-4 py-2.5 border-b border-white/[0.04]">
                      <span className="text-sm text-gray-500 w-28 shrink-0">{row.label}</span>
                      <span className="text-sm text-gray-200">{row.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="border-l border-white/[0.04] p-6 bg-background">
            <h4 className="text-sm font-semibold text-white mb-4">Workspace Preview</h4>
            <div className="bg-white/[0.02] rounded-xl p-4 mb-6 border border-white/[0.04]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-600/10 rounded-lg flex items-center justify-center border border-violet-500/20">
                  <Shield size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{form.name || 'Workspace Name'}</p>
                  <p className="text-xs text-gray-500">{form.description || 'No description provided'}</p>
                </div>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map(t => <span key={t} className="text-[10px] bg-white/[0.04] text-gray-400 px-2 py-0.5 rounded-full border border-white/[0.06]">{t}</span>)}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-gray-400 mb-3">You&apos;ll be able to:</p>
            {['Run website, GitHub, or combined scans', 'Correlate findings and remove duplicates', 'View results in the unified dashboard', 'Get AI-powered insights and remediation steps', 'Export reports and share with your team'].map(item => (
              <div key={item} className="flex items-start gap-2 mb-2">
                <Check size={12} className="text-green-400 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-white/[0.04]">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-5 py-2 text-sm text-gray-400 hover:text-white border border-white/[0.06] rounded-lg transition-all hover:bg-white/[0.04]">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.name}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-600/20">
              Next: {steps[step]} →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-600/20">
              {loading ? 'Creating…' : 'Create Workspace'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function WorkspaceCard({ ws, onDelete }: { ws: Workspace; onDelete: (id: string) => void }) {
  const cfg = typeConfig[ws.type];
  const Icon = cfg.icon;
  const color = scoreColor(ws.riskScore);

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 group hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-300 cursor-pointer"
      whileHover={{ y: -2 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-full blur-3xl" />
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cfg.cls} border`}><Icon size={16} /></div>
          <div>
            <h3 className="text-sm font-bold text-white">{ws.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{ws.targetUrl ?? ws.repoUrl ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-white transition-colors"><Play size={13} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => onDelete(ws.id)} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></motion.button>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-4 relative">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Risk Score</p>
          <p className="text-xl font-bold" style={{ color }}>{ws.riskScore}<span className="text-xs text-gray-500">/100</span></p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Findings</p>
          <p className="text-xl font-bold text-white">{ws.findingsCount}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2.5 py-1 rounded-lg border ${cfg.cls}`}>{cfg.label}</span>
        </div>
      </div>
      {ws.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4 relative">
          {ws.tags.map(t => <span key={t} className="text-[10px] bg-white/[0.03] text-gray-500 px-2 py-0.5 rounded-full border border-white/[0.06]">{t}</span>)}
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] relative">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={11} />{ws.createdAt}
        </div>
        <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium group/btn">
          View details <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/workspaces', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workspaces</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your security workspaces and scan configurations.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm font-medium transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus size={15} /> New Workspace
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Workspaces', value: workspaces.length, icon: Shield, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Active Scans', value: 1, icon: Play, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Total Findings', value: workspaces.reduce((s, w) => s + w.findingsCount, 0), icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Avg Risk Score', value: workspaces.length ? Math.round(workspaces.reduce((s, w) => s + w.riskScore, 0) / workspaces.length) + '/100' : '—', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} whileHover={{ y: -1 }} className={`${stat.bg} border border-white/[0.04] rounded-xl p-4 transition-all`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className={stat.color} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search workspaces..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto" />
          <p className="text-gray-500 mt-4 text-sm">Loading workspaces...</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(ws => (
            <WorkspaceCard key={ws.id} ws={ws} onDelete={id => setWorkspaces(p => p.filter(w => w.id !== id))} />
          ))}
          {filtered.length === 0 && workspaces.length === 0 ? (
            <motion.div variants={itemVariants} className="col-span-full text-center py-16">
              <Shield size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500">No workspaces yet. Create one to get started.</p>
              <button onClick={() => setShowCreate(true)} className="mt-4 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">
                Create Workspace
              </button>
            </motion.div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500">No workspaces match your search.</div>
          ) : null}
        </motion.div>
      )}

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
