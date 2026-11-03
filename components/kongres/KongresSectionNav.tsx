"use client";

import { IconSmartHome } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const KONGRES_SECTIONS = [
  { id: "logo", label: "Logo Resmi" },
  { id: "panitia", label: "Panitia & SC" },
  { id: "tuan-rumah", label: "Tuan Rumah" },
  { id: "lokasi", label: "Lokasi" },
  { id: "rundown", label: "Rundown" },
  { id: "berita", label: "Berita" },
  { id: "momen", label: "Momen" },
];

// Tournament-style sticky tabs; the section crossing the upper third of the viewport is the active one.
export default function KongresSectionNav({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    for (const section of KONGRES_SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Navigasi halaman Kongres"
      className={`sticky top-0 z-30 border-b border-white/10 bg-[#04291a]/95 text-white backdrop-blur ${className}`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 sm:px-8">
        <a href="#beranda" aria-label="Kongres XXXIII HMI" className="hidden shrink-0 py-2 sm:block">
          <Image
            src="/images/kongres/logo-kongres-xxxiii-horizontal.png"
            alt=""
            width={1600}
            height={437}
            priority
            className="h-10 w-auto lg:h-11"
          />
        </a>
        <ul className="-mx-5 flex flex-1 gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:justify-end sm:px-0 [&::-webkit-scrollbar]:hidden">
          {KONGRES_SECTIONS.map((section) => {
            const isActive = active === section.id;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative block px-3 py-4 text-sm font-semibold transition ${
                    isActive ? "text-[#f6d77a]" : "text-white/65 hover:text-white"
                  }`}
                >
                  {section.label}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#e8b628] transition-transform ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
        {/* The campaign page hides the desktop rail, so this is the desktop way back into the app. */}
        <Link
          href="/"
          aria-label="Kembali ke HMI Connect"
          title="Kembali ke HMI Connect"
          className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white lg:flex"
        >
          <IconSmartHome className="size-[18px]" />
        </Link>
      </div>
    </nav>
  );
}
