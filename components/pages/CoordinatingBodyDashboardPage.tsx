import { BadgeCheck, Building2, Factory, Network } from "lucide-react";
import type {
  BranchMapEntry,
  CoordinatingBodySummary,
} from "@/apis/stat";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import IndonesiaBranchMap from "../charts/IndonesiaBranchMap";
import StatCard from "../charts/StatCard";
import AdminPageTitle from "../common/AdminPageTitle";

interface CoordinatingBodyDashboardPageProps {
  coordinatingBodyId: string;
  coordinatingBodyName: string;
  summary: CoordinatingBodySummary | null;
  branchMapEntries: BranchMapEntry[];
}

export default function CoordinatingBodyDashboardPage({
  coordinatingBodyId,
  coordinatingBodyName,
  summary,
  branchMapEntries,
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
    </div>
  );
}
