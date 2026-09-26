"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LogoHmi from "../svg/LogoHmi";
import { useActingHref } from "@/hooks/useActingEntity";

interface EntitySummarySidebarProps {
  name: string;
  imageUrl?: string | null;
  href: string;
}

// An entity's sidebar — identity and a way back, no counts an entity page would have to refetch.
export default function EntitySummarySidebar({
  name,
  imageUrl,
  href,
}: EntitySummarySidebarProps) {
  const actingHref = useActingHref();
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <Link
        href={actingHref(href)}
        className="flex flex-col items-center gap-2 text-center"
      >
        <span className="relative block size-[72px]">
          <span className="flex size-[72px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#f5f7fb] ring-2 ring-primary">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            ) : (
              <LogoHmi className="size-9" />
            )}
          </span>
          <span
            aria-label="Official Account"
            title="Official Account"
            className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary text-white"
          >
            <Check className="size-3" strokeWidth={4} />
          </span>
        </span>
        <p className="font-bold text-[#172033]">{name}</p>
      </Link>
    </div>
  );
}
