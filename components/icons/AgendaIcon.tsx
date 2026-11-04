import type { SVGProps } from "react";

export default function AgendaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="16" y="16" width="208" height="208" rx="56" fill="var(--icon-canvas)" />
      <g transform="rotate(-12 120 120)">
        <path
          d="M50 86a14 14 0 0 1 14-14h112a14 14 0 0 1 14 14v18a16 16 0 0 0 0 32v18a14 14 0 0 1-14 14H64a14 14 0 0 1-14-14v-18a16 16 0 0 0 0-32Z"
          fill="var(--icon-orange)"
        />
        <line
          x1="150"
          y1="84"
          x2="150"
          y2="156"
          stroke="var(--icon-page)"
          strokeWidth={6}
          strokeDasharray="9 11"
          strokeLinecap="round"
        />
        <rect x="74" y="98" width="54" height="12" rx="6" fill="var(--icon-page)" />
        <rect x="74" y="122" width="36" height="12" rx="6" fill="var(--icon-primary)" />
      </g>
    </svg>
  );
}
