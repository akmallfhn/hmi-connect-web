import type { ReactNode } from "react";

interface MetaPillProps {
  icon: ReactNode;
  label: string;
}

export default function MetaPill({ icon, label }: MetaPillProps) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-secondary-foreground">
      {icon}
      {label}
    </span>
  );
}
