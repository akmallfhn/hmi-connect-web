import { Building2, GraduationCap, Network, Users } from "lucide-react";
import CabangDistributionDonut from "../charts/CabangDistributionDonut";
import KaderGrowthBarChart from "../charts/KaderGrowthBarChart";
import MemberStatusDonut from "../charts/MemberStatusDonut";
import StatCard from "../charts/StatCard";
import TopCabangList from "../charts/TopCabangList";

const STATS = [
  {
    label: "Total Kader Aktif",
    value: "12.847",
    icon: Users,
    iconBg: "bg-primary-soft",
    iconColor: "text-primary",
  },
  {
    label: "Total Cabang",
    value: "186",
    icon: Building2,
    iconBg: "bg-secondary-soft",
    iconColor: "text-secondary",
  },
  {
    label: "Total Komisariat",
    value: "412",
    icon: GraduationCap,
    iconBg: "bg-tertiary/10",
    iconColor: "text-tertiary",
  },
  {
    label: "Total Badko",
    value: "34",
    icon: Network,
    iconBg: "bg-primary-soft",
    iconColor: "text-primary",
  },
];

export default function MasterDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">Dashboard</h1>
      <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
        Ringkasan data keanggotaan dan struktur organisasi HMI.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CabangDistributionDonut />
        <KaderGrowthBarChart />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MemberStatusDonut />
        <TopCabangList />
      </div>
    </div>
  );
}
