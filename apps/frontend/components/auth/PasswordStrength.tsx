"use client";

import { CheckCircle2, Circle } from "lucide-react";

type Props = {
  password: string;
};

const rules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One number", test: (value: string) => /[0-9]/.test(value) },
  { label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function PasswordStrength({ password }: Props) {
  const score = rules.reduce((count, rule) => count + Number(rule.test(password)), 0);
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const widths = ["w-1/4", "w-2/4", "w-3/4", "w-full"];

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/75">Password strength</p>
        <p className="text-xs text-violet-300">{labels[Math.min(score, 3)]}</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-300 ${widths[Math.min(score, 3)]}`}
        />
      </div>

      <div className="space-y-2">
        {rules.map((rule) => {
          const satisfied = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2 text-sm text-white/65">
              {satisfied ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Circle className="h-4 w-4 text-white/25" />
              )}
              <span className={satisfied ? "text-white/80" : ""}>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
