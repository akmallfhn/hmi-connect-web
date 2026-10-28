import type { SVGProps } from "react";

export default function PrayerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-4.3 -4.3 64.6 64.6" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="56" height="56" rx="15" fill="var(--icon-canvas)" />
      <g transform="translate(2.3 2.8) scale(1.05)">
        <path d="M9 34 H41 L44 41 H6 Z" fill="var(--icon-orange)" />
        <path d="M10.3 35.6 H39.7 L40.4 37 H9.6 Z" fill="var(--icon-page)" opacity="0.7" />
        <path
          d="M14 30.5 Q14 18.5 21 17.5 L23.5 17.5 Q27.5 18 29 24 L31 30 L34.5 30.5 Q37 31 37 33.2 Q37 35.5 34.5 35.5 L16 35.5 Q14 35.5 14 33 Z"
          fill="var(--icon-primary)"
        />
        <path d="M11.5 35.5 Q12.5 32.5 15.5 33 L17 35.5 Z" fill="var(--icon-primary-deep)" />
        <path
          d="M21.5 22 Q24 27.5 27.6 30.3 L32.5 31"
          stroke="var(--icon-page)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23.6" cy="12.6" r="4.2" fill="var(--icon-primary)" />
        <path d="M19.4 11.6 Q19.4 7.4 23.6 7.4 Q27.8 7.4 27.8 11.6 Z" fill="var(--icon-primary-deep)" />
      </g>
    </svg>
  );
}
