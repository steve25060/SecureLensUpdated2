"use client";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3">
      <div>
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-400">
          Security Overview
        </p>
      </div>
    </header>
  );
}
