'use client';

import React from 'react';
import { ChevronDown, Save } from 'lucide-react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}
export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );
}

interface SelectProps { value: string; options: string[]; onChange: (v: string) => void; }
export function Select({ value, options, onChange }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-gray-800 border border-gray-700 text-sm text-white rounded-lg px-3 py-2 pr-8 outline-none focus:border-violet-500 transition-colors"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

interface RowProps { label: string; sub: string; children: React.ReactNode; }
export function SettingRow({ label, sub, children }: RowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-800/60 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  );
}

interface PanelProps { title: string; children: React.ReactNode; onSave?: () => void; }
export function SettingPanel({ title, children, onSave }: PanelProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-colors"
          >
            <Save size={12} /> Save Changes
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
