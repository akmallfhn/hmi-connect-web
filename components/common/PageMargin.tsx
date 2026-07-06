import { HTMLAttributes, ReactNode } from "react";

interface PageMarginProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Single source of truth for every page's left/right margin, one rule per viewport tier.
export default function PageMargin({
  className,
  children,
  ...rest
}: PageMarginProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-4 lg:max-w-[988px] lg:px-8 xl:max-w-[1248px] 2xl:max-w-[1300px] 3xl:max-w-[1440px]",
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
