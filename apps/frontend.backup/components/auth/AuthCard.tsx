"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

type AuthCardProps = {
  children: ReactNode;
};

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ borderColor: "rgba(168,85,247,0.22)" }}
    >
      {children}
    </motion.div>
  );
}
