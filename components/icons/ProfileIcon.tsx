import type { SVGProps } from "react";

interface ProfileIconProps extends SVGProps<SVGSVGElement> {
  variant?: "outline" | "bulk";
  primaryColor?: string;
  secondaryColor?: string;
}

export default function ProfileIcon({
  variant = "outline",
  primaryColor = "var(--primary)",
  secondaryColor = "color-mix(in srgb, var(--secondary-foreground) 65%, white)",
  ...props
}: ProfileIconProps) {
  if (variant === "bulk") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 12.1089C14.723 12.1089 16.939 9.89393 16.939 7.17093C16.939 4.44693 14.723 2.23193 12 2.23193C9.27701 2.23193 7.06201 4.44693 7.06201 7.17093C7.06201 9.89393 9.27701 12.1089 12 12.1089Z"
          fill={secondaryColor}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.5193 19.3911C18.5033 16.1781 15.7733 14.3371 12.0263 14.3371H11.9993C8.2423 14.3161 5.4983 16.1701 4.4803 19.3911L4.3623 19.7651L4.6963 19.9691C6.6543 21.1631 9.0963 21.7681 11.9523 21.7681C11.9843 21.7681 12.0163 21.7681 12.0473 21.7681C14.9433 21.7681 17.3173 21.1791 19.3033 19.9691L19.6373 19.7651L19.5193 19.3911Z"
          fill={primaryColor}
        />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.966 3.5C9.9384 3.5 8.29492 5.14275 8.29492 7.16973C8.29492 9.19672 9.9384 10.8395 11.966 10.8395C13.9921 10.8395 15.6357 9.19686 15.6357 7.16973C15.6357 5.1426 13.9921 3.5 11.966 3.5ZM6.79492 7.16973C6.79492 4.31374 9.11055 2 11.966 2C14.8202 2 17.1357 4.31389 17.1357 7.16973C17.1357 10.0256 14.8202 12.3395 11.966 12.3395C9.11055 12.3395 6.79492 10.0257 6.79492 7.16973Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.87869 19.185C7.66266 20.1222 9.73916 20.5057 11.9979 20.5001H12.0015C14.2602 20.5057 16.3367 20.1222 18.1206 19.185C17.0962 16.7392 14.8093 15.5617 12.0016 15.5689H11.9978C9.1866 15.5617 6.90342 16.7364 5.87869 19.185ZM11.9997 14.0689C8.50025 14.0605 5.38329 15.6881 4.24171 19.2981L4.06445 19.8586L4.56642 20.1646C6.77078 21.5084 9.33343 22.0064 11.9997 22.0001C14.666 22.0064 17.2286 21.5084 19.433 20.1646L19.9349 19.8586L19.7577 19.2981C18.6173 15.6917 15.4957 14.0605 11.9997 14.0689Z"
        fill="currentColor"
      />
    </svg>
  );
}
