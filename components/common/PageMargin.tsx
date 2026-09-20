import { HTMLAttributes, ReactNode } from "react";

interface PageMarginProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noMobilePadding?: boolean;
}

// Single source of truth for every page's left/right margin, one rule per viewport tier.
export default function PageMargin({
  className,
  children,
  noMobilePadding,
  ...rest
}: PageMarginProps) {
  return (
    <div
      className={[
        noMobilePadding ? "mx-auto w-full px-0" : "mx-auto w-full px-4",
        "lg:max-w-[988px] lg:px-8 xl:max-w-[1200px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
