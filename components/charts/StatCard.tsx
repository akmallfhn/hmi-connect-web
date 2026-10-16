import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  // The list page behind this number, in the same admin scope; omitted when there is none.
  href?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  href,
}: StatCardProps) {
  const body = (
    <>
      <div
        className={`flex size-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
    </>
  );

  if (!href) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {body}
    </Link>
  );
}
