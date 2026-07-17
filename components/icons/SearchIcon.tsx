import type { SVGProps } from "react";

interface SearchIconProps extends SVGProps<SVGSVGElement> {
  variant?: "outline" | "bulk";
  primaryColor?: string;
  secondaryColor?: string;
}

export default function SearchIcon({
  variant = "outline",
  primaryColor = "var(--primary)",
  secondaryColor = "color-mix(in srgb, var(--secondary-foreground) 65%, white)",
  ...props
}: SearchIconProps) {
  if (variant === "bulk") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.791 3.54272C6.9037 3.54272 3.75244 6.69398 3.75244 10.5813C3.75244 14.4685 6.9037 17.6198 10.791 17.6198C14.6783 17.6198 17.8295 14.4685 17.8295 10.5813C17.8295 6.69398 14.6783 3.54272 10.791 3.54272ZM1.75244 10.5813C1.75244 5.58942 5.79913 1.54272 10.791 1.54272C15.7828 1.54272 19.8295 5.58942 19.8295 10.5813C19.8295 15.5731 15.7828 19.6198 10.791 19.6198C5.79913 19.6198 1.75244 15.5731 1.75244 10.5813Z"
          fill={primaryColor}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.2781 15.0872L22.2476 21.0412L20.8353 22.4572L14.8657 16.5032L16.2781 15.0872Z"
          fill={secondaryColor}
        />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.9985 3.50024C6.97315 3.50024 3.70996 6.76343 3.70996 10.7888C3.70996 14.8141 6.97315 18.0773 10.9985 18.0773C15.0238 18.0773 18.287 14.8141 18.287 10.7888C18.287 6.76343 15.0238 3.50024 10.9985 3.50024ZM2.20996 10.7888C2.20996 5.93501 6.14472 2.00024 10.9985 2.00024C15.8523 2.00024 19.787 5.93501 19.787 10.7888C19.787 15.6426 15.8523 19.5773 10.9985 19.5773C6.14472 19.5773 2.20996 15.6426 2.20996 10.7888Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.486 15.6477L22.1016 21.2486L21.0423 22.3107L15.4268 16.7097L16.486 15.6477Z"
        fill="currentColor"
      />
    </svg>
  );
}
