"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { motion } from "framer-motion";

import DashboardPreview from "@/components/sections/DashboardPreview/DashboardPreview";
import DashboardWindow from "@/components/sections/DashboardPreview/DashboardWindow";
import Logo from "@/components/layout/Logo";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  showDashboard?: boolean;
};

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function AuthLayout({ children, title, subtitle, showDashboard = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#030614] bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_24%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,24px_24px,24px_24px]">
      <motion.div
        className="mx-auto grid min-h-screen w-full max-w-[1600px] items-center gap-8 px-4 py-8 lg:grid-cols-[45%_55%] lg:px-8"
        initial="hidden"
        animate="show"
        variants={pageVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex min-h-full items-center">
          <div className="mx-auto w-full max-w-xl">
            <Link href="/" className="inline-flex">
              <Logo />
            </Link>
            <h1 className="mt-7 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/60 sm:text-base">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>

        {showDashboard ? (
          <motion.div
            className="relative hidden min-w-0 items-center justify-center overflow-hidden lg:flex"
            initial={{ opacity: 0, x: 36, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-violet-600/20 blur-3xl" />
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto w-full max-w-[850px]"
            >
              <DashboardWindow>
                <DashboardPreview />
              </DashboardWindow>
            </motion.div>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
