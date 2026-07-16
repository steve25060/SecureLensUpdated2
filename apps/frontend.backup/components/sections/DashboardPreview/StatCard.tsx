"use client";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color: string;
  icon: LucideIcon;
}

const colors = {
  green: "bg-green-500/15 text-green-400",
  red: "bg-red-500/15 text-red-400",
  blue: "bg-sky-500/15 text-sky-400",
  purple: "bg-violet-500/15 text-violet-400",
};
export default function StatCard({
  title,
  value,
  change,
  color,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111827] p-3 transition-all duration-300 hover:border-violet-500/30 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div
          className={`rounded-lg p-2 ${
            colors[color as keyof typeof colors]
          }`}
        >
          <Icon size={16} />
        </div>

        <span className="text-xs text-green-400">
          {change}
        </span>
      </div>

      <h4 className="mt-3 text-xs text-gray-400">
        {title}
      </h4>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}
