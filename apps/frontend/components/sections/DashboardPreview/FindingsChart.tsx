"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { findingsChartData } from "./dashboard-data";

export default function FindingsChart() {
  return (
    <motion.div
      className="rounded-2xl border border-white/5 bg-[#111827] p-5"
      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(168,85,247,0.6)" }}
    >
      <h3 className="mb-4 text-sm font-medium text-gray-400">Findings Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={findingsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis dataKey="name" stroke="#a0aec0" />
          <YAxis stroke="#a0aec0" />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "none" }}
            itemStyle={{ color: "#fff" }}
          />
          <Line type="monotone" dataKey="findings" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
