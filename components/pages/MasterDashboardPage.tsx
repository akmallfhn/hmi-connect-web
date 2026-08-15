import { Building2, GraduationCap, Network, Users } from "lucide-react";
import AdminPageTitle from "../common/AdminPageTitle";
import type {
  BranchDistribution,
  BranchMapEntry,
  BranchStatus,
  ChapterStatus,
  StatSummary,
  UserGrowthEntry,
} from "@/apis/stat";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import IndonesiaBranchMap from "../charts/IndonesiaBranchMap";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import MasterAttentionLists from "../charts/MasterAttentionLists";
import StatCard from "../charts/StatCard";
import StatusDonut from "../charts/StatusDonut";

interface MasterDashboardPageProps {
  summary: StatSummary | null;
  branchDistribution: BranchDistribution | null;
  userGrowthDay: UserGrowthEntry[];
  userGrowthWeek: UserGrowthEntry[];
  userGrowthMonth: UserGrowthEntry[];
  branchStatus: BranchStatus | null;
  chapterStatus: ChapterStatus | null;
  branchMapEntries?: BranchMapEntry[];
  showBanner?: boolean;
  showIndonesiaMap?: boolean;
  showAttentionLists?: boolean;
}

export default function MasterDashboardPage({
  summary,
  branchDistribution,
  userGrowthDay,
  userGrowthWeek,
  userGrowthMonth,
  branchStatus,
  chapterStatus,
  branchMapEntries = [],
  showBanner = false,
  showIndonesiaMap = false,
  showAttentionLists = false,
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
      <AdminPageTitle description="Ringkasan data keanggotaan dan struktur organisasi HMI.">
        Dashboard
      </AdminPageTitle>

      {showBanner && (
        <div className="mt-6">
          <AdminDashboardBanner />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {showIndonesiaMap && (
        <div className="mt-4">
          <IndonesiaBranchMap initialBranches={branchMapEntries} />
        </div>
      )}

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

      {showAttentionLists && (
        <div className="mt-6">
          <MasterAttentionLists />
        </div>
      )}
    </div>
  );
}
