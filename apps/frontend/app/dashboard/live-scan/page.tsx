'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle, Loader2, Check, Play, Globe, ArrowRight, Shield, Activity,
  Target, X, Terminal, StopCircle, ChevronDown, RefreshCw, Cpu,
  CircleDot, FileWarning, Sparkles, Database, Layers, ServerCrash,
  Info,
} from 'lucide-react';
import { enginesForMode, engineById, RESOURCE_META, type EngineDef, type ScanMode } from '@/lib/engines';
import { EngineIcon } from '@/components/dashboard/EngineIcon';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScanStatusValue = 'idle' | 'queued' | 'running' | 'processing' | 'completed' | 'failed' | 'cancelled';

interface WorkspaceOption {
  id: string;
  name: string;
  type: string;
  targetUrl?: string | null;
  repoUrl?: string | null;
}

interface LogEntry {
  ts: string;
  level: 'info' | 'warn' | 'error' | 'success';
  engine?: string;
  message: string;
}

interface FindingPreview {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  source: string;
}

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || localStorage.getItem('sl_token');
};
const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

const severityMeta: Record<FindingPreview['severity'], { color: string; cls: string }> = {
  CRITICAL: { color: '#ef4444', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  HIGH:     { color: '#f97316', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  MEDIUM:   { color: '#eab308', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  LOW:      { color: '#22c55e', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  INFO:     { color: '#3b82f6', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

// ─── Demo data (offline only) ─────────────────────────────────────────────────
const DEMO_WORKSPACES: WorkspaceOption[] = [
  { id: 'demo-1', name: 'Acme Corp – Production', type: 'WEBSITE', targetUrl: 'https://acme.com' },
  { id: 'demo-3', name: 'Storefront – Combined', type: 'COMBINED', targetUrl: 'https://shop.acme.com', repoUrl: 'https://github.com/acme/storefront' },
];

const DEMO_FINDINGS: FindingPreview[] = [
  { id: 'f-1', severity: 'CRITICAL', title: 'SQL Injection in login endpoint', source: 'Vulnerability Detection' },
  { id: 'f-2', severity: 'HIGH', title: 'Missing Content-Security-Policy header', source: 'HTTP Security Check' },
  { id: 'f-3', severity: 'HIGH', title: 'Weak TLS configuration (TLS 1.0 enabled)', source: 'SSL & TLS Security Check' },
  { id: 'f-4', severity: 'MEDIUM', title: 'Outdated jQuery 1.12.4 detected', source: 'Technology Detection' },
  { id: 'f-5', severity: 'MEDIUM', title: 'Server banner disclosure', source: 'Live Asset Check' },
  { id: 'f-6', severity: 'LOW', title: 'Missing HSTS header', source: 'SSL & TLS Security Check' },
  { id: 'f-7', severity: 'LOW', title: 'X-Frame-Options not set', source: 'HTTP Security Check' },
  { id: 'f-8', severity: 'INFO', title: 'Technology stack identified', source: 'Technology Detection' },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, x: 40, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm font-medium ${
              t.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : t.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-violet-500/10 border-violet-500/30 text-violet-300'
            }`}>
            {t.type === 'success' ? <Check size={15} /> : t.type === 'error' ? <X size={15} /> : <AlertCircle size={15} />}
            <span>{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={13} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Live log console ─────────────────────────────────────────────────────────
function LogConsole({ logs }: { logs: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const levelColor = (lvl: LogEntry['level']) =>
    lvl === 'error' ? 'text-red-400'
    : lvl === 'warn' ? 'text-yellow-400'
    : lvl === 'success' ? 'text-green-400' : 'text-gray-300';

  return (
    <div className="rounded-xl bg-[#0a0a14] border border-white/[0.06] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <Terminal size={14} className="text-violet-400" />
        <span className="text-xs font-medium text-gray-300">Live Scan Logs</span>
        <div className="flex gap-1.5 ml-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>
      <div ref={scrollRef} className="h-64 overflow-y-auto p-3 font-mono text-xs space-y-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">Waiting for scan output…</div>
        ) : logs.map((log, i) => (
          <div key={i} className="flex gap-2 leading-relaxed">
            <span className="text-gray-600 shrink-0 select-none">{log.ts}</span>
            {log.engine && <span className="text-violet-400 shrink-0">[{log.engine}]</span>}
            <span className={levelColor(log.level)}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Premium engine card ──────────────────────────────────────────────────────
function EngineCard({
  engine, selected, disabled, onToggle,
}: {
  engine: EngineDef; selected: boolean; disabled: boolean; onToggle: () => void;
}) {
  const res = RESOURCE_META[engine.resource];
  return (
    <label className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
      selected ? 'border-violet-500/40 bg-violet-600/[0.08] shadow-lg shadow-violet-600/5' : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
    } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="mt-1 w-4 h-4 accent-violet-500 cursor-pointer rounded shrink-0" />
      <EngineIcon name={engine.icon} accent={engine.accent} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white">{engine.name}</p>
          <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md border ${res.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${res.dot}`} />{res.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{engine.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06]">
            <Cpu size={9} />{engine.tool}
          </span>
          <span className="text-[10px] text-gray-600">{engine.category}</span>
        </div>
      </div>
    </label>
  );
}

// ─── Smooth animated progress bar + counter ────────────────────────────────────
// The backend reports progress in discrete jumps every ~2s. To make the UI feel
// alive we spring-interpolate toward the target value so both the bar and the
// number ease smoothly between updates instead of snapping.
function SmoothProgress({ value, status }: { value: number; status: ScanStatusValue }) {
  const [display, setDisplay] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  const isActive = status === 'running' || status === 'queued' || status === 'processing';
  const isDone = status === 'completed';
  const isEnded = status === 'failed' || status === 'cancelled';

  // We animate the displayed value ourselves with a rAF loop so the number
  // always flows smoothly from 1 → 100 regardless of how fast the backend
  // finishes. `progRef` is the current shown value; `targetRef` is where we
  // want to head toward.
  const progRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const wasActiveRef = useRef(false);

  // Update the target based on backend value + status.
  const backend = Math.max(0, Math.min(100, value));
  useEffect(() => {
    if (isActive) {
      // Detect the start of a brand-new scan (transition into active) and
      // reset the bar to 0 so it always flows from the beginning.
      if (!wasActiveRef.current) {
        progRef.current = 0;
        setDisplay(0);
        setBarWidth(0);
      }
      wasActiveRef.current = true;
      // Jump the floor forward if the real backend value is ahead of us, but
      // let the rAF loop keep the bar continuously creeping otherwise.
      if (backend > targetRef.current) targetRef.current = Math.min(99, backend);
    } else if (isDone) {
      wasActiveRef.current = false;
      targetRef.current = 100;
    } else if (isEnded) {
      wasActiveRef.current = false;
      targetRef.current = progRef.current; // freeze wherever we are
    } else {
      // idle / reset
      wasActiveRef.current = false;
      progRef.current = 0;
      targetRef.current = 0;
      setDisplay(0);
      setBarWidth(0);
    }
  }, [backend, isActive, isDone, isEnded]);

  // Continuous animation loop.
  useEffect(() => {
    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(64, ts - lastTsRef.current); // ms, clamp big gaps
      lastTsRef.current = ts;

      // While actively scanning, continuously creep the target forward (capped
      // at 99) so the bar never pauses between the backend's coarse updates.
      if (isActive && targetRef.current < 99) {
        targetRef.current = Math.min(99, targetRef.current + (6 * dt) / 1000);
      }

      const cur = progRef.current;
      const tgt = targetRef.current;

      if (cur < tgt) {
        // Speed: how many percent per second.
        // When finishing (target 100), move faster to close it out.
        const speed = tgt >= 100 ? 40 : 30; // %/sec
        const next = Math.min(tgt, cur + (speed * dt) / 1000);
        // Ensure we always start visibly at 1 when active.
        progRef.current = Math.max(next, isActive || isDone ? 1 : 0);
        const rounded = progRef.current;
        setDisplay(Math.round(rounded));
        setBarWidth(rounded);
      } else if (cur > tgt) {
        // Only happens on freeze; snap down softly (rare).
        progRef.current = tgt;
        setDisplay(Math.round(tgt));
        setBarWidth(tgt);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [isActive, isDone]);

  const barClass =
    status === 'failed'
      ? 'bg-red-500'
      : status === 'cancelled'
      ? 'bg-gray-500'
      : 'bg-gradient-to-r from-violet-600 to-violet-500';

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Progress</p>
      <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden relative">
        <div
          style={{ width: `${barWidth}%` }}
          className={`h-full rounded-full ${barClass} relative overflow-hidden transition-none`}
        >
          {/* moving shimmer while the scan is actively running */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
            />
          )}
        </div>
      </div>
      <p className="text-sm font-semibold text-white tabular-nums">{display}%</p>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────
function LiveScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [demoMode, setDemoMode] = useState(false);

  const [workspaceId, setWorkspaceId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [mode, setMode] = useState<ScanMode>('website');
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set());

  const [isExecuting, setIsExecuting] = useState(false);
  const [scanId, setScanId] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatusValue>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [findings, setFindings] = useState<FindingPreview[]>([]);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Engine list is derived from the mode — local catalog, no backend call.
  const engines = enginesForMode(mode);

  const pushToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);
  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const log = useCallback((message: string, level: LogEntry['level'] = 'info', engine?: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { ts, level, message, engine }]);
  }, []);

  // ─── Load workspaces on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/workspaces', { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.workspaces ?? []);
        if (list.length > 0) { setWorkspaces(list); setDemoMode(false); }
        else { setWorkspaces(DEMO_WORKSPACES); setDemoMode(true); }
      } catch {
        setWorkspaces(DEMO_WORKSPACES);
        setDemoMode(true);
      }
    })();
  }, []);

  // ─── Pre-fill from query params (from Workspaces "New scan") ────────────────
  useEffect(() => {
    const qWs = searchParams.get('workspaceId');
    const qTarget = searchParams.get('target');
    const qRepo = searchParams.get('repo');
    const qMode = searchParams.get('mode') as ScanMode | null;
    if (qMode && ['website', 'github', 'combined'].includes(qMode)) setMode(qMode);
    if (qTarget) setTargetUrl(qTarget);
    if (qRepo) setRepoUrl(qRepo);
    if (qWs) setWorkspaceId(qWs);
  }, [searchParams]);

  // ─── Sync mode + targets when workspace changes ────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    const inferred = (ws.type || 'WEBSITE').toLowerCase() as ScanMode;
    setMode(inferred);
    if (ws.targetUrl && !targetUrl) setTargetUrl(ws.targetUrl);
    if (ws.repoUrl && !repoUrl) setRepoUrl(ws.repoUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, workspaces]);

  // ─── Default-select first 5 engines whenever the mode changes ───────────────
  useEffect(() => {
    setSelectedEngines(new Set(engines.slice(0, 5).map(e => e.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ─── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, []);

  const toggleEngine = (engineId: string) => {
    setSelectedEngines(prev => {
      const next = new Set(prev);
      if (next.has(engineId)) next.delete(engineId); else next.add(engineId);
      return next;
    });
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    setError('');
    if (!workspaceId.trim()) { setError('Please select a workspace.'); return false; }
    if ((mode === 'website' || mode === 'combined') && !targetUrl.trim()) {
      setError('Please enter a target URL.'); return false;
    }
    if ((mode === 'github' || mode === 'combined') && !repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.'); return false;
    }
    if (targetUrl.trim()) {
      try { new URL(targetUrl); } catch { setError('Target URL is not a valid URL (e.g. https://example.com).'); return false; }
    }
    if (repoUrl.trim() && !/^https?:\/\/(www\.)?github\.com\//i.test(repoUrl.trim())) {
      setError('Repository URL must be a GitHub URL (e.g. https://github.com/owner/repo).'); return false;
    }
    if (selectedEngines.size === 0) { setError('Please select at least one engine.'); return false; }
    return true;
  };

  // ─── DEMO scan simulation ───────────────────────────────────────────────────
  const runDemoScan = useCallback(() => {
    setScanStatus('running');
    setScanProgress(0);
    setLogs([]);
    setFindings([]);
    const engineList = engines.filter(e => selectedEngines.has(e.id));
    let step = 0;
    const totalSteps = engineList.length + 1;

    const scanTarget = targetUrl || repoUrl || 'target';
    log(`Initializing scan on ${scanTarget}…`, 'info');
    log(`Mode: ${mode} · ${engineList.length} engine${engineList.length === 1 ? '' : 's'}`, 'info');

    demoTimerRef.current = setInterval(() => {
      if (step < engineList.length) {
        const eng = engineList[step];
        log(`Running ${eng.name}…`, 'info', eng.name);
        const demoF = DEMO_FINDINGS[step % DEMO_FINDINGS.length];
        if (demoF && Math.random() > 0.45) {
          log(`  ⚑ ${demoF.severity}: ${demoF.title}`, demoF.severity === 'CRITICAL' ? 'error' : 'warn', eng.name);
        }
      } else if (step === engineList.length) {
        log('Correlating, de-duplicating & scoring findings…', 'info', 'Security Intelligence Engine');
      }
      step += 1;
      const pct = Math.min(100, Math.round((step / totalSteps) * 100));
      setScanProgress(pct);
      if (step >= totalSteps) {
        if (demoTimerRef.current) clearInterval(demoTimerRef.current);
        const found = DEMO_FINDINGS.slice(0, Math.max(3, Math.floor(Math.random() * DEMO_FINDINGS.length) + 3));
        setFindings(found);
        setScanStatus('completed');
        setIsExecuting(false);
        log(`Scan completed. ${found.length} unique findings.`, 'success');
        pushToast(`Scan completed — ${found.length} findings`, 'success');
      }
    }, 1100);
  }, [engines, selectedEngines, mode, targetUrl, repoUrl, log, pushToast]);

  // ─── Start scan (real backend + demo fallback) ──────────────────────────────
  const handleStartScan = async () => {
    if (!validateForm()) return;
    setError('');
    setIsExecuting(true);
    setScanStatus('queued');
    setScanProgress(0);
    setLogs([]);
    setFindings([]);
    log('Submitting scan job…', 'info');

    try {
      if (demoMode) {
        setScanId(`demo-scan-${Date.now()}`);
        setTimeout(runDemoScan, 500);
        return;
      }

      const createRes = await fetch('/api/scans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          workspaceId,
          mode,
          target: targetUrl || repoUrl,
          targetUrl: targetUrl || undefined,
          repoUrl: repoUrl || undefined,
          engines: Array.from(selectedEngines),
        }),
      });
      if (!createRes.ok) {
        const txt = await createRes.text().catch(() => '');
        throw new Error(`Create failed (${createRes.status})${txt ? `: ${txt}` : ''}`);
      }
      const created = await createRes.json();
      const id = created.id || created.scanId;
      setScanId(id);
      log(`Scan job created (id: ${id}).`, 'success');

      const startRes = await fetch(`/api/scans/${id}/start`, { method: 'POST', headers: authHeaders() });
      if (!startRes.ok) throw new Error(`Start failed (${startRes.status})`);
      log('Scan started.', 'success');
      setScanStatus('running');

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/scans/${id}/status`, { headers: authHeaders() });
          if (!statusRes.ok) return;
          const st = await statusRes.json();
          setScanStatus((st.status?.toLowerCase() as ScanStatusValue) || 'running');
          setScanProgress(typeof st.progress === 'number' ? st.progress : 0);

          if (st.status === 'COMPLETED' || st.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setIsExecuting(false);
            log('Scan completed.', 'success');
            try {
              const fRes = await fetch(`/api/findings/scan/${id}`, { headers: authHeaders() });
              if (fRes.ok) {
                const fData = await fRes.json();
                const list: any[] = Array.isArray(fData) ? fData : (fData?.findings ?? []);
                setFindings(list.slice(0, 12).map((f: any): FindingPreview => ({
                  id: f.id,
                  severity: ((f.severity ?? 'INFO').toUpperCase() as FindingPreview['severity']),
                  title: f.title ?? 'Untitled finding',
                  source: f.source ?? 'scanner',
                })));
              }
            } catch { /* ignore findings fetch errors */ }
            pushToast('Scan completed', 'success');
          } else if (st.status === 'FAILED' || st.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setIsExecuting(false);
            setScanStatus('failed');
            log('Scan failed.', 'error');
            pushToast('Scan failed', 'error');
          }
        } catch (err) {
          console.error('Status poll error:', err);
        }
      }, 2000);
    } catch (err) {
      const msg = (err as Error).message;
      setError('Failed to start scan: ' + msg);
      setIsExecuting(false);
      setScanStatus('idle');
      pushToast('Failed to start scan', 'error');
    }
  };

  // ─── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (demoTimerRef.current) { clearInterval(demoTimerRef.current); demoTimerRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (!demoMode && scanId) {
      try { await fetch(`/api/scans/${scanId}/cancel`, { method: 'DELETE', headers: authHeaders() }); } catch {}
    }
    setIsExecuting(false);
    setScanStatus('cancelled');
    log('Scan cancelled by user.', 'warn');
    pushToast('Scan cancelled', 'info');
  };

  const selectedWorkspace = workspaces.find(w => w.id === workspaceId);
  const activeEngines = engines.filter(e => selectedEngines.has(e.id));

  const statusMeta: Record<ScanStatusValue, { label: string; cls: string; dot: string }> = {
    idle:       { label: 'Idle',         cls: 'text-gray-400 bg-white/[0.04] border-white/[0.06]',            dot: 'bg-gray-500' },
    queued:     { label: 'Queued',       cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20',       dot: 'bg-violet-500' },
    running:    { label: 'Running',      cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',             dot: 'bg-blue-500 animate-pulse' },
    processing: { label: 'Processing',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',       dot: 'bg-yellow-500 animate-pulse' },
    completed:  { label: 'Completed',    cls: 'text-green-400 bg-green-500/10 border-green-500/20',          dot: 'bg-green-500' },
    failed:     { label: 'Failed',       cls: 'text-red-400 bg-red-500/10 border-red-500/20',                dot: 'bg-red-500' },
    cancelled:  { label: 'Cancelled',    cls: 'text-gray-400 bg-white/[0.04] border-white/[0.06]',           dot: 'bg-gray-500' },
  };

  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1; return acc;
  }, {} as Record<FindingPreview['severity'], number>);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Live Scan
            {demoMode && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">DEMO MODE</span>}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Run a security scan against a website, repo, or both.</p>
        </div>
        {scanId && !isExecuting && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/dashboard/findings?scanId=${scanId}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-white text-sm font-medium transition-all">
            <FileWarning size={14} /> View all findings <ArrowRight size={14} />
          </motion.button>
        )}
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Configuration column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Configure Scan</h2>

            {/* Workspace picker */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Workspace</label>
              <div className="relative">
                <Database size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} disabled={isExecuting}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-10 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors appearance-none cursor-pointer">
                  <option value="">Select a workspace…</option>
                  {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              {selectedWorkspace && (
                <p className="text-xs text-gray-500 mt-1.5">{selectedWorkspace.targetUrl || selectedWorkspace.repoUrl || 'No target configured'}</p>
              )}
            </div>

            {/* Mode toggle */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Scan Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'website', label: 'Website', icon: Globe },
                  { id: 'github', label: 'GitHub', icon: Target },
                  { id: 'combined', label: 'Combined', icon: Layers },
                ] as const).map(m => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button key={m.id} onClick={() => setMode(m.id)} disabled={isExecuting}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 ${
                        active ? 'border-violet-500/50 bg-violet-600/10 text-white' : 'border-white/[0.06] text-gray-400 hover:bg-white/[0.03]'
                      }`}>
                      <Icon size={14} /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target URL */}
            {(mode === 'website' || mode === 'combined') && (
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Target URL</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input placeholder="https://example.com" type="url" value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)} disabled={isExecuting}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors" />
                </div>
              </div>
            )}

            {/* Repository URL (github + combined modes) */}
            {(mode === 'github' || mode === 'combined') && (
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  GitHub Repository URL {mode === 'combined' && <span className="text-gray-500 font-normal">(for code-side analysis)</span>}
                </label>
                <div className="relative">
                  <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <input placeholder="https://github.com/owner/repository" type="url" value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)} disabled={isExecuting}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {mode === 'combined'
                    ? 'Both the website and the repository will be scanned together.'
                    : 'The repository source code, secrets, and dependencies will be analyzed.'}
                </p>
              </div>
            )}

            {/* Engines (premium cards from local catalog) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">
                  SecureLens Engines <span className="text-gray-500 font-normal">({engines.length})</span>
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedEngines(new Set(engines.map(e => e.id)))} disabled={isExecuting}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-40">Select All</button>
                  <button onClick={() => setSelectedEngines(new Set())} disabled={isExecuting}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40">Clear</button>
                </div>
              </div>
              <div className="grid gap-2.5">
                {engines.map(engine => (
                  <EngineCard key={engine.id} engine={engine}
                    selected={selectedEngines.has(engine.id)} disabled={isExecuting}
                    onToggle={() => toggleEngine(engine.id)} />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              {!isExecuting ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleStartScan}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20">
                  <Play size={16} /> Start Scan
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex-1 bg-red-600/80 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20">
                  <StopCircle size={16} /> Cancel Scan
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Live logs */}
          {(scanStatus !== 'idle' || logs.length > 0) && (
            <motion.div variants={itemVariants}><LogConsole logs={logs} /></motion.div>
          )}

          {/* Findings preview */}
          {scanStatus === 'completed' && findings.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileWarning size={16} className="text-violet-400" />
                  <h3 className="text-base font-semibold text-white">Findings Preview</h3>
                </div>
                <button onClick={() => router.push(`/dashboard/findings?scanId=${scanId}`)}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">View all <ArrowRight size={12} /></button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const).map(s => {
                  const cnt = severityCounts[s] ?? 0;
                  if (cnt === 0) return null;
                  return <span key={s} className={`text-xs px-2.5 py-1 rounded-lg border ${severityMeta[s].cls}`}>{cnt} {s}</span>;
                })}
              </div>
              <div className="space-y-2">
                {findings.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                    <CircleDot size={12} style={{ color: severityMeta[f.severity].color }} className="shrink-0" />
                    <span className="text-sm text-gray-200 flex-1 truncate">{f.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${severityMeta[f.severity].cls}`}>{f.severity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Status sidebar ────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-4 sticky top-6">
            <h2 className="text-lg font-semibold text-white">Scan Status</h2>

            {scanStatus === 'idle' ? (
              <p className="text-sm text-gray-500">No scan in progress. Configure and start a scan to see status here.</p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <div className={`px-3 py-2 rounded-xl text-center text-sm font-semibold border flex items-center justify-center gap-2 ${statusMeta[scanStatus].cls}`}>
                    <span className={`w-2 h-2 rounded-full ${statusMeta[scanStatus].dot}`} />
                    {statusMeta[scanStatus].label}
                  </div>
                </div>

                <SmoothProgress value={scanProgress} status={scanStatus} />

                {scanId && (
                  <div className="space-y-2 pt-4 border-t border-white/[0.04]">
                    <p className="text-xs font-medium text-gray-500">Scan ID</p>
                    <p className="text-xs font-mono bg-white/[0.04] p-2 rounded-lg text-gray-400 break-all">{scanId}</p>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-white/[0.04]">
                  <p className="text-xs font-medium text-gray-500">Active Engines</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeEngines.length === 0 ? <span className="text-xs text-gray-600">None selected</span> :
                      activeEngines.map(e => (
                        <span key={e.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          <EngineIcon name={e.icon} accent={e.accent} size={10} /> {e.name}
                        </span>
                      ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={15} className="text-green-400" />
              <h3 className="text-sm font-semibold text-white">What we scan for</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              {['Known vulnerabilities (CVEs)', 'Misconfigurations', 'Weak SSL/TLS', 'Missing security headers', 'Exposed secrets', 'Technology exposure'].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <Check size={13} className="text-green-400 mt-0.5 shrink-0" />
                  <span className="text-xs">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </motion.div>
  );
}

export default function LiveScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
      </div>
    }>
      <LiveScanContent />
    </Suspense>
  );
}
