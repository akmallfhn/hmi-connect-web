import { BadgeCheck, TrendingUp, UserPlus } from "lucide-react";
import type { ChapterSummary, UserGrowthEntry } from "@/apis/stat";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import StatCard from "../charts/StatCard";
import AdminPageTitle from "../common/AdminPageTitle";

interface ChapterDashboardPageProps {
  chapterName: string;
  summary: ChapterSummary | null;
  userGrowthDay: UserGrowthEntry[];
  userGrowthWeek: UserGrowthEntry[];
  userGrowthMonth: UserGrowthEntry[];
}

export default function ChapterDashboardPage({
  chapterName,
  summary,
  userGrowthDay,
  userGrowthWeek,
  userGrowthMonth,
}: ChapterDashboardPageProps) {
  const stats = [
    {
      label: "Kader Terverifikasi",
      value: (summary?.verified_member_count ?? 0).toLocaleString("id-ID"),
      icon: BadgeCheck,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
    {
      label: "Pertumbuhan Kader 1 Bulan",
      value: `${(
        summary?.member_growth_percentage_last_month ?? 0
      ).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`,
      icon: TrendingUp,
      iconBg: "bg-secondary-soft",
      iconColor: "text-secondary",
    },
    {
      label: "Kader Baru 1 Bulan",
      value: (summary?.new_member_count_last_month ?? 0).toLocaleString(
        "id-ID"
      ),
      icon: UserPlus,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data kader di Komisariat ${chapterName}.`}
      >
        Dashboard Komisariat
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-4">
        <KaderGrowthLineChart
          day={userGrowthDay}
          week={userGrowthWeek}
          month={userGrowthMonth}
        />
      </div>
    </div>
  );
}
