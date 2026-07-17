import type { SVGProps } from "react";

interface HomeIconProps extends SVGProps<SVGSVGElement> {
  variant?: "outline" | "bulk";
  primaryColor?: string;
  secondaryColor?: string;
}

export default function HomeIcon({
  variant = "outline",
  primaryColor = "var(--primary)",
  secondaryColor = "color-mix(in srgb, var(--secondary-foreground) 65%, white)",
  ...props
}: HomeIconProps) {
  if (variant === "bulk") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.00598L0.875977 11.538L1.85298 12.677L3.59298 11.186V21.994H20.41V11.188L22.147 12.677L23.124 11.538L12 2.00598Z"
          fill={primaryColor}
        />
        <path d="M12.75 17.1069H11.25V12.1979H12.75V17.1069Z" fill={secondaryColor} />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9997 1.76233L23.1234 11.294L22.1474 12.433L11.9997 3.73769L1.85199 12.433L0.875977 11.294L11.9997 1.76233Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.84277 9.40918V20.5001H19.1603V9.40918H20.6603V22.0001H3.34277V9.40918H4.84277Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.75 11.9548L12.75 16.8632L11.25 16.8632L11.25 11.9548L12.75 11.9548Z"
        fill="currentColor"
      />
    </svg>
  );
}
