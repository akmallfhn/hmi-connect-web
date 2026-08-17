import { ReactNode } from "react";

// Color-variant pill, same idea as sevenpreneur's AppBasedLabel — domain labels map onto this instead of hardcoding colors.
export type LabelVariant =
  "green" | "orange" | "red" | "purple" | "blue" | "yellow" | "gray" | "pink";

const VARIANT_CLASSNAME: Record<LabelVariant, string> = {
  // This app's own brand tokens (see app/globals.css) already read as "green"/"orange"/"red".
  green: "border-primary/30 bg-primary-soft text-primary",
  orange: "border-secondary/30 bg-secondary-soft text-secondary",
  red: "border-destructive/30 bg-destructive-soft text-destructive",
  // No design tokens for these yet — hardcoded tints, same approach AppBasedLabel uses.
  purple: "border-[#A19ACD] bg-[#EFEDF9] text-[#42359B]",
  blue: "border-[#8BA7D3] bg-[#E2F0FF] text-[#164EA6]",
  yellow: "border-[#ECCF80] bg-[#FFF6E0] text-[#8A6300]",
  gray: "border-[#dbe3ef] bg-[#f5f7fb] text-[#41474E]",
  pink: "border-[#F3A6BC] bg-[#FDE7EE] text-[#BE2B5D]",
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
