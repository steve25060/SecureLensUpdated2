'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Sparkles, Send, Shield, ShieldAlert, AlertTriangle, Info,
  TrendingDown, Download, Share2, ChevronRight, ExternalLink,
  Globe, Clock, CheckCircle2, ArrowRight, Bot, User,
} from 'lucide-react';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const statCards = [
  { label: 'Critical Findings', value: 18, sub: 'Require immediate action', color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20',     icon: ShieldAlert },
  { label: 'High Findings',     value: 24, sub: 'Require attention',        color: '#f97316', bg: 'bg-orange-500/10 border-orange-500/20', icon: AlertTriangle },
  { label: 'Medium Findings',   value: 32, sub: 'Should be reviewed',       color: '#eab308', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Shield },
  { label: 'Info Findings',     value: 12, sub: 'Informational',            color: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20',     icon: Info },
];

const timelineItems = [
  { time: '10:18 AM', label: 'SQL Injection',           sub: '/search?id=1',            color: '#ef4444', sev: 'Critical' },
  { time: '10:20 AM', label: 'Cross-Site Scripting (XSS)', sub: '/comments?post=123',  color: '#f97316', sev: 'High' },
  { time: '10:25 AM', label: 'Missing Security Header',  sub: 'Strict-Transport-Security', color: '#f97316', sev: 'High' },
  { time: '10:28 AM', label: 'Hardcoded API Key',        sub: 'config.js:12',           color: '#eab308', sev: 'Medium' },
  { time: '10:30 AM', label: 'Open Redirect',            sub: '/login?next=http://evil.com', color: '#eab308', sev: 'Medium' },
];

const recommendations = [
  { rank: 1, sev: 'Critical', sevColor: 'bg-red-500', title: 'Fix SQL Injection vulnerabilities', desc: 'Sanitize user inputs and use parameterized queries to prevent SQL injection attacks.' },
  { rank: 2, sev: 'High',     sevColor: 'bg-orange-500', title: 'Implement Content Security Policy', desc: 'Add a Content Security Policy (CSP) header to mitigate XSS risks.' },
  { rank: 3, sev: 'High',     sevColor: 'bg-orange-500', title: 'Add Missing Security Headers', desc: 'Implement security headers like HSTS, X-Frame-Options, and X-Content-Type-Options.' },
];

const categoryData = [
  { name: 'Injection Flaws',     value: 22, pct: 25.6, color: '#ef4444' },
  { name: 'Broken Access Control', value: 18, pct: 20.9, color: '#f97316' },
  { name: 'Security Misconfigs', value: 16, pct: 18.6, color: '#eab308' },
  { name: 'XSS',                 value: 14, pct: 16.3, color: '#22c55e' },
  { name: 'Others',              value: 16, pct: 18.6, color: '#3b82f6' },
];

const affectedAssets = [
  { name: 'acme.com',         count: 28 },
  { name: 'api.acme.com',     count: 16 },
  { name: 'staging.acme.com', count: 12 },
  { name: 'admin.acme.com',   count: 8  },
  { name: 'cdn.acme.com',     count: 6  },
];

type ChatMsg = { role: 'user' | 'assistant'; content: string; time: string };

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    role: 'assistant',
    content: `I analyzed **86 findings** and identified **18 critical** and **24 high severity** issues that should be prioritized.\n\nThe most critical issue is **SQL Injection** in \`/search?id=1\` which could allow attackers to access or modify your database.\n\nI recommend addressing these issues in order of severity to reduce your overall risk.`,
    time: '10:30 AM',
  },
];

const SUGGESTED = [
  'What is the most critical vulnerability?',
  'How do I fix the SQL Injection?',
  'Generate an executive summary',
  'What are the OWASP Top 10 risks?',
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

// ─── Chat message renderer ────────────────────────────────────────────────────
function ChatMessage({ msg, isLast }: { msg: ChatMsg; isLast: boolean }) {
  const isAI = msg.role === 'assistant';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isAI ? 'bg-violet-600' : 'bg-gray-700'}`}>
        {isAI ? <Bot size={14} className="text-white" /> : <User size={14} className="text-gray-300" />}
      </div>
      <div className={`max-w-[80%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAI ? 'bg-gray-800 text-gray-200 rounded-tl-sm' : 'bg-violet-600 text-white rounded-tr-sm'
        }`}>
          {msg.content.split('\n').map((line, i) => {
            // Bold **text**
            const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
            return (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>
                {parts.map((part, j) =>
                  part.startsWith('**') ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                  : part.startsWith('`') ? <code key={j} className="bg-gray-700/50 rounded px-1 text-violet-300 font-mono text-xs">{part.slice(1, -1)}</code>
                  : part
                )}
              </p>
            );
          })}
        </div>
        <span className="text-[10px] text-gray-600 mt-1 px-1">{msg.time}</span>
        {isAI && isLast && (
          <div className="flex gap-2 mt-1 px-1">
            <button className="text-[11px] text-gray-500 hover:text-violet-400 transition-colors">👍 Helpful</button>
            <button className="text-[11px] text-gray-500 hover:text-violet-400 transition-colors">👎 Not helpful</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AiCopilotPage() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput('');
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: msg, time: now }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Based on your scan results, here's what I found regarding **"${msg}"**:\n\nThe primary concern relates to your top critical findings. I recommend reviewing the SQL Injection vulnerability in \`/search?id=1\` first as it poses the highest risk to your data integrity.\n\nWould you like me to generate a detailed remediation plan?`,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">AI Copilot Analysis</h1>
            <span className="text-[10px] font-bold bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-full px-2 py-0.5">BETA</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">AI-powered insights and recommendations based on your scan results.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white transition-colors">
            <Download size={14} /> Download Report
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors">
            <Share2 size={14} /> Share Report
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} {...fade(0.05 + i * 0.04)}
            className={`bg-gray-900 border rounded-xl p-4 ${s.bg}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} style={{ color: s.color }} />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main 3-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Executive Summary + Timeline + Recommendations */}
        <div className="lg:col-span-2 space-y-5">
          {/* Executive Summary */}
          <motion.div {...fade(0.15)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-400" /> Executive Summary
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  The scan of <span className="text-violet-400">acme.com</span> revealed a total of <strong className="text-white">86 security findings</strong> across 10 security engines. We identified <span className="text-red-400 font-semibold">18 critical</span> and <span className="text-orange-400 font-semibold">24 high severity</span> vulnerabilities that could potentially impact the confidentiality, integrity, and availability of your systems.
                </p>
                <p className="text-sm text-gray-400 leading-relaxed mt-2">
                  The most significant risks include SQL Injection, Cross-Site Scripting (XSS), and Missing Security Headers. Immediate attention to these issues is recommended.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-500">Risk Score</span>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">High Risk</span>
                </div>
              </div>
              <div className="shrink-0 relative">
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={[{ value: 72 }, { value: 28 }]} cx={40} cy={40} innerRadius={26} outerRadius={40} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                      <Cell fill="#ef4444" />
                      <Cell fill="#1f2937" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white">72</span>
                  <span className="text-[10px] text-gray-400">/100</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Findings Timeline */}
          <motion.div {...fade(0.2)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Key Findings Timeline</h2>
              <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View Full Timeline <ArrowRight size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Critical and High severity findings discovered during the scan.</p>
            <div className="flex items-start gap-3 overflow-x-auto pb-2">
              {timelineItems.map((item, i) => (
                <div key={i} className="flex flex-col items-center min-w-[110px]">
                  <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: item.color, background: `${item.color}18` }}>
                    <ShieldAlert size={14} style={{ color: item.color }} />
                  </div>
                  {i < timelineItems.length - 1 && (
                    <div className="absolute" style={{ display: 'none' }} />
                  )}
                  <p className="text-[10px] text-gray-500 mt-1">{item.time}</p>
                  <p className="text-xs text-white font-medium text-center mt-1 leading-tight">{item.label}</p>
                  <p className="text-[10px] text-gray-500 text-center truncate max-w-[100px]">{item.sub}</p>
                </div>
              ))}
            </div>
            {/* Timeline connector line */}
            <div className="relative mt-0">
              <div className="absolute top-[-120px] left-[52px] right-[52px] h-px bg-gray-700" style={{ display: 'none' }} />
            </div>
          </motion.div>

          {/* Top Recommendations */}
          <motion.div {...fade(0.25)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Top Recommendations</h2>
              <button className="text-xs text-violet-400 hover:text-violet-300">View all recommendations →</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Prioritized actions to improve your security posture.</p>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.rank} className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {rec.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold text-white rounded px-1.5 py-0.5 ${rec.sevColor}`}>{rec.sev}</span>
                      <p className="text-sm font-medium text-white">{rec.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{rec.desc}</p>
                  </div>
                  <button className="text-xs text-violet-400 hover:text-violet-300 whitespace-nowrap flex items-center gap-1 shrink-0">
                    View Details <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: AI Chat + Sidebar cards */}
        <div className="space-y-5">
          {/* AI Chat */}
          <motion.div {...fade(0.1)} className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col" style={{ height: '420px' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 shrink-0">
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white">AI Copilot</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} isLast={i === messages.length - 1} />
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts */}
            <div className="px-4 pb-2 shrink-0 flex gap-2 overflow-x-auto">
              {SUGGESTED.slice(0, 2).map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-[10px] text-violet-400 border border-violet-500/30 rounded-full px-2.5 py-1 hover:bg-violet-500/10 transition-colors whitespace-nowrap shrink-0">
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 shrink-0">
              <div className="flex items-center gap-2 bg-gray-800 rounded-xl border border-gray-700 px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask anything about your findings…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                />
                <button onClick={() => sendMessage()}
                  className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors">
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Findings by Category */}
          <motion.div {...fade(0.2)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Globe size={14} className="text-violet-400" /> Findings by Category
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie data={categoryData} cx={40} cy={40} innerRadius={26} outerRadius={42} dataKey="value" stroke="none">
                      {categoryData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-white">86</span>
                  <span className="text-[9px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="truncate max-w-[100px]">{c.name}</span>
                    </span>
                    <span className="text-gray-500">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Affected Assets */}
          <motion.div {...fade(0.25)} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe size={14} className="text-violet-400" /> Affected Assets
              </h3>
              <button className="text-xs text-violet-400 hover:text-violet-300">View all →</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Top assets with the most findings.</p>
            <div className="space-y-2">
              {affectedAssets.map((a) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Globe size={11} className="text-gray-500" />{a.name}
                  </div>
                  <span className="text-xs font-bold text-orange-400">{a.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
