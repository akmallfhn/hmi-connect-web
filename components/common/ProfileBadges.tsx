import type { ReactNode } from "react";
import LogoKahmi from "../svg/LogoKahmi";
import VerifiedBadge from "./VerifiedBadge";

interface ProfileBadgesProps {
  isVerified: boolean;
  isAlumni: boolean;
  size?: number;
  className?: string;
}

const TOOLTIP_ICON_SIZE = 16;

// The name-row badges — each one carries its own desktop hover tooltip, never a shared list.
export default function ProfileBadges({
  isVerified,
  isAlumni,
  size = 20,
  className,
}: ProfileBadgesProps) {
  if (!isVerified && !isAlumni) return null;

  return (
    <span
      className={["inline-flex items-center gap-1", className]
        .filter(Boolean)
        .join(" ")}
    >
      {isVerified && (
        <BadgeWithTooltip
          label="Terverifikasi"
          badge={<VerifiedBadge size={size} />}
          tooltipIcon={<VerifiedBadge size={TOOLTIP_ICON_SIZE} />}
        />
      )}
      {isAlumni && (
        <BadgeWithTooltip
          label="Alumni HMI"
          badge={<KahmiBadge size={size} label="Alumni HMI" />}
          tooltipIcon={<KahmiBadge size={TOOLTIP_ICON_SIZE} />}
        />
      )}
    </span>
  );
}

// lg:-only, because a hover tooltip says nothing on touch.
function BadgeWithTooltip({
  label,
  badge,
  tooltipIcon,
}: {
  label: string;
  badge: ReactNode;
  tooltipIcon: ReactNode;
}) {
  return (
    <span className="group relative inline-flex items-center">
      {badge}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-black/70 px-2.5 py-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 lg:flex"
      >
        {tooltipIcon}
        <span className="text-[13px] font-medium text-white">{label}</span>
      </span>
    </span>
  );
}

// border-radius on an inline <svg> doesn't reliably clip it, so the square emblem gets a real mask.
function KahmiBadge({ size, label }: { size: number; label?: string }) {
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      {...(label ? { role: "img", "aria-label": label } : {})}
    >
      <LogoKahmi width={size} height={size} />
    </span>
  );
}
