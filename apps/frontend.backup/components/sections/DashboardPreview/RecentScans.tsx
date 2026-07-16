"use client";
import { motion } from "framer-motion";
import { recentScansData } from "./dashboard-data";

export default function RecentScans() {
  return (
    <motion.div
      className="rounded-2xl border border-white/5 bg-[#111827] p-5"
      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(168,85,247,0.6)" }}
    >
      <h3 className="mb-4 text-sm font-medium text-gray-400">Recent Scans</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left text-sm text-gray-300">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-2 py-1">Target</th>
              <th className="px-2 py-1">Scan Type</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Score</th>
              <th className="px-2 py-1">Severity</th>
              <th className="px-2 py-1">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentScansData.map((scan, idx) => (
              <tr key={idx} className="border-b border-white/5">
                <td className="px-2 py-1">{scan.target}</td>
                <td className="px-2 py-1">{scan.scanType}</td>
                <td className="px-2 py-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      scan.status === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : scan.status === "Running"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {scan.status}
                  </span>
                </td>
                <td className="px-2 py-1">{scan.securityScore}%</td>
                <td className="px-2 py-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      scan.severity === "Critical"
                        ? "bg-red-500/20 text-red-400"
                        : scan.severity === "High"
                        ? "bg-orange-500/20 text-orange-400"
                        : scan.severity === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {scan.severity}
                  </span>
                </td>
                <td className="px-2 py-1 text-xs text-gray-500">{scan.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
