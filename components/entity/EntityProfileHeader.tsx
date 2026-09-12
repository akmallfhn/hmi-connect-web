import { Building2, CalendarDays, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BranchTypeEnum } from "@/lib/types";
import Label from "../common/Label";
import LogoHmi from "../svg/LogoHmi";
import { formatMonthYear } from "@/lib/time-manipulation";

export type EntityStat = {
  label: string;
  value: number;
};

export type EntityAffiliation = {
  label: string;
  href?: string;
};

interface EntityProfileHeaderProps {
  name: string;
  imageUrl?: string | null;
  type?: BranchTypeEnum | null;
  affiliations: EntityAffiliation[];
  createdAt?: string;
  stats: EntityStat[];
}

const TYPE_LABEL: Record<BranchTypeEnum, string> = {
  full: "Penuh",
  provisional: "Persiapan",
};

export default function EntityProfileHeader({
  name,
  imageUrl,
  type,
  affiliations,
  createdAt,
  stats,
}: EntityProfileHeaderProps) {
  const registeredLabel = createdAt ? formatMonthYear(createdAt) : null;

  return (
    <div className="overflow-hidden border border-x-0 border-[#e6e9ef] bg-white lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="h-28 bg-gradient-to-r from-primary to-secondary sm:h-40" />

      <div className="px-5 pb-5 lg:px-6 lg:pb-6">
        <div className="relative -mt-14 w-fit lg:-mt-16">
          <span className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#f5f7fb] ring-4 ring-primary">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <LogoHmi className="size-14" />
            )}
          </span>

          {/* The entity marker lives on the logo instead of a pill beside the name, so the name row stays one line. */}
          <span className="group/official absolute right-0.5 bottom-0.5">
            <span
              className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white"
              aria-label="Official Account"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-20 mb-1.5 w-max rounded-md bg-[#172033] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition translate-y-1 group-hover/official:translate-y-0 group-hover/official:opacity-100"
            >
              Official Account
            </span>
          </span>
        </div>

        <div className="mt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <h1 className="text-xl font-bold text-[#172033] sm:text-2xl">
              {name}
            </h1>
            {type && (
              <Label variant={type === "full" ? "green" : "yellow"} size="sm">
                {TYPE_LABEL[type]}
              </Label>
            )}
          </div>

          {affiliations.length > 0 && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-[#5f6573] xl:text-[15px]">
              <Building2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>
                {affiliations.map((affiliation, index) => (
                  <span key={affiliation.label}>
                    {index > 0 && " • "}
                    {affiliation.href ? (
                      <Link
                        href={affiliation.href}
                        className="hover:text-primary hover:underline"
                      >
                        {affiliation.label}
                      </Link>
                    ) : (
                      affiliation.label
                    )}
                  </span>
                ))}
              </span>
            </p>
          )}

          {registeredLabel && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#5f6573] xl:text-[15px]">
              <CalendarDays className="size-3.5" />
              Terdaftar {registeredLabel}
            </p>
          )}

          {stats.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {stats.map((stat) => (
                <span key={stat.label}>
                  <span className="font-bold text-[#172033]">{stat.value}</span>{" "}
                  <span className="text-[#5f6573]">{stat.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
