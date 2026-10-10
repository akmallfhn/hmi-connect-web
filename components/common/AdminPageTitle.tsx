import type { ReactNode } from "react";

type AdminPageTitleVariant = "default" | "compact" | "placeholder";

interface AdminPageTitleProps {
  children: ReactNode;
  description?: ReactNode;
  variant?: AdminPageTitleVariant;
  className?: string;
}

const VARIANT_CLASSNAMES: Record<AdminPageTitleVariant, string> = {
  default: "text-2xl sm:text-3xl",
  compact: "text-xl",
  placeholder: "text-2xl",
};

const DESCRIPTION_CLASSNAMES: Record<AdminPageTitleVariant, string> = {
  default:
    "font-stack-sans-headline font-light mt-1.5 text-sm text-muted-foreground sm:text-base",
  compact: "font-stack-sans-headline font-light mt-0.5 text-sm text-muted-foreground",
  placeholder:
    "font-stack-sans-headline font-light max-w-sm text-sm text-muted-foreground",
};

export default function AdminPageTitle({
  children,
  description,
  variant = "default",
  className,
}: AdminPageTitleProps) {
  return (
    <>
      <h1
        className={[
          "font-stack-sans-headline font-semibold text-heading",
          VARIANT_CLASSNAMES[variant],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </h1>
      {description && (
        <p className={DESCRIPTION_CLASSNAMES[variant]}>{description}</p>
      )}
    </>
  );
}
