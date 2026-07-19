'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, CheckCircle, Info, X, Archive, Filter, Mail, MailOpen, Trash2,
  Clock, Shield, AlertCircle, Zap, Settings, User,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  category: 'scan' | 'finding' | 'system' | 'account';
}

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'Critical Finding Detected', message: 'SQL Injection vulnerability found in /api/auth/login endpoint. CVSS: 9.8', type: 'error', read: false, createdAt: '2024-05-16T10:30:00Z', category: 'finding' },
  { id: 'n-2', title: 'Nuclei Scan Completed', message: 'Scan of acme.com completed with 45 findings (2 critical, 8 high)', type: 'success', read: false, createdAt: '2024-05-16T10:15:00Z', category: 'scan' },
  { id: 'n-3', title: 'Exposed AWS Access Key', message: 'Hardcoded AWS access key detected in .env.example by Gitleaks scanner', type: 'error', read: false, createdAt: '2024-05-16T09:45:00Z', category: 'finding' },
  { id: 'n-4', title: 'Weekly Security Report Ready', message: 'Your weekly security posture report for May 10-16 is ready for review', type: 'info', read: false, createdAt: '2024-05-16T09:00:00Z', category: 'system' },
  { id: 'n-5', title: 'OWASP ZAP Scan Completed', message: 'Active scan of staging.acme.com completed with 12 security alerts', type: 'success', read: true, createdAt: '2024-05-16T08:30:00Z', category: 'scan' },
  { id: 'n-6', title: 'New Workspace Created', message: 'Frontend-app workspace was created and is ready for scanning', type: 'info', read: true, createdAt: '2024-05-15T16:20:00Z', category: 'system' },
  { id: 'n-7', title: 'Weak TLS Configuration', message: 'Server supports TLS 1.0 on acme.com. Upgrade to TLS 1.3 recommended', type: 'warning', read: true, createdAt: '2024-05-15T14:10:00Z', category: 'finding' },
  { id: 'n-8', title: 'GitHub Scan Failed', message: 'Scan of private-repo could not clone repository. Check access permissions.', type: 'error', read: true, createdAt: '2024-05-15T11:45:00Z', category: 'scan' },
  { id: 'n-9', title: 'Security Score Improved', message: 'Your overall security score increased from 72 to 84 (+12 pts) in the last 7 days', type: 'success', read: true, createdAt: '2024-05-15T09:00:00Z', category: 'system' },
  { id: 'n-10', title: 'API Key Expiring Soon', message: 'Your Production API key will expire in 14 days. Generate a new one to avoid disruption.', type: 'warning', read: true, createdAt: '2024-05-14T15:30:00Z', category: 'account' },
];

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

const categoryConfig = {
  scan: { label: 'Scan', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  finding: { label: 'Finding', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  system: { label: 'System', icon: Settings, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  account: { label: 'Account', icon: User, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = notifications
    .filter(n => {
      if (filter === 'unread') return !n.read;
      if (filter === 'read') return n.read;
      return true;
    })
    .filter(n => {
      if (categoryFilter === 'all') return true;
      return n.category === categoryFilter;
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-all">
              <MailOpen size={13} /> Mark all read
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-all">
            <Archive size={13} /> Archive
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.06]">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-violet-500 text-white rounded-full text-[10px]">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-white/[0.06]" />

        <div className="flex items-center gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.06]">
          {(['all', 'scan', 'finding', 'system', 'account'] as const).map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                categoryFilter === c ? 'bg-white/[0.06] text-white' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {c === 'all' ? 'All Types' : c}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Bell size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-xs text-gray-600 mt-1">We&apos;ll notify you when something important happens.</p>
          </motion.div>
        ) : (
          <motion.div key="list" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2.5">
            {filtered.map((notif) => {
              const config = typeConfig[notif.type];
              const catConfig = categoryConfig[notif.category];
              const Icon = config.icon;
              const CatIcon = catConfig.icon;
              return (
                <motion.div key={notif.id} layout variants={itemVariants}
                  className={`rounded-xl border p-4 hover:bg-white/[0.03] transition-all group ${
                    notif.read ? 'bg-white/[0.01] border-white/[0.04] opacity-60' : `${config.bg} ${config.border}`
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.border} border shrink-0 mt-0.5`}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm font-semibold ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h3>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
                          <Clock size={10} />{timeAgo(notif.createdAt)}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border ${catConfig.bg}`}>
                          <CatIcon size={9} className={catConfig.color} />{catConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-violet-400 transition-colors"
                          title="Mark as read">
                          <Mail size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage what notifications you receive.</p>
          </div>
          <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
            Configure <ArrowRight size={11} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
