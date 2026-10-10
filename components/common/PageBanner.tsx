import type { ReactNode } from "react";

interface PageBannerProps {
  children: ReactNode;
  className?: string;
}

// Sizes at 600×200 on mobile and 1200×200 from lg; callers paint the background.
export default function PageBanner({ children, className }: PageBannerProps) {
  return (
    <div
      className={[
        "relative flex aspect-[3/1] items-center overflow-hidden rounded-xl px-4 text-on-dark sm:px-6 lg:aspect-[6/1] lg:rounded-2xl lg:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
