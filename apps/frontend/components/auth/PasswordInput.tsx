"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
};

export default function PasswordInput({ label, name, value, onChange, required = false, placeholder }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/75" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-11 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-white/60 transition hover:text-white"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
