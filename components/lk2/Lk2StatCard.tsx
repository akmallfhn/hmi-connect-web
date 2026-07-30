import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { COLOR_STYLES, type ColorName } from "./colorStyles";

interface Lk2StatCardProps {
  icon: LucideIcon;
  color: ColorName;
  label: string;
  value: ReactNode;
  hint?: string;
}

export default function Lk2StatCard({ icon: Icon, color, label, value, hint }: Lk2StatCardProps) {
  const style = COLOR_STYLES[color];
  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
          <Icon className={`size-5 ${style.text}`} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-[#5f6573]">{label}</p>
          <p className="truncate text-xl font-bold text-[#172033]">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-[#5f6573]">{hint}</p>}
    </div>
  );
}
