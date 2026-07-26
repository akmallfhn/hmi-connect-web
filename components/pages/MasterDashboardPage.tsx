import { Building2, GraduationCap, Network, Users } from "lucide-react";
import type {
  BranchDistribution,
  BranchStatus,
  CoordinatingBodyStatus,
  MembershipStatus,
  StatSummary,
  UserGrowthEntry,
} from "@/apis/stat";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import StatCard from "../charts/StatCard";
import StatusDonut from "../charts/StatusDonut";
import TopCabangList from "../charts/TopCabangList";

interface MasterDashboardPageProps {
  summary: StatSummary | null;
  branchDistribution: BranchDistribution | null;
  userGrowthDay: UserGrowthEntry[];
  userGrowthWeek: UserGrowthEntry[];
  userGrowthMonth: UserGrowthEntry[];
  membershipStatus: MembershipStatus | null;
  branchStatus: BranchStatus | null;
  coordinatingBodyStatus: CoordinatingBodyStatus | null;
}

export default function MasterDashboardPage({
  summary,
  branchDistribution,
  userGrowthDay,
  userGrowthWeek,
  userGrowthMonth,
  membershipStatus,
  branchStatus,
  coordinatingBodyStatus,
}: MasterDashboardPageProps) {
  const stats = [
    {
      label: "Total Kader Aktif",
      value: (summary?.total_active_kader ?? 0).toLocaleString("id-ID"),
      icon: Users,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
    {
      label: "Total Cabang",
      value: (summary?.total_branch ?? 0).toLocaleString("id-ID"),
      icon: Building2,
      iconBg: "bg-secondary-soft",
      iconColor: "text-secondary",
    },
    {
      label: "Total Komisariat",
      value: (summary?.total_chapter ?? 0).toLocaleString("id-ID"),
      icon: GraduationCap,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
    {
      label: "Total Badko",
      value: (summary?.total_coordinating_body ?? 0).toLocaleString("id-ID"),
      icon: Network,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
  ];

  const branchEntries = (branchDistribution?.list ?? []).map((entry) => ({
    name: `Cabang ${entry.branch_name}`,
    value: entry.total,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">Dashboard</h1>
      <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
        Ringkasan data keanggotaan dan struktur organisasi HMI.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CabangDistributionDonut
          entries={branchEntries}
          totalActiveKader={branchDistribution?.total_active_kader ?? 0}
        />
        <KaderGrowthLineChart
          day={userGrowthDay}
          week={userGrowthWeek}
          month={userGrowthMonth}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopCabangList entries={branchEntries} />
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
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatusDonut
          title="Status Cabang"
          subtitle="Perbandingan Cabang penuh dan persiapan"
          centerLabel="Penuh"
          segments={[
            {
              name: "Cabang Penuh",
              value: branchStatus?.total_full ?? 0,
              color: "#159fa2",
            },
            {
              name: "Cabang Persiapan",
              value: branchStatus?.total_provisional ?? 0,
              color: "#c3c2b7",
            },
          ]}
        />
        <StatusDonut
          title="Status Badko"
          subtitle="Perbandingan Badko aktif dan tidak aktif"
          centerLabel="Aktif"
          segments={[
            {
              name: "Aktif",
              value: coordinatingBodyStatus?.total_active ?? 0,
              color: "#0ca30c",
            },
            {
              name: "Tidak Aktif",
              value: coordinatingBodyStatus?.total_inactive ?? 0,
              color: "#c3c2b7",
            },
          ]}
        />
      </div>
    </div>
  );
}
