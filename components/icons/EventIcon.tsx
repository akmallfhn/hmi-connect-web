import type { SVGProps } from "react";

export default function EventIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="16" y="16" width="208" height="208" rx="56" fill="#DCF0F0" />
      <rect x="86" y="54" width="11" height="30" rx="5" fill="#0E7C7E" />
      <rect x="143" y="54" width="11" height="30" rx="5" fill="#0E7C7E" />
      <rect x="56" y="66" width="128" height="44" rx="18" fill="#FF7A45" />
      <rect x="56" y="94" width="128" height="90" rx="18" fill="#FFFFFF" />
      <path
        d="M120 112 L128.2 132.7 L150.4 134.1 L133.3 148.3 L138.8 169.9 L120 158 L101.2 169.9 L106.7 148.3 L89.6 134.1 L111.8 132.7 Z"
        fill="#159FA2"
        stroke="#159FA2"
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
