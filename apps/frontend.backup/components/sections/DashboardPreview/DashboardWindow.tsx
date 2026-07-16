"use client";
interface DashboardWindowProps {
  children: React.ReactNode;
}

export default function DashboardWindow({
  children,
}: DashboardWindowProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]/90 shadow-2xl shadow-violet-950/20 backdrop-blur-xl lg:rounded-3xl">
      {children}
    </div>
  );
}
