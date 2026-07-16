'use client';

import React, { useState } from 'react';
import { Shield, Bell, Globe, Clock, Lock, Trash2, AlertTriangle, User, Mail, Building, MapPin } from 'lucide-react';
import { Toggle, Select, SettingRow, SettingPanel } from './SettingsComponents';

// ─── General Tab ──────────────────────────────────────────────────────────────
export function GeneralTab() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [anonAnalytics, setAnonAnalytics] = useState(false);
  const [workspace, setWorkspace] = useState('acme.com');
  const [riskView, setRiskView] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [retention, setRetention] = useState('13 Months');
  const [orgName, setOrgName] = useState('Acme Corporation');

  return (
    <div className="space-y-4">
      <SettingPanel title="General Settings" onSave={() => {}}>
        <p className="text-xs text-gray-500 mb-4">Manage your general preferences and platform settings.</p>

        <div className="space-y-0">
          <SettingRow label="Organization Name" sub="This name will be used across the platform.">
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-sm text-white rounded-lg px-3 py-2 w-48 outline-none focus:border-violet-500 transition-colors"
            />
          </SettingRow>

          <SettingRow label="Default Workspace" sub="Select the workspace you want to load by default.">
            <Select value={workspace} options={['acme.com', 'vulnerable-app', 'staging.acme.com']} onChange={setWorkspace} />
          </SettingRow>

          <SettingRow label="Auto Refresh Dashboard" sub="Automatically refresh dashboard data.">
            <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
          </SettingRow>

          <SettingRow label="Default Risk View" sub="Choose the default risk level to show in findings.">
            <div className="flex rounded-lg overflow-hidden border border-gray-700">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((v) => (
                <button key={v} onClick={() => setRiskView(v)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${riskView === v ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Items per page" sub="Select how many items to display in tables.">
            <Select value={itemsPerPage} options={['10', '25', '50', '100']} onChange={setItemsPerPage} />
          </SettingRow>

          <SettingRow label="Enable Dark Mode" sub="Use dark mode across the platform.">
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </SettingRow>

          <SettingRow label="Data retention" sub="Choose how long we should keep your scan data.">
            <Select value={retention} options={['3 Months', '6 Months', '13 Months', '24 Months']} onChange={setRetention} />
          </SettingRow>

          <SettingRow label="Email Notifications" sub="Receive email notifications for important events.">
            <Toggle checked={emailNotif} onChange={setEmailNotif} />
          </SettingRow>

          <SettingRow label="Anonymous Usage Analytics" sub="Help us improve by sharing anonymous usage data.">
            <Toggle checked={anonAnalytics} onChange={setAnonAnalytics} />
          </SettingRow>
        </div>
      </SettingPanel>

      {/* Language & Region */}
      <SettingPanel title="Language & Region">
        <div className="space-y-0">
          <SettingRow label="Language" sub="Select your preferred language.">
            <Select value="English (US)" options={['English (US)', 'English (UK)', 'French', 'German', 'Spanish']} onChange={() => {}} />
          </SettingRow>
          <SettingRow label="Date Format" sub="Choose how dates are displayed.">
            <Select value="MM/DD/YYYY" options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} onChange={() => {}} />
          </SettingRow>
        </div>
      </SettingPanel>

      {/* Time Zone */}
      <SettingPanel title="Time Zone">
        <SettingRow label="Time Zone" sub="All times will be shown in this time zone.">
          <Select value="(GMT-07:00) Pacific Time" options={['(GMT-07:00) Pacific Time', '(GMT-05:00) Eastern Time', '(GMT+05:30) IST', '(GMT+00:00) UTC']} onChange={() => {}} />
        </SettingRow>
      </SettingPanel>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
export function ProfileTab() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [website, setWebsite] = useState('https://acme.com');
  const [location, setLocation] = useState('San Francisco, California, USA');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load user data from localStorage on mount
  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userEmail = localStorage.getItem('user_email');
    const userName = localStorage.getItem('user_name');

    let userData: any = {};

    if (userStr) {
      try {
        userData = JSON.parse(userStr);
      } catch (e) {
        // Silent fail
      }
    }

    // Set form values
    const displayName = userName || userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
    setName(displayName);
    setEmail(userEmail || userData.email || 'user@example.com');
    setOrg(userData.organization || 'Acme Corporation');
  }, []);

  // Handle name save
  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      // Update localStorage
      const userStr = localStorage.getItem('user');
      let userData: any = {};

      if (userStr) {
        try {
          userData = JSON.parse(userStr);
        } catch (e) {
          // Silent fail
        }
      }

      // Update user data
      userData.name = name;
      userData.displayName = name;

      // Store updated user data
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user_name', name);

      // Dispatch custom event to notify Header component
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { name } }));

      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to update profile');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate initials
  const getInitials = () => {
    const parts = name.split(' ');
    return parts
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="space-y-4">
      <SettingPanel title="Profile Information" onSave={handleSaveName}>
        <div className="flex items-start gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-500/40 flex items-center justify-center text-2xl font-bold text-violet-400">
              {getInitials() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-violet-600 border-2 border-gray-900 flex items-center justify-center text-white hover:bg-violet-500 transition-colors">
              <User size={9} />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-gray-400">Admin</p>
            <button className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">Change avatar</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', icon: User, value: name, set: setName, onChange: true },
            { label: 'Email Address', icon: Mail, value: email, set: setEmail, disabled: true },
            { label: 'Organization', icon: Building, value: org, set: setOrg },
            { label: 'Website', icon: Globe, value: website, set: setWebsite },
            { label: 'Location', icon: MapPin, value: location, set: setLocation },
          ].map(({ label, icon: Icon, value, set, disabled, onChange }) => (
            <div key={label}>
              <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={value}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  disabled={disabled}
                  className={`w-full bg-gray-800 border border-gray-700 text-sm text-white rounded-lg pl-8 pr-3 py-2 outline-none focus:border-violet-500 ${disabled ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''} transition-colors`}
                />
              </div>
              {onChange && name !== '' && (
                <p className="text-xs text-gray-500 mt-1">Will update profile name everywhere</p>
              )}
            </div>
          ))}
        </div>

        {saveMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            saveMessage.includes('success')
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {saveMessage}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSaveName}
            disabled={isSaving}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </SettingPanel>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
export function NotificationsTab() {
  const notifGroups = [
    {
      title: 'Scan Notifications',
      icon: Shield,
      items: [
        { label: 'Scan completed', sub: 'Notify when a scan finishes successfully.', email: true, browser: true, slack: false },
        { label: 'Scan failed', sub: 'Notify when a scan encounters an error.', email: true, browser: true, slack: true },
      ],
    },
    {
      title: 'Finding Alerts',
      icon: AlertTriangle,
      items: [
        { label: 'Critical findings', sub: 'Immediate alert for critical severity.', email: true, browser: true, slack: true },
        { label: 'New high findings', sub: 'Alert when new high findings are discovered.', email: true, browser: false, slack: false },
        { label: 'Finding resolved', sub: 'Notify when a finding is marked resolved.', email: false, browser: true, slack: false },
      ],
    },
    {
      title: 'Report Notifications',
      icon: Bell,
      items: [
        { label: 'Report ready', sub: 'Notify when a scheduled report is generated.', email: true, browser: true, slack: false },
        { label: 'Report failed', sub: 'Notify when a report fails to generate.', email: true, browser: false, slack: false },
      ],
    },
  ];

  const [states, setStates] = useState(() =>
    notifGroups.flatMap((g) => g.items).map((item) => ({ ...item }))
  );

  return (
    <div className="space-y-4">
      {notifGroups.map((group, gi) => (
        <SettingPanel key={group.title} title={group.title}>
          <div className="mb-3 grid grid-cols-3 text-right pr-1 gap-4">
            {['Email', 'Browser', 'Slack'].map((h) => (
              <span key={h} className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          {group.items.map((item, ii) => {
            const idx = notifGroups.slice(0, gi).reduce((a, g) => a + g.items.length, 0) + ii;
            const s = states[idx];
            const update = (key: 'email' | 'browser' | 'slack', val: boolean) => {
              setStates((prev) => prev.map((x, i) => i === idx ? { ...x, [key]: val } : x));
            };
            return (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-800/60 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 ml-4">
                  <div className="flex justify-center"><Toggle checked={s.email}   onChange={(v) => update('email', v)}   /></div>
                  <div className="flex justify-center"><Toggle checked={s.browser} onChange={(v) => update('browser', v)} /></div>
                  <div className="flex justify-center"><Toggle checked={s.slack}   onChange={(v) => update('slack', v)}   /></div>
                </div>
              </div>
            );
          })}
        </SettingPanel>
      ))}
    </div>
  );
}
