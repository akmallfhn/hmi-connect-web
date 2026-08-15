import { BadgeCheck, Factory } from "lucide-react";
import type { CoordinatingChapterSummary } from "@/apis/stat";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import StatCard from "../charts/StatCard";
import AdminPageTitle from "../common/AdminPageTitle";

interface CoordinatingChapterDashboardPageProps {
  coordinatingChapterName: string;
  summary: CoordinatingChapterSummary | null;
}

export default function CoordinatingChapterDashboardPage({
  coordinatingChapterName,
  summary,
}: CoordinatingChapterDashboardPageProps) {
  const stats = [
    {
      label: "Kader Terverifikasi",
      value: (summary?.verified_member_count ?? 0).toLocaleString("id-ID"),
      icon: BadgeCheck,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
    {
      label: "Total Komisariat",
      value: (summary?.chapter_count ?? 0).toLocaleString("id-ID"),
      icon: Factory,
      iconBg: "bg-secondary-soft",
      iconColor: "text-secondary",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data Komisariat di bawah Korkom ${coordinatingChapterName}.`}
      >
        Dashboard Korkom
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
