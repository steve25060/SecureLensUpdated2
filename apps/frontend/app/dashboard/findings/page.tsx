'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, XCircle, AlertCircle, CheckCircle2, ChevronDown, Search, SlidersHorizontal, ArrowUpDown, Eye, Clock, FileText, Download, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Finding {
  id: string;
  title: string;
  severity: Severity;
  source: string;
  target: string;
  status: string;
  category?: string;
  cvss?: number;
  aiExplanation?: string;
  description?: string;
  createdAt: string;
}

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type FindingStatus = 'NEW' | 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';

const SEED_FINDINGS: Finding[] = [
  { id: 'f-001', title: 'SQL Injection in Login Endpoint', severity: 'CRITICAL', source: 'Nuclei', target: '/api/auth/login', status: 'NEW', category: 'Injection Flaws', cvss: 9.8, description: 'SQL injection vulnerability detected in the login endpoint allowing unauthenticated access.', createdAt: '2024-05-16' },
  { id: 'f-002', title: 'Exposed AWS Access Key', severity: 'CRITICAL', source: 'Gitleaks', target: '.env.example', status: 'OPEN', category: 'Secrets Leak', cvss: 9.3, description: 'Hardcoded AWS access key found in repository.', createdAt: '2024-05-16' },
  { id: 'f-003', title: 'Weak TLS Configuration', severity: 'HIGH', source: 'testssl.sh', target: 'acme.com', status: 'NEW', category: 'SSL/TLS', cvss: 7.5, description: 'Server supports TLS 1.0 and weak cipher suites.', createdAt: '2024-05-15' },
  { id: 'f-004', title: 'Missing Content-Security-Policy', severity: 'HIGH', source: 'OWASP ZAP', target: 'acme.com', status: 'ACKNOWLEDGED', category: 'Security Headers', cvss: 7.1, description: 'CSP header not set, risk of XSS attacks.', createdAt: '2024-05-15' },
  { id: 'f-005', title: 'Outdated jQuery Library', severity: 'MEDIUM', source: 'WhatWeb', target: 'acme.com', status: 'OPEN', category: 'Vulnerable Dependencies', cvss: 5.3, description: 'jQuery 1.12.4 has known XSS vulnerabilities.', createdAt: '2024-05-14' },
  { id: 'f-006', title: 'Open S3 Bucket', severity: 'HIGH', source: 'Nuclei', target: 'assets.acme.com', status: 'NEW', category: 'Cloud Security', cvss: 7.8, description: 'S3 bucket is publicly readable.', createdAt: '2024-05-14' },
  { id: 'f-007', title: 'Missing HSTS Header', severity: 'LOW', source: 'testssl.sh', target: 'acme.com', status: 'RESOLVED', category: 'Security Headers', cvss: 3.2, description: 'HTTP Strict-Transport-Security header not set.', createdAt: '2024-05-13' },
  { id: 'f-008', title: 'Debug Mode Enabled', severity: 'MEDIUM', source: 'WhatWeb', target: 'staging.acme.com', status: 'FALSE_POSITIVE', category: 'Configuration', cvss: 4.5, description: 'Debug mode shows stack traces.', createdAt: '2024-05-13' },
  { id: 'f-009', title: 'Weak Password Policy', severity: 'LOW', source: 'Semgrep', target: 'auth-service', status: 'NEW', category: 'Authentication', cvss: 3.8, description: 'No minimum password length enforcement.', createdAt: '2024-05-12' },
  { id: 'f-010', title: 'Prototype Pollution', severity: 'MEDIUM', source: 'Semgrep', target: 'frontend-app', status: 'OPEN', category: 'Code Quality', cvss: 5.1, description: 'Unsafe object merge in utility function.', createdAt: '2024-05-12' },
];

const severityConfig = {
  CRITICAL: { color: '#ef4444', bg: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, order: 0 },
  HIGH:     { color: '#f97316', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: AlertTriangle, order: 1 },
  MEDIUM:   { color: '#eab308', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: AlertCircle, order: 2 },
  LOW:      { color: '#22c55e', bg: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2, order: 3 },
  INFO:     { color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Shield, order: 4 },
};

const statusConfig: Record<FindingStatus, { bg: string; label: string }> = {
  NEW:           { bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20', label: 'New' },
  OPEN:          { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Open' },
  ACKNOWLEDGED:  { bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Acknowledged' },
  RESOLVED:      { bg: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Resolved' },
  FALSE_POSITIVE: { bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'False Positive' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

function FindingsContent() {
  const searchParams = useSearchParams();
  const [findings, setFindings] = useState<Finding[]>(SEED_FINDINGS);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('severity');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const scanId = searchParams.get('scanId');
    if (scanId) {
      const token = localStorage.getItem('access_token');
      fetch(`/api/findings?scanId=${scanId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { if (data?.findings) setFindings(data.findings); })
        .catch(() => {});
    }
  }, [searchParams]);

  const filtered = findings
    .filter(f => selectedSeverity === 'ALL' || f.severity === selectedSeverity)
    .filter(f => selectedStatus === 'ALL' || f.status === selectedStatus)
    .filter(f => searchQuery === '' || f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.target.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === 'severity' ? severityConfig[a.severity].order - severityConfig[b.severity].order : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const severityCounts = Object.entries(severityConfig).reduce((acc, [key]) => {
    acc[key as Severity] = findings.filter(f => f.severity === key).length;
    return acc;
  }, {} as Record<Severity, number>);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Findings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Security vulnerabilities discovered across your assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.04] transition-all">
            <Download size={14} /> Export
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['ALL', ...Object.keys(severityConfig)] as const).map(key => {
          const sev = key === 'ALL' ? null : severityConfig[key as Severity];
          const Icon = sev?.icon || Shield;
          const count = key === 'ALL' ? findings.length : severityCounts[key as Severity];
          const isActive = selectedSeverity === key;
          return (
            <motion.button key={key} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSeverity(key as any)}
              className={`relative overflow-hidden rounded-xl p-3 text-left transition-all border ${
                isActive ? 'border-violet-500/30 bg-violet-600/10' : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                {sev && <Icon size={12} style={{ color: sev.color }} />}
                <span className="text-xs text-gray-500 capitalize">{key === 'ALL' ? 'All' : key.toLowerCase()}</span>
              </div>
              <p className="text-xl font-bold text-white">{count}</p>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search findings..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
        </div>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors">
          <option value="ALL">All Status</option>
          {Object.entries(statusConfig).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
        </select>
        <button onClick={() => setSortBy(s => s === 'severity' ? 'date' : 'severity')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.04] transition-all">
          <ArrowUpDown size={14} /> {sortBy === 'severity' ? 'Severity' : 'Date'}
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No findings found.</div>
          ) : filtered.map((finding, i) => {
            const sev = severityConfig[finding.severity];
            const Icon = sev.icon;
            const st = statusConfig[finding.status as FindingStatus];
            return (
              <motion.div
                key={finding.id}
                variants={itemVariants}
                onClick={() => setSelectedFinding(finding)}
                className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${sev.bg} border shrink-0`}><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">{finding.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{finding.target}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${st.bg}`}>{st.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${sev.bg}`}>{finding.severity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <FileText size={10} />{finding.source}
                      </span>
                      {finding.cvss && <span className="text-[11px] text-gray-500">CVSS {finding.cvss}</span>}
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} />{finding.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="xl:col-span-1">
          {selectedFinding ? (
            <div className="sticky top-6 space-y-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Finding Details</h3>
                  <button onClick={() => setSelectedFinding(null)} className="text-gray-500 hover:text-white transition-colors"><XCircle size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${severityConfig[selectedFinding.severity].bg} border`}>
                      {React.createElement(severityConfig[selectedFinding.severity].icon, { size: 16 })}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedFinding.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{selectedFinding.target}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${severityConfig[selectedFinding.severity].bg}`}>{selectedFinding.severity}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${statusConfig[selectedFinding.status as FindingStatus].bg}`}>{statusConfig[selectedFinding.status as FindingStatus].label}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{selectedFinding.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/[0.03] rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Source</p>
                      <p className="text-gray-200 font-medium">{selectedFinding.source}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-3">
                      <p className="text-gray-500 mb-1">CVSS Score</p>
                      <p className="text-white font-bold">{selectedFinding.cvss ?? '—'}</p>
                    </div>
                  </div>
                  {selectedFinding.category && (
                    <div className="bg-white/[0.03] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-xs text-gray-200">{selectedFinding.category}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-violet-600/20">
                      AI Explanation
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all">
                      Remediate
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-6 rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
              <div className="flex flex-col items-center text-center py-8">
                <Eye size={32} className="text-gray-600 mb-3" />
                <p className="text-sm text-gray-500">Select a finding to view details</p>
                <p className="text-xs text-gray-600 mt-1">Click on any finding to see its full information</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FindingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
      </div>
    }>
      <FindingsContent />
    </Suspense>
  );
}
