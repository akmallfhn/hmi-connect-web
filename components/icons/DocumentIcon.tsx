import type { SVGProps } from "react";

export default function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-4.3 -4.3 64.6 64.6" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="56" height="56" rx="15" fill="var(--icon-canvas)" />
      <rect x="16" y="16" width="11" height="24" rx="2.5" fill="var(--icon-primary)" />
      <rect x="19" y="20" width="5" height="9" rx="1.2" fill="var(--icon-page)" />
      <circle cx="21.5" cy="34" r="1.8" fill="var(--icon-page)" />
      <rect x="29" y="12" width="11" height="28" rx="2.5" fill="var(--icon-orange)" />
      <rect x="32" y="16" width="5" height="10" rx="1.2" fill="var(--icon-page)" />
      <circle cx="34.5" cy="34" r="1.8" fill="var(--icon-page)" />
      <rect x="12" y="40" width="32" height="4" rx="2" fill="var(--icon-primary-deep)" />
    </svg>
  );
}
