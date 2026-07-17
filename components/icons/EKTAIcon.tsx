import type { SVGProps } from "react";

export default function EKTAIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="16" y="16" width="208" height="208" rx="56" fill="#DCF0F0" />
      <rect x="110" y="52" width="20" height="16" rx="5" fill="#0E7C7E" />
      <circle cx="120" cy="60" r="4" fill="#DCF0F0" />
      <rect x="48" y="72" width="144" height="104" rx="18" fill="#FFFFFF" />
      <path
        d="M66 72 H108 V176 H66 A18 18 0 0 1 48 158 V90 A18 18 0 0 1 66 72 Z"
        fill="#FFEBDD"
      />
      <circle cx="78" cy="112" r="15" fill="#FF7A45" />
      <rect x="54" y="134" width="48" height="34" rx="17" fill="#FF7A45" />
      <rect x="122" y="96" width="58" height="11" rx="5" fill="#159FA2" />
      <rect x="122" y="118" width="48" height="9" rx="4" fill="#7FCFD1" />
      <rect x="122" y="134" width="54" height="9" rx="4" fill="#7FCFD1" />
      <rect x="122" y="150" width="40" height="9" rx="4" fill="#7FCFD1" />
    </svg>
  );
}
