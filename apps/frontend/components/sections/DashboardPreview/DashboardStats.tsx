"use client";
import { dashboardStats } from "./dashboard-data";
import StatCard from "./StatCard";

export default function DashboardStats() {
  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {dashboardStats.slice(0, 4).map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </section>
  );
}
