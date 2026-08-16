import { BadgeCheck, Building2, Factory, Network } from "lucide-react";
import type {
  BranchDistribution,
  BranchMapEntry,
  BranchStatus,
  ChapterStatus,
  CoordinatingBodySummary,
  TrainingPriorities,
  UserGrowthEntry,
} from "@/apis/stat";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import IndonesiaBranchMap from "../charts/IndonesiaBranchMap";
import KaderGrowthLineChart from "../charts/KaderGrowthLineChart";
import StatCard from "../charts/StatCard";
import StatusDonut from "../charts/StatusDonut";
import TrainingPriorityList from "../charts/TrainingPriorityList";
import AdminPageTitle from "../common/AdminPageTitle";

interface CoordinatingBodyDashboardPageProps {
  coordinatingBodyId: string;
  coordinatingBodyName: string;
  summary: CoordinatingBodySummary | null;
  branchMapEntries: BranchMapEntry[];
  branchDistribution: BranchDistribution | null;
  userGrowthDay: UserGrowthEntry[];
  userGrowthWeek: UserGrowthEntry[];
  userGrowthMonth: UserGrowthEntry[];
  branchStatus: BranchStatus | null;
  chapterStatus: ChapterStatus | null;
  trainingPriorities: TrainingPriorities | null;
}

export default function CoordinatingBodyDashboardPage({
  coordinatingBodyId,
  coordinatingBodyName,
  summary,
  branchMapEntries,
  branchDistribution,
  userGrowthDay,
  userGrowthWeek,
  userGrowthMonth,
  branchStatus,
  chapterStatus,
  trainingPriorities,
}: CoordinatingBodyDashboardPageProps) {
  const stats = [
    {
      label: "Kader Terverifikasi",
      value: (summary?.verified_member_count ?? 0).toLocaleString("id-ID"),
      icon: BadgeCheck,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
    {
      label: "Total Cabang",
      value: (summary?.branch_count ?? 0).toLocaleString("id-ID"),
      icon: Building2,
      iconBg: "bg-secondary-soft",
      iconColor: "text-secondary",
    },
    {
      label: "Total Korkom",
      value: (summary?.coordinating_chapter_count ?? 0).toLocaleString("id-ID"),
      icon: Network,
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
    {
      label: "Total Komisariat",
      value: (summary?.chapter_count ?? 0).toLocaleString("id-ID"),
      icon: Factory,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
    },
  ];
  const branchEntries = (branchDistribution?.list ?? []).map((entry) => ({
    name: entry.branch_name,
    value: entry.total,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle
        description={`Ringkasan data Cabang di bawah Badko ${coordinatingBodyName}.`}
      >
        Dashboard Badko
      </AdminPageTitle>

      <div className="mt-6">
        <AdminDashboardBanner />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-4">
        <IndonesiaBranchMap
          initialBranches={branchMapEntries}
          coordinatingBodyId={coordinatingBodyId}
        />
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

      <div className="mt-4">
        <TrainingPriorityList
          entity="branch"
          initialData={trainingPriorities}
          coordinatingBodyId={coordinatingBodyId}
        />
      </div>
    </div>
  );
}
