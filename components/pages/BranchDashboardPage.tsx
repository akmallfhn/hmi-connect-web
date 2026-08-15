"use client";

import { BadgeCheck, Clock3, Factory, Percent } from "lucide-react";
import type {
  BranchSummary,
  ChapterDistribution,
  ChapterStatus,
  MembershipStatus,
  UserGrowthEntry,
} from "@/apis/stat";
import { useBranch } from "@/hooks/useBranch";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import StatCard from "../charts/StatCard";
import StatusDonut from "../charts/StatusDonut";
import AdminPageTitle from "../common/AdminPageTitle";

interface BranchDashboardPageProps {
  summary: BranchSummary | null;
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
    {
      label: "Permintaan Verifikasi",
      value: (summary?.pending_verification_request_count ?? 0).toLocaleString(
        "id-ID"
      ),
      icon: Clock3,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
    {
      label: "Persentase Terverifikasi",
      value: `${(summary?.verified_member_percentage ?? 0).toLocaleString(
        "id-ID",
        { maximumFractionDigits: 2 }
      )}%`,
      icon: Percent,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatusDonut
          title="Status Verifikasi Kader"
          subtitle="Perbandingan kader yang sudah dan belum verifikasi KTP"
          centerLabel="Terverifikasi"
          segments={[
            {
              name: "Terverifikasi",
              value: membershipStatus?.total_verified ?? 0,
              color: "#1baf7a",
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
              color: "#eda100",
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
