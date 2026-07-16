import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        variant === "secondary"
          ? "bg-slate-100 text-slate-900"
          : variant === "outline"
          ? "border border-slate-200 text-slate-900"
          : "bg-slate-900 text-slate-50"
      } ${className}`}
      {...props}
    />
  )
)
Badge.displayName = "Badge"

export { Badge }
