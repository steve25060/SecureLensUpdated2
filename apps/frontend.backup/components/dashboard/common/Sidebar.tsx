'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Radio,
  GitBranch,
  ShieldAlert,
  FileText,
  Sparkles,
  BarChart2,
  Settings,
  Bell,
  Menu,
  X,
  Zap,
  Clock,
} from 'lucide-react';

/* ── Navigation items ──────────────────────────────────────────── */
const NAV_ITEMS = [
  { name: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard },
  { name: 'Workspaces',  href: '/dashboard/workspaces',   icon: Briefcase },
  { name: 'Live Scan',   href: '/dashboard/live-scan',    icon: Radio },
  { name: 'GitHub Scan', href: '/dashboard/github-scan',  icon: GitBranch },
  { name: 'Findings',    href: '/dashboard/findings',     icon: ShieldAlert },
  { name: 'Reports',     href: '/dashboard/reports',      icon: FileText },
  { name: 'AI Copilot',  href: '/dashboard/ai-copilot',   icon: Sparkles },
  { name: 'Analytics',   href: '/dashboard/analytics',    icon: BarChart2 },
  { name: 'Settings',    href: '/dashboard/settings',     icon: Settings },
] as const;

const RECENT_WORKSPACES = [
  { id: 1, name: 'api-gateway-prod',   time: '2h ago' },
  { id: 2, name: 'frontend-app',       time: '5h ago' },
  { id: 3, name: 'auth-service',       time: '1d ago' },
  { id: 4, name: 'data-pipeline',      time: '2d ago' },
];

const NOTIFICATION_COUNT = 3;

/* ── Sub-components ─────────────────────────────────────────────── */
interface NavLinksProps {
  pathname: string;
  onClose?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ pathname, onClose }) => (
  <nav className="mt-2 space-y-0.5 px-2" aria-label="Main navigation">
    {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
      const isActive =
        href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(href);
      return (
        <Link
          key={name}
          href={href}
          onClick={onClose}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 relative
            ${
              isActive
                ? 'bg-violet-600/20 text-violet-400 border-r-2 border-violet-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }
          `}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon
            size={16}
            className={isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'}
          />
          {name}
        </Link>
      );
    })}

    {/* Notifications with badge */}
    <button
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150"
      aria-label={`Notifications – ${NOTIFICATION_COUNT} unread`}
    >
      <span className="flex items-center gap-3">
        <Bell size={16} className="text-gray-500" />
        Notifications
      </span>
      {NOTIFICATION_COUNT > 0 && (
        <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
          {NOTIFICATION_COUNT}
        </span>
      )}
    </button>
  </nav>
);

/* ── Main sidebar content ───────────────────────────────────────── */
const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-800 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="text-base font-bold text-white tracking-tight hover:opacity-80 transition-opacity"
        >
          Secure<span className="text-violet-400">Lens</span>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        <NavLinks pathname={pathname} onClose={onClose} />

        {/* Recent workspaces */}
        <div className="px-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-2 flex items-center gap-1.5">
            <Clock size={10} />
            Recent Workspaces
          </p>
          <ul className="space-y-0.5">
            {RECENT_WORKSPACES.map((ws) => (
              <li key={ws.id}>
                <Link
                  href={`/dashboard/workspaces`}
                  onClick={onClose}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-gray-400
                             hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="truncate max-w-[110px]">{ws.name}</span>
                  <span className="text-gray-600 shrink-0 ml-1">{ws.time}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade card */}
      <div className="px-3 pb-4 shrink-0">
        <div className="bg-violet-600/10 border border-violet-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={14} className="text-violet-400" />
            <p className="text-xs font-semibold text-white">Upgrade to Pro</p>
          </div>
          <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
            Unlock AI-powered scans, unlimited workspaces, and team collaboration.
          </p>
          <button className="w-full py-1.5 text-xs font-semibold rounded-lg bg-violet-600 text-white
                             hover:bg-violet-500 active:bg-violet-700 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Root component ─────────────────────────────────────────────── */
const Sidebar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 border border-gray-800 text-violet-400"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-800 shrink-0 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-60 bg-gray-900 border-r border-gray-800 z-50 flex flex-col
          md:hidden transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Mobile navigation"
      >
        {/* Close button inside drawer */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
};

export default Sidebar;
