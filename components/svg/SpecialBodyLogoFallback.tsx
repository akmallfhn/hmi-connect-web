import type { SVGProps } from "react";
import type { SpecialBodyTypeEnum } from "@/lib/types";
import LogoBpl from "./LogoBpl";
import LogoHmi from "./LogoHmi";
import LogoKohati from "./LogoKohati";

interface SpecialBodyLogoFallbackProps extends SVGProps<SVGSVGElement> {
  type: SpecialBodyTypeEnum;
}

// Shown when a special body has no uploaded logo; Balitbang and LPP have no emblem yet, so they get the HMI one.
export default function SpecialBodyLogoFallback({
  type,
  ...props
}: SpecialBodyLogoFallbackProps) {
  if (type === "kohati") return <LogoKohati {...props} />;
  if (type === "bpl") return <LogoBpl {...props} />;
  return <LogoHmi {...props} />;
}
