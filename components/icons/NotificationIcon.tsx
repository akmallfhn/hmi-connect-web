import type { SVGProps } from "react";

interface NotificationIconProps extends SVGProps<SVGSVGElement> {
  variant?: "outline" | "bulk";
  primaryColor?: string;
  secondaryColor?: string;
}

export default function NotificationIcon({
  variant = "outline",
  primaryColor = "var(--primary)",
  secondaryColor = "color-mix(in srgb, var(--secondary-foreground) 65%, white)",
  ...props
}: NotificationIconProps) {
  if (variant === "bulk") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          d="M18.6875 13.304L20.5195 18.232H3.48047L5.31247 13.304V8.813C5.31247 5.125 8.31247 2.125 12.0005 2.125C15.6875 2.125 18.6875 5.125 18.6875 8.813V13.304Z"
          fill={primaryColor}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.8898 18.2319H14.3898C14.2518 19.4349 13.2398 20.3749 12.0018 20.3749C10.7628 20.3749 9.75079 19.4349 9.61279 18.2319H8.11279C8.25579 20.2619 9.93579 21.8749 12.0018 21.8749C14.0668 21.8749 15.7468 20.2619 15.8898 18.2319Z"
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
        d="M5.06164 8.93778C5.06164 5.10615 8.16779 2 11.9994 2C15.831 2 18.9372 5.10615 18.9372 8.93777V13.3835L20.8787 18.6072H3.12012L5.06164 13.3835V8.93778ZM11.9994 3.5C8.99621 3.5 6.56164 5.93458 6.56164 8.93778V13.6532L5.27788 17.1072H18.7209L17.4372 13.6532V8.93777C17.4372 5.93457 15.0026 3.5 11.9994 3.5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.08398 18.0834V17.8574H9.58398V18.0834C9.58398 19.4181 10.666 20.5001 12.0007 20.5001C13.3353 20.5001 14.4173 19.4181 14.4173 18.0834V17.8574H15.9173V18.0834C15.9173 20.2465 14.1638 22.0001 12.0007 22.0001C9.83754 22.0001 8.08398 20.2465 8.08398 18.0834Z"
        fill="currentColor"
      />
    </svg>
  );
}
