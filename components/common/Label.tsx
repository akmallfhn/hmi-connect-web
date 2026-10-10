import { ReactNode } from "react";

// Color-variant pill, same idea as sevenpreneur's AppBasedLabel — domain labels map onto this instead of hardcoding colors.
export type LabelVariant =
  "green" | "orange" | "red" | "purple" | "blue" | "yellow" | "gray" | "pink";

const VARIANT_CLASSNAME: Record<LabelVariant, string> = {
  green: "border-primary-soft-fg/30 bg-primary-soft-bg text-primary-soft-fg",
  orange: "border-secondary-soft-fg/30 bg-secondary-soft-bg text-secondary-soft-fg",
  red: "border-destructive-soft-fg/30 bg-destructive-soft-bg text-destructive-soft-fg",
  purple: "border-purple-soft-fg/30 bg-purple-soft-bg text-purple-soft-fg",
  blue: "border-info-soft-fg/30 bg-info-soft-bg text-info-soft-fg",
  yellow: "border-warning-soft-fg/30 bg-warning-soft-bg text-warning-soft-fg",
  gray: "border-muted-foreground/30 bg-surface-muted text-muted-foreground",
  pink: "border-pink-soft-fg/30 bg-pink-soft-bg text-pink-soft-fg",
};

export type LabelSize = "default" | "sm";

const SIZE_CLASSNAME: Record<LabelSize, string> = {
  default: "px-2.5 py-1 text-xs",
  sm: "px-2 py-0.5 text-[11px]",
};

interface LabelProps {
  variant: LabelVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: LabelSize;
}

export default function Label({
  variant,
  icon,
  children,
  className,
  size = "default",
}: LabelProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center gap-1 truncate rounded-full border font-semibold shrink-0",
        SIZE_CLASSNAME[size],
        VARIANT_CLASSNAME[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon}
      {children}
    </span>
  );
}
