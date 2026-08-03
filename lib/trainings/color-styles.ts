// Shared color palette for the LK2 prototype's icon badges/stat cards — same bg-soft/text pairs components/common/Label.tsx's variants use, just as circles/squares instead of pills.
export type ColorName = "green" | "orange" | "red" | "purple" | "blue" | "yellow" | "pink";

export const COLOR_STYLES: Record<ColorName, { bg: string; text: string }> = {
  green: { bg: "bg-primary-soft", text: "text-primary" },
  orange: { bg: "bg-secondary-soft", text: "text-secondary" },
  red: { bg: "bg-destructive-soft", text: "text-destructive" },
  purple: { bg: "bg-[#EFEDF9]", text: "text-[#42359B]" },
  blue: { bg: "bg-[#E2F0FF]", text: "text-[#164EA6]" },
  yellow: { bg: "bg-[#FFF6E0]", text: "text-[#8A6300]" },
  pink: { bg: "bg-[#FDE7EE]", text: "text-[#BE2B5D]" },
};
