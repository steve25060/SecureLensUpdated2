'use client';

import React, { useState } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Shield, Lock, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { SettingPanel, SettingRow, Toggle } from './SettingsComponents';

// ─── API Keys Tab ─────────────────────────────────────────────────────────────
const MOCK_KEYS = [
  { name: 'Production API Key', key: 'sl_live_4x8k2m...9fQr', created: 'Jan 12, 2024', lastUsed: '2 min ago',  scopes: ['read', 'write'], active: true },
  { name: 'CI/CD Integration',  key: 'sl_live_9p3n7v...2kWx', created: 'Feb 4, 2024',  lastUsed: '1 hour ago', scopes: ['read'],          active: true },
  { name: 'Staging Key',        key: 'sl_test_1m5b8q...7jYz', created: 'Mar 18, 2024', lastUsed: '3 days ago', scopes: ['read', 'write', 'admin'], active: false },
];

export function ApiKeysTab() {
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<number | null>(null);

  const copyKey = (idx: number, key: string) => {
    navigator.clipboard.writeText(key).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const scopeColor = (s: string) =>
    s === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20'
    : s === 'write' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  return (
    <div className="space-y-4">
      <SettingPanel title="API Keys">
        <p className="text-xs text-gray-500 mb-4">Manage API keys for programmatic access to SecureLens.</p>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors mb-5">
          <Plus size={14} /> Generate New Key
        </button>

        <div className="space-y-3">
          {MOCK_KEYS.map((k, i) => (
            <div key={i} className={`rounded-xl border p-4 transition-colors ${k.active ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/20 border-gray-800 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 p-2 rounded-lg ${k.active ? 'bg-violet-600/20' : 'bg-gray-700/50'}`}>
                    <Key size={14} className={k.active ? 'text-violet-400' : 'text-gray-500'} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">{k.name}</p>
                      <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${k.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-700 text-gray-500 border-gray-600'}`}>
                        {k.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {/* Key display */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs font-mono text-gray-300 bg-gray-900 rounded px-2 py-0.5">
                        {showKeys[i] ? k.key.replace('...', 'AbCdEfGh') : k.key}
                      </code>
                      <button onClick={() => setShowKeys((p) => ({ ...p, [i]: !p[i] }))}
                        className="text-gray-500 hover:text-gray-300 transition-colors">
                        {showKeys[i] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => copyKey(i, k.key)}
                        className="text-gray-500 hover:text-violet-400 transition-colors">
                        {copied === i ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    {/* Scopes */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {k.scopes.map((s) => (
                        <span key={s} className={`text-[10px] font-medium rounded border px-1.5 py-0.5 ${scopeColor(s)}`}>{s}</span>
                      ))}
                    </div>
                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                      <span>Created {k.created}</span>
                      <span>·</span>
                      <span>Last used {k.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingPanel>

      <SettingPanel title="Webhooks">
        <p className="text-xs text-gray-500 mb-4">Receive real-time HTTP POST notifications for scan events.</p>
        <div className="rounded-xl border border-dashed border-gray-700 p-6 text-center">
          <Shield size={24} className="text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No webhooks configured</p>
          <button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-300 hover:text-white hover:border-gray-600 transition-colors mx-auto">
            <Plus size={12} /> Add Webhook
          </button>
        </div>
      </SettingPanel>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
export function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(false);

  const sessions = [
    { device: 'Chrome on macOS', location: 'San Francisco, CA', lastActive: 'Current session', current: true },
    { device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
    { device: 'Firefox on Windows', location: 'New York, NY', lastActive: '3 days ago', current: false },
  ];

  return (
    <div className="space-y-4">
      <SettingPanel title="Authentication" onSave={() => {}}>
        <SettingRow label="Two-Factor Authentication" sub="Add an extra layer of security to your account.">
          <div className="flex items-center gap-3">
            {twoFactor && <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">Enabled</span>}
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </div>
        </SettingRow>
        <SettingRow label="Login Alerts" sub="Get notified of new sign-ins to your account.">
          <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
        </SettingRow>
        <SettingRow label="Session Timeout" sub="Automatically sign out after 30 minutes of inactivity.">
          <Toggle checked={sessionTimeout} onChange={setSessionTimeout} />
        </SettingRow>
      </SettingPanel>

      <SettingPanel title="Change Password">
        <div className="space-y-3 max-w-sm">
          {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
            <div key={label}>
              <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 text-sm text-white rounded-lg pl-8 pr-3 py-2 outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors mt-2">
            <Lock size={13} /> Update Password
          </button>
        </div>
      </SettingPanel>

      <SettingPanel title="Active Sessions">
        <p className="text-xs text-gray-500 mb-4">Manage devices and sessions signed into your account.</p>
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${s.current ? 'bg-violet-600/5 border-violet-500/20' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.current ? 'bg-violet-600/20' : 'bg-gray-700/50'}`}>
                  <Shield size={14} className={s.current ? 'text-violet-400' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    {s.device}
                    {s.current && <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-1.5 py-0.5">Current</span>}
                  </p>
                  <p className="text-xs text-gray-500">{s.location} · {s.lastActive}</p>
                </div>
              </div>
              {!s.current && (
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
          <AlertTriangle size={12} /> Revoke all other sessions
        </button>
      </SettingPanel>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={14} /> Danger Zone
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Export all data', sub: 'Download a full archive of your account data.', btn: 'Export', icon: RefreshCw, cls: 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600' },
            { label: 'Delete account', sub: 'Permanently remove your account and all data.', btn: 'Delete', icon: Trash2, cls: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' },
          ].map((action) => (
            <div key={action.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{action.label}</p>
                <p className="text-xs text-gray-500">{action.sub}</p>
              </div>
              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${action.cls}`}>
                <action.icon size={12} /> {action.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
