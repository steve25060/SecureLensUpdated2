"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import AuthCard from "@/components/auth/AuthCard";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <AuthCard>
      <motion.form className="space-y-6" initial="hidden" animate="show">
        <motion.div variants={fieldVariants} custom={0} className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create Account</h1>
          <p className="max-w-md text-sm leading-6 text-white/55">
            Start securing your applications with a modern security intelligence platform.
          </p>
        </motion.div>

        <div className="grid gap-4">
          <motion.div variants={fieldVariants} custom={1} className="space-y-2">
            <label className="block text-sm font-medium text-white/75" htmlFor="register-name">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Alex Morgan"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={2} className="space-y-2">
            <label className="block text-sm font-medium text-white/75" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={3}>
            <PasswordInput
              label="Password"
              name="register-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={4}>
            <PasswordInput
              label="Confirm Password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={5}>
            <PasswordStrength password={password} />
          </motion.div>

          <motion.div
            variants={fieldVariants}
            custom={6}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="mb-3 text-sm font-medium text-white/75">Password requirements</p>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                "At least 8 characters",
                "One uppercase letter",
                "One number",
                "One special character",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.label variants={fieldVariants} custom={7} className="flex items-start gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={agree}
              onChange={(event) => setAgree(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-violet-500/30"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-violet-300 transition hover:text-violet-200">
                Terms & Conditions
              </Link>
            </span>
          </motion.label>
        </div>

        <motion.button
          variants={fieldVariants}
          custom={8}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(124,58,237,0.28)] transition"
        >
          Create Account
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <motion.div variants={fieldVariants} custom={9} className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.3em] text-white/35">Or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </motion.div>

        <motion.div variants={fieldVariants} custom={10}>
          <SocialLoginButtons />
        </motion.div>

        <motion.p variants={fieldVariants} custom={11} className="text-center text-sm text-white/55">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet-300 transition hover:text-violet-200">
            Sign in
          </Link>
        </motion.p>
      </motion.form>
    </AuthCard>
  );
}
