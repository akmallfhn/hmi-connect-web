import { ReactNode } from "react";

// Color-variant pill, same idea as sevenpreneur's AppBasedLabel — domain labels map onto this instead of hardcoding colors.
export type LabelVariant =
  | "green"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "yellow"
  | "gray"
  | "pink";

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

interface LabelProps {
  variant: LabelVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Label({ variant, icon, children, className }: LabelProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center gap-1 truncate rounded-full border px-2.5 py-1 text-xs font-semibold",
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
