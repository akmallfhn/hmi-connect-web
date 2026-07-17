import type { SVGProps } from "react";

export default function NewsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="16" y="16" width="208" height="208" rx="56" fill="#DCF0F0" />
      <rect x="76" y="68" width="100" height="112" rx="16" fill="#7FCFD1" />
      <rect x="60" y="60" width="104" height="118" rx="16" fill="#FFFFFF" />
      <rect x="72" y="74" width="80" height="20" rx="7" fill="#FF7A45" />
      <rect x="72" y="104" width="36" height="34" rx="7" fill="#159FA2" />
      <rect x="118" y="106" width="34" height="8" rx="4" fill="#7FCFD1" />
      <rect x="118" y="120" width="34" height="8" rx="4" fill="#7FCFD1" />
      <rect x="118" y="134" width="26" height="8" rx="4" fill="#7FCFD1" />
      <rect x="72" y="150" width="80" height="8" rx="4" fill="#7FCFD1" />
      <rect x="72" y="164" width="56" height="8" rx="4" fill="#7FCFD1" />
    </svg>
  );
}
