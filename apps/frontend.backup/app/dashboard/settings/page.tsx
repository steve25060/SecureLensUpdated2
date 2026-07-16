'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Bell, Key, Shield, AlertTriangle,
  Palette, Plug, Activity, ExternalLink, Zap,
} from 'lucide-react';
import { GeneralTab, ProfileTab, NotificationsTab } from '@/components/dashboard/settings/SettingsTabs';
import { ApiKeysTab, SecurityTab } from '@/components/dashboard/settings/SettingsTabsExtra';

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',       label: 'General',       icon: Settings,    component: GeneralTab },
  { id: 'profile',       label: 'Profile',        icon: User,        component: ProfileTab },
  { id: 'appearance',    label: 'Appearance',     icon: Palette,     component: null },
  { id: 'integrations',  label: 'Integrations',   icon: Plug,        component: null },
  { id: 'api-keys',      label: 'API Keys',       icon: Key,         component: ApiKeysTab },
  { id: 'notifications', label: 'Notifications',  icon: Bell,        component: NotificationsTab },
  { id: 'security',      label: 'Security',       icon: Shield,      component: SecurityTab },
  { id: 'danger-zone',   label: 'Danger Zone',    icon: AlertTriangle, component: null },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const GENERAL_SUBNAV = ['General Settings', 'Language & Region', 'Time Zone', 'Access & Permissions', 'Activity Log'];

// ─── Right panel widgets ──────────────────────────────────────────────────────
function PlanCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-white">Your Plan</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="p-2 rounded-lg bg-violet-600/20">
            <Shield size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Pro Plan</p>
            <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">Active</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">You have access to all Pro features and integrations.</p>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Scans this month</span>
          <span className="text-white font-medium">48 / 1,000</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '4.8%' }} transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full bg-violet-600 rounded-full" />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500">Renews on <span className="text-gray-300">Jun 16, 2024</span></p>
      </div>
      <button className="w-full py-2 rounded-lg border border-violet-500/40 text-xs font-medium text-violet-400 hover:bg-violet-600/10 transition-colors flex items-center justify-center gap-1.5">
        Manage Subscription <ExternalLink size={11} />
      </button>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Download My Data',  icon: Activity },
    { label: 'Export All Reports', icon: Activity },
    { label: 'Clear Cache',        icon: Activity },
    { label: 'View Activity Log',  icon: Activity },
  ];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm font-semibold text-white mb-3">Quick Actions</p>
      <div className="space-y-1">
        {actions.map((a) => (
          <button key={a.label}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
            <span>{a.label}</span>
            <span className="text-gray-600 group-hover:text-gray-400 transition-colors">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HelpCard() {
  const links = [
    { label: 'Documentation',   icon: ExternalLink },
    { label: 'Video Tutorials',  icon: ExternalLink },
    { label: 'Contact Support',  icon: ExternalLink },
    { label: 'Community Forum',  icon: ExternalLink },
  ];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm font-semibold text-white mb-3">Help & Support</p>
      <div className="space-y-1">
        {links.map((l) => (
          <button key={l.label}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-violet-400 transition-colors group">
            <span>{l.label}</span>
            <ExternalLink size={12} className="text-gray-600 group-hover:text-violet-400 transition-colors" />
          </button>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600/20">
            <Zap size={12} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">SecureLens v2.1.0</p>
            <p className="text-[10px] text-gray-500">© 2024 SecureLens Inc.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty placeholder for unbuilt tabs ──────────────────────────────────────
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
      <div className="p-4 rounded-full bg-violet-600/10 mb-4">
        <Plug size={24} className="text-violet-400" />
      </div>
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-sm text-gray-500">This section is coming soon.</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [activeSubnav, setActiveSubnav] = useState('General Settings');

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const TabComponent = currentTab.component;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account, preferences and integrations.</p>
      </motion.div>

      {/* Top tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-1 border-b border-gray-800 overflow-x-auto"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === id
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            } ${id === 'danger-zone' ? 'text-red-400 hover:text-red-300' : ''}`}
          >
            <Icon size={14} />
            {label}
            {activeTab === id && (
              <motion.span
                layoutId="settings-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t"
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Body: sidebar + content + right panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-5 items-start"
      >
        {/* Left subnav (only for General) */}
        <div className="hidden lg:block">
          {activeTab === 'general' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 space-y-0.5">
              {GENERAL_SUBNAV.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSubnav(item)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSubnav === item
                      ? 'bg-violet-600/15 text-violet-400 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {activeTab !== 'general' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 text-center">No sub-sections</p>
            </div>
          )}
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {TabComponent ? (
              <TabComponent />
            ) : (
              <ComingSoon label={currentTab.label} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Right panel */}
        <div className="hidden lg:flex flex-col gap-4">
          <PlanCard />
          <QuickActions />
          <HelpCard />
        </div>
      </motion.div>
    </div>
  );
}
