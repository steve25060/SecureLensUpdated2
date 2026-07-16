"use client";

import { motion } from "framer-motion";
import { activityFeedData } from "./dashboard-data";

export default function ActivityFeed() {
  return (
    <motion.div
      className="rounded-2xl border border-white/5 bg-[#111827] p-5"
      whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(168,85,247,0.6)" }}
    >
      <h3 className="mb-4 text-sm font-medium text-gray-400">Live Activity Feed</h3>
      <ul className="space-y-3">
        {activityFeedData.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: item.color }}>
              <item.icon size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300">{item.description}</p>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
