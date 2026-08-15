"use client";

import { GraduationCap, Users } from "lucide-react";
import type {
  ChapterDistribution,
  ChapterStatus,
  MembershipStatus,
  StatSummary,
  UserGrowthEntry,
} from "@/apis/stat";
import { useBranch } from "@/hooks/useBranch";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import StatCard from "../charts/StatCard";
import StatusDonut from "../charts/StatusDonut";
import TopCabangList from "../charts/TopCabangList";
import AdminPageTitle from "../common/AdminPageTitle";

interface BranchDashboardPageProps {
  summary: StatSummary | null;
  chapterDistribution: ChapterDistribution | null;
  userGrowthDay: UserGrowthEntry[];
  userGrowthWeek: UserGrowthEntry[];
  userGrowthMonth: UserGrowthEntry[];
  membershipStatus: MembershipStatus | null;
  chapterStatus: ChapterStatus | null;
}

export default function BranchDashboardPage({
  summary,
  chapterDistribution,
  userGrowthDay,
  userGrowthWeek,
  userGrowthMonth,
  membershipStatus,
  chapterStatus,
}: BranchDashboardPageProps) {
  const { branchName } = useBranch();
  const stats = [
    {
      label: "Total Kader Aktif",
      value: (summary?.total_active_kader ?? 0).toLocaleString("id-ID"),
      icon: Users,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
    {
      label: "Total Komisariat",
      value: (summary?.total_chapter ?? 0).toLocaleString("id-ID"),
      icon: GraduationCap,
      iconBg: "bg-secondary-soft",
      iconColor: "text-secondary",
    },
  ];
  const chapterEntries = (chapterDistribution?.list ?? []).map((entry) => ({
    name: entry.chapter_name,
    value: entry.total,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data kader dan Komisariat di Cabang ${branchName}.`}
      >
        Dashboard Cabang
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CabangDistributionDonut
          entries={chapterEntries}
          totalActiveKader={chapterDistribution?.total_active_kader ?? 0}
          title="Distribusi Kader per Komisariat"
          subtitle="Berdasarkan jumlah kader aktif di setiap Komisariat"
          othersLabel="Komisariat lainnya"
        />
        <KaderGrowthLineChart
          day={userGrowthDay}
          week={userGrowthWeek}
          month={userGrowthMonth}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        <TopCabangList
          entries={chapterEntries}
          title="Komisariat dengan Kader Terbanyak"
          subtitle="Top 5 Komisariat berdasarkan jumlah kader aktif"
        />
        <StatusDonut
          title="Status Verifikasi Kader"
          subtitle="Perbandingan kader yang sudah dan belum verifikasi KTP"
          centerLabel="Terverifikasi"
          segments={[
            {
              name: "Terverifikasi",
              value: membershipStatus?.total_verified ?? 0,
              color: "#0ca30c",
            },
            {
              name: "Belum Verifikasi",
              value: membershipStatus?.total_unverified ?? 0,
              color: "#c3c2b7",
            },
          ]}
        />
        <StatusDonut
          title="Status Komisariat"
          subtitle="Perbandingan Komisariat penuh dan persiapan"
          centerLabel="Penuh"
          segments={[
            {
              name: "Komisariat Penuh",
              value: chapterStatus?.total_full ?? 0,
              color: "#159fa2",
            },
            {
              name: "Komisariat Persiapan",
              value: chapterStatus?.total_provisional ?? 0,
              color: "#c3c2b7",
            },
          ]}
        />
      </div>
    </div>
  );
}
