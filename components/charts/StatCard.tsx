import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div
        className={`flex size-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm text-[#5f6573]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#172033]">{value}</p>
    </div>
  );
}
