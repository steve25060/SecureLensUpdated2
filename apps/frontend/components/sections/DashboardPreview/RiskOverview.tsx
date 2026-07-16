"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { riskOverviewData } from "./dashboard-data";

const RADIAN = Math.PI / 180;
type LabelProps = {
  cx: number;
  cy: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: LabelProps) => {
  const safeMidAngle = midAngle ?? 0;
  const safeInnerRadius = innerRadius ?? 0;
  const safeOuterRadius = outerRadius ?? 0;
  const safePercent = percent ?? 0;
  const safeIndex = index ?? 0;
  const radius = safeInnerRadius + (safeOuterRadius - safeInnerRadius) * 0.5;
  const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
  const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#fff" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
      {`${riskOverviewData[safeIndex].name} (${(safePercent * 100).toFixed(0)}%)`}
    </text>
  );
};

export default function RiskOverview() {
  return (
    <motion.div
      className="rounded-2xl border border-white/5 bg-[#111827] p-5"
      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(168,85,247,0.6)" }}
    >
      <h3 className="mb-4 text-sm font-medium text-gray-400">Risk Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={riskOverviewData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            label={renderCustomizedLabel}
            dataKey="value"
          >
            {riskOverviewData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "none" }}
            itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
