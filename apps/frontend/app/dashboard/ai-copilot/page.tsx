'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, Send, Bot, User, Shield, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Code, FileText, BarChart3, ArrowRight, Clock, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

const severityData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 28, color: '#f97316' },
  { name: 'Medium', value: 35, color: '#eab308' },
  { name: 'Low', value: 25, color: '#22c55e' },
];

const QUICK_ACTIONS = [
  { icon: Shield, label: 'Security Overview', prompt: 'Give me a security overview of my infrastructure' },
  { icon: TrendingUp, label: 'Risk Analysis', prompt: 'Analyze my current risk posture' },
  { icon: AlertTriangle, label: 'Critical Issues', prompt: 'What are my most critical security issues?' },
  { icon: CheckCircle, label: 'Remediation', prompt: 'Suggest remediation steps for my findings' },
  { icon: Code, label: 'Code Review', prompt: 'Review my codebase for security issues' },
  { icon: FileText, label: 'Report Summary', prompt: 'Summarize my latest security report' },
];

const INITIAL_MESSAGES = [
  { role: 'assistant' as const, content: 'Hello! I\'m your AI security copilot. I can help you analyze findings, suggest remediations, and provide security insights. What would you like to explore?' },
];

const executiveSummary = {
  totalScans: 47, criticalFindings: 12, resolvedIssues: 38, securityScore: 84,
  topRisks: [
    { name: 'SQL Injection in Login', severity: 'Critical', cve: 'CVE-2024-1234' },
    { name: 'Exposed API Keys', severity: 'Critical', cve: null },
    { name: 'Weak TLS Config', severity: 'High', cve: 'CVE-2024-5678' },
    { name: 'Missing CSP Header', severity: 'Medium', cve: null },
  ],
  recommendations: [
    'Implement parameterized queries for all database operations',
    'Rotate exposed credentials immediately and implement secret scanning in CI/CD',
    'Upgrade TLS configuration to TLS 1.3 only with strong cipher suites',
    'Add Content-Security-Policy header with strict directives',
  ],
};

export default function AICopilotPage() {
  const [messages, setMessages] = useState<{role: 'assistant' | 'user'; content: string}[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'executive'>('executive');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (prompt?: string) => {
    const text = prompt || input;
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've analyzed your request regarding "${text.substring(0, 50)}...". Based on current scan data, I recommend reviewing your critical findings first. Would you like me to dive deeper into any specific area?`
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20">
            <Sparkles size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Copilot</h1>
            <p className="text-sm text-gray-500 mt-0.5">AI-powered security assistant for insights and recommendations.</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
          {(['executive', 'chat'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab === 'executive' ? 'Executive Summary' : 'AI Chat'}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'executive' ? (
          <motion.div key="executive" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Scans', value: executiveSummary.totalScans, icon: Shield, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { label: 'Critical', value: executiveSummary.criticalFindings, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'Resolved', value: executiveSummary.resolvedIssues, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Security Score', value: `${executiveSummary.securityScore}/100`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} whileHover={{ y: -1 }} className={`${stat.bg} border border-white/[0.04] rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={15} className={stat.color} />
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Top Critical Risks</h3>
                <div className="space-y-3">
                  {executiveSummary.topRisks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className={`p-1.5 rounded-lg shrink-0 ${risk.severity === 'Critical' ? 'bg-red-500/10' : 'bg-orange-500/10'}`}>
                        <AlertTriangle size={12} className={risk.severity === 'Critical' ? 'text-red-400' : 'text-orange-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-200">{risk.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{risk.cve || `${risk.severity} severity`}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        risk.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>{risk.severity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  {executiveSummary.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1 rounded-lg bg-violet-600/10 border border-violet-500/20 shrink-0 mt-0.5">
                        <Lightbulb size={12} className="text-violet-400" />
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Severity Distribution</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={severityData} cx={50} cy={50} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                        {severityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {severityData.map(s => (
                      <div key={s.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        <span className="text-gray-400">{s.name}</span>
                        <span className="text-gray-500 ml-2">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {QUICK_ACTIONS.slice(0, 4).map(action => {
                    const Icon = action.icon;
                    return (
                      <motion.button key={action.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { setActiveTab('chat'); sendMessage(action.prompt); }}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] text-left transition-all">
                        <Icon size={14} className="text-violet-400 shrink-0" />
                        <span className="text-xs text-gray-400">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20 shrink-0">
                          <Bot size={16} className="text-violet-400" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-xl p-4 ${
                        msg.role === 'user' ? 'bg-violet-600/20 border border-violet-500/20' : 'bg-white/[0.03] border border-white/[0.06]'
                      }`}>
                        <p className="text-xs text-gray-300 leading-relaxed">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/20 shrink-0">
                          <User size={16} className="text-violet-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20">
                        <Bot size={16} className="text-violet-400" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-violet-400" />
                        <span className="text-xs text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-white/[0.04]">
                  <div className="flex gap-2">
                    <input value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask about your security posture..."
                      className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => sendMessage()} disabled={!input.trim() || loading}
                      className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all">
                      <Send size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {QUICK_ACTIONS.map(action => {
                    const Icon = action.icon;
                    return (
                      <motion.button key={action.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(action.prompt)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] text-left transition-all">
                        <Icon size={14} className="text-violet-400 shrink-0" />
                        <span className="text-xs text-gray-400">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
