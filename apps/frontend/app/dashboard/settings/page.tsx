'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Key, Globe, Database, Eye, User, Palette, Mail, Lock, Webhook, ChevronRight, Moon, Sun, Check } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
};

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-600/20">
                SA
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Stavan Shah</h3>
                <p className="text-xs text-gray-500">stavan@example.com</p>
                <p className="text-xs text-gray-600 mt-1">Member since May 2024</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: 'Stavan Shah', icon: User },
                { label: 'Email Address', value: 'stavan@example.com', icon: Mail },
                { label: 'Job Title', value: 'Security Engineer', icon: Shield },
                { label: 'Organization', value: 'Acme Security', icon: Globe },
              ].map(field => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} className="text-violet-400" />
                      <span className="text-[11px] text-gray-500 uppercase tracking-wide">{field.label}</span>
                    </div>
                    <p className="text-sm text-gray-200">{field.value}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-sm font-medium shadow-lg shadow-violet-600/20 transition-all">
                Save Changes
              </motion.button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-5">
            {[
              { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', enabled: true },
              { label: 'Login Notifications', desc: 'Get notified of new login attempts', enabled: true },
              { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', enabled: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-sm font-medium text-gray-200">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${item.enabled ? 'bg-violet-600' : 'bg-white/[0.08]'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-yellow-400/80">Security settings changes are logged and audited.</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-5">
            {[
              { label: 'Critical Findings', desc: 'Alert me when critical vulnerabilities are found', checked: true },
              { label: 'Scan Complete', desc: 'Notify when automated scans finish', checked: true },
              { label: 'Weekly Report', desc: 'Receive weekly security summary via email', checked: true },
              { label: 'Product Updates', desc: 'News about new features and improvements', checked: false },
              { label: 'Team Activity', desc: 'When team members make changes', checked: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-sm font-medium text-gray-200">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${item.checked ? 'bg-violet-600' : 'bg-white/[0.08]'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-200 mb-3">Theme</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Dark', icon: Moon, active: true },
                  { label: 'Light', icon: Sun, active: false },
                ].map(theme => {
                  const Icon = theme.icon;
                  return (
                    <motion.button key={theme.label} whileHover={{ y: -1 }}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        theme.active ? 'bg-violet-600/10 border-violet-500/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                      }`}>
                      <Icon size={24} className={`mx-auto mb-2 ${theme.active ? 'text-violet-400' : 'text-gray-500'}`} />
                      <p className={`text-sm font-medium ${theme.active ? 'text-violet-300' : 'text-gray-400'}`}>{theme.label}</p>
                      {theme.active && <Check size={12} className="text-violet-400 mx-auto mt-1" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200 mb-3">Accent Color</p>
              <div className="flex gap-3">
                {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                  <motion.button key={color} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 rounded-xl transition-all ${color === '#7c3aed' ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0f] ring-violet-500/50' : ''}`}
                    style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>
        );
      case 'api':
        return (
          <div className="space-y-5">
            {[
              { name: 'Production Key', key: 'sk_live_••••••••••••••••', created: 'May 1, 2024', lastUsed: '2 hours ago' },
              { name: 'Staging Key', key: 'sk_test_••••••••••••••••', created: 'Apr 15, 2024', lastUsed: '3 days ago' },
            ].map(api => (
              <div key={api.name} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{api.name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-black/30 border border-white/[0.04]">
                  <code className="text-xs text-gray-400 font-mono">{api.key}</code>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-500">
                  <span>Created: {api.created}</span>
                  <span>Last used: {api.lastUsed}</span>
                </div>
              </div>
            ))}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.1] text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-all">
              + Generate New Key
            </motion.button>
          </div>
        );
      case 'integrations':
        return (
          <div className="space-y-5">
            {[
              { name: 'Slack', desc: 'Send alerts and notifications to Slack', connected: true, icon: '#' },
              { name: 'Jira', desc: 'Create tickets from security findings', connected: true, icon: 'J' },
              { name: 'GitHub', desc: 'Scan repositories on push events', connected: false, icon: 'G' },
              { name: 'PagerDuty', desc: 'On-call incident response integration', connected: false, icon: 'P' },
            ].map(integration => (
              <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white font-bold text-sm">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{integration.name}</p>
                    <p className="text-xs text-gray-500">{integration.desc}</p>
                  </div>
                </div>
                <button className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  integration.connected
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300'
                }`}>
                  {integration.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account, security, and preferences.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.06] overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-gray-500 hover:text-gray-300'
              }`}>
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <TabContent />
      </motion.div>
    </motion.div>
  );
}
