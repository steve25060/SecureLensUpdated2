'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Scan {
  id: string;
  target?: string;
  startedAt?: string;
  time?: string;
  status: string;
  findingsCount: number;
  score?: number | null;
  type?: string;
}

interface Props {
  scans?: Scan[];
}

function formatTime(scan: Scan): string {
  // prefer human-readable 'time' field if present
  if (scan.time) return scan.time;
  if (!scan.startedAt) return '—';
  // try to parse as ISO date
  try {
    const d = new Date(scan.startedAt);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  } catch {}
  // fallback: return raw value
  return scan.startedAt;
}

const statusClass: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  running:   'bg-yellow-500/20 text-yellow-400',
  RUNNING:   'bg-yellow-500/20 text-yellow-400',
  failed:    'bg-red-500/20 text-red-400',
  FAILED:    'bg-red-500/20 text-red-400',
  pending:   'bg-gray-500/20 text-gray-400',
  PENDING:   'bg-gray-500/20 text-gray-400',
};

const RecentScansTable: React.FC<Props> = ({ scans }) => {
  if (!scans) return <div className="text-gray-400 text-sm">Loading scans…</div>;
  if (scans.length === 0) return <div className="text-gray-400 text-sm">No recent scans.</div>;

  return (
    <motion.div
      className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <table className="min-w-full text-xs divide-y divide-gray-800">
        <thead>
          <tr>
            {['Target', 'Status', 'Score', 'Findings', 'Time'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {scans.map(scan => (
            <tr key={scan.id} className="hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-gray-200 font-medium">{scan.target ?? scan.id}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusClass[scan.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                  {scan.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-300">{scan.score != null ? `${scan.score}/100` : '—'}</td>
              <td className="px-4 py-3 text-gray-300">{scan.findingsCount}</td>
              <td className="px-4 py-3 text-gray-500">{formatTime(scan)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default RecentScansTable;
