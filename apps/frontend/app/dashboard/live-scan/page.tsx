'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { scanService, AvailableEngine } from '@/services/scan.service';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Check, Play, Globe, ArrowRight, Shield, Activity, Target, Zap } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

export default function LiveScanPage() {
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [engines, setEngines] = useState<AvailableEngine[]>([]);
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [scanId, setScanId] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadEngines(); }, []);

  useEffect(() => {
    if (!scanId || !isExecuting) return;
    const interval = setInterval(async () => {
      try {
        const status = await scanService.getScanStatus(scanId);
        setScanStatus(status.status);
        setScanProgress(status.progress);
        if (status.status === 'completed' || status.status === 'failed') {
          setIsExecuting(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [scanId, isExecuting]);

  const loadEngines = async () => {
    try {
      setIsLoading(true);
      const available = await scanService.getEnginesForMode('website');
      setEngines(available);
      const defaults = new Set(available.slice(0, 3).map((e) => e.id));
      setSelectedEngines(defaults);
    } catch (err) {
      setError('Failed to load available engines');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEngine = (engineId: string) => {
    const newSelected = new Set(selectedEngines);
    if (newSelected.has(engineId)) newSelected.delete(engineId);
    else newSelected.add(engineId);
    setSelectedEngines(newSelected);
  };

  const validateForm = () => {
    if (!workspaceId.trim()) { setError('Please select or create a workspace'); return false; }
    if (!targetUrl.trim()) { setError('Please enter a target URL'); return false; }
    if (selectedEngines.size === 0) { setError('Please select at least one security engine'); return false; }
    try { new URL(targetUrl); } catch { setError('Please enter a valid URL (e.g., https://example.com)'); return false; }
    return true;
  };

  const handleCreateScan = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      const response = await scanService.createScan({ workspaceId, mode: 'website', target: targetUrl, engines: Array.from(selectedEngines) });
      setScanId(response.scanId);
      setSuccess('Scan job created successfully. Starting scan...');
      setTimeout(async () => {
        try {
          await scanService.startScan(response.scanId);
          setScanStatus('running');
          setIsExecuting(true);
        } catch (err) { setError('Failed to start scan: ' + (err as any).message); }
      }, 500);
    } catch (err) { setError('Failed to create scan: ' + (err as any).message); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Live Website Security Scan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analyze your website for security vulnerabilities</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div variants={itemVariants}
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
          <p className="text-sm text-green-400">{success}</p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Configure Scan</h2>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Workspace ID</label>
              <input placeholder="Enter workspace ID or UUID" value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)} disabled={isExecuting}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Target URL</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input placeholder="https://example.com" type="url" value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)} disabled={isExecuting}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Enter the website URL you want to scan</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Security Engines</label>
                <button onClick={() => setSelectedEngines(new Set(engines.map(e => e.id)))}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Select All</button>
              </div>
              <p className="text-xs text-gray-500 mb-3">Select the security scanning engines to use</p>
              <div className="grid gap-2.5">
                {engines.map((engine) => (
                  <label key={engine.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedEngines.has(engine.id) ? 'border-violet-500/30 bg-violet-600/10' : 'border-white/[0.06] hover:border-white/[0.1] bg-white/[0.02]'
                    }`}>
                    <input type="checkbox" checked={selectedEngines.has(engine.id)}
                      onChange={() => toggleEngine(engine.id)} disabled={isExecuting}
                      className="mt-1 w-4 h-4 accent-violet-500 disabled:opacity-50 cursor-pointer rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{engine.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{engine.description}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-white/[0.03] text-gray-500 text-[10px] rounded-md border border-white/[0.06]">
                        {engine.category}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateScan}
                disabled={isLoading || isExecuting}
                className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:opacity-40 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20">
                {isExecuting ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
                : isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                : <><Play size={16} /> Start Scan</>}
              </motion.button>
              {scanId && !isExecuting && (
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => router.push(`/dashboard/findings?scanId=${scanId}`)}
                  className="bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-white px-6 py-3 rounded-xl font-semibold transition-all">
                  View Results
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 space-y-4 sticky top-6">
            <h2 className="text-lg font-semibold text-white">Scan Status</h2>
            {!scanId ? (
              <p className="text-sm text-gray-500">No scan in progress. Configure and start a scan to see status here.</p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <div className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-center text-sm font-semibold text-violet-400 capitalize">
                    {scanStatus || 'queued'}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Progress</p>
                  <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                      className="bg-gradient-to-r from-violet-600 to-violet-500 h-full rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-white">{scanProgress}%</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/[0.04]">
                  <p className="text-xs font-medium text-gray-500">Scan ID</p>
                  <p className="text-xs font-mono bg-white/[0.04] p-2 rounded-lg text-gray-400 break-all">{scanId}</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/[0.04]">
                  <p className="text-xs font-medium text-gray-500">Target</p>
                  <p className="text-xs text-gray-400 break-all">{targetUrl}</p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div variants={itemVariants} className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-violet-400" />
            <h3 className="text-base font-semibold text-white">How it works</h3>
          </div>
          <div className="space-y-2.5 text-sm text-gray-500">
            {['Select your security workspace or create a new one', 'Enter the website URL you want to scan', 'Choose which security engines to run', 'Click "Start Scan" to begin analysis', 'Monitor progress in real-time', 'Review detailed findings and get AI-powered insights'].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-violet-600/10 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/20">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-green-400" />
            <h3 className="text-base font-semibold text-white">What we scan for</h3>
          </div>
          <div className="space-y-2.5 text-sm text-gray-500">
            {['Known vulnerabilities (CVEs)', 'Misconfigurations', 'Weak SSL/TLS', 'Missing security headers', 'Default credentials', 'Technology exposure'].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
