import Image from "next/image";
import type { ReactNode } from "react";
import type { KongresPhoto } from "@/lib/kongres-data";

// The Kongres palette, lifted from the official logo: deep green, emerald, and leaf gold.
export const KONGRES_DEEP = "bg-[#04291a]";
export const KONGRES_GOLD_TEXT =
  "bg-linear-to-r from-[#fbe7a1] via-[#e8b628] to-[#b8860b] bg-clip-text text-transparent";
export const KONGRES_GOLD_BG = "bg-linear-to-r from-[#f6d77a] via-[#e8b628] to-[#c89211]";

const TAPIS_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="16"><path d="M0 12h32v4H0zM4 8h24v4H4zM8 4h16v4H8zM12 0h8v4h-8z"/></svg>'
)}")`;

// The stepped tumpal border from the logo's base, repeated as a divider in currentColor.
export function TapisBand({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-4 w-full bg-current ${className}`}
      style={{
        maskImage: TAPIS_MASK,
        WebkitMaskImage: TAPIS_MASK,
        maskSize: "36px 16px",
        WebkitMaskSize: "36px 16px",
        maskRepeat: "repeat-x",
        WebkitMaskRepeat: "repeat-x",
      }}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  tone?: "light" | "dark";
  action?: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
            dark ? "text-[#e8b628]" : "text-[#0a8a42] dark:text-[#e8b628]"
          }`}
        >
          <span className="h-px w-8 bg-current" />
          {eyebrow}
        </p>
        <h2
          className={`mt-3 font-stack-sans-headline text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl ${
            dark ? "text-white" : "text-heading"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-3 text-sm leading-6 sm:text-base ${
              dark ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// Photos sit in the Kongres green until hovered, so a mixed set of sources reads as one series.
export function DuotonePhoto({
  photo,
  sizes,
  className = "",
  priority,
}: {
  photo: KongresPhoto;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`group/photo relative overflow-hidden bg-[#04291a] ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover grayscale contrast-125 transition duration-700 group-hover/photo:scale-105 group-hover/photo:grayscale-0"
      />
      <div className="absolute inset-0 bg-[#0a8a42] opacity-75 mix-blend-multiply transition-opacity duration-700 group-hover/photo:opacity-0" />
      <div className="absolute inset-0 bg-[#e8b628] opacity-15 mix-blend-screen transition-opacity duration-700 group-hover/photo:opacity-0" />
    </div>
  );
}
