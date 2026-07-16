'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, X, Archive, Filter, Mail, MailOpen, Trash2, Clock } from 'lucide-react';

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
}

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  error: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch {}
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) await markAsRead(n.id);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-gray-200 transition-colors">
              <MailOpen size={13} /> Mark all read
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-gray-200 transition-colors">
            <Archive size={13} /> Archive
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.06] w-fit">
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
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Bell size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </motion.div>
        ) : (
          <motion.div key="list" variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {filtered.map((notif) => {
              const config = typeConfig[notif.type];
              const Icon = config.icon;
              return (
                <motion.div key={notif.id} layout variants={itemVariants}
                  className={`rounded-xl ${config.bg} ${config.border} border ${
                    notif.read ? 'opacity-60' : ''
                  } p-4 hover:bg-white/[0.03] transition-all group`}>
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
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-600">
                        <Clock size={10} />
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-violet-400 transition-colors">
                          <Mail size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.04] text-gray-500 hover:text-red-400 transition-colors">
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
    </motion.div>
  );
}
