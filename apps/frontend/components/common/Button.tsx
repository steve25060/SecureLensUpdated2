import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-300",
        variant === "primary"
          ? "bg-linear-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-900/30 hover:scale-105"
          : "border border-white/10 bg-white/5 text-white hover:border-violet-500 hover:bg-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}
