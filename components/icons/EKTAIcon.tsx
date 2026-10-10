import type { SVGProps } from "react";

export default function EKTAIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="16" y="16" width="208" height="208" rx="56" fill="var(--icon-canvas)" />
      <rect x="110" y="52" width="20" height="16" rx="5" fill="var(--icon-primary-deep)" />
      <circle cx="120" cy="60" r="4" fill="var(--icon-canvas)" />
      <rect x="48" y="72" width="144" height="104" rx="18" fill="var(--icon-page)" />
      <path
        d="M66 72 H108 V176 H66 A18 18 0 0 1 48 158 V90 A18 18 0 0 1 66 72 Z"
        fill="var(--icon-orange-light)"
      />
      <circle cx="78" cy="112" r="15" fill="var(--icon-orange)" />
      <rect x="54" y="134" width="48" height="34" rx="17" fill="var(--icon-orange)" />
      <rect x="122" y="96" width="58" height="11" rx="5" fill="var(--icon-primary)" />
      <rect x="122" y="118" width="48" height="9" rx="4" fill="var(--icon-primary-light)" />
      <rect x="122" y="134" width="54" height="9" rx="4" fill="var(--icon-primary-light)" />
      <rect x="122" y="150" width="40" height="9" rx="4" fill="var(--icon-primary-light)" />
    </svg>
  );
}
