import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export default function VerifiedBadge({ size = 20, className }: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      size={size}
      strokeWidth={2.5}
      aria-label="Terverifikasi"
      className={[
        "shrink-0 fill-[#3897f0] stroke-[#3897f0]",
        "[&>path:last-child]:fill-none [&>path:last-child]:stroke-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
