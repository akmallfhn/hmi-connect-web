"use client";

import { Fragment, useState } from "react";
import {
  IconBuilding,
  IconBoltFilled,
  IconHourglassHigh,
} from "@tabler/icons-react";
import { Check, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { followEntity, unfollowEntity } from "@/lib/actions";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { isSuccessStatus, type AccessEntityTypeEnum, type BranchTypeEnum } from "@/lib/types";
import Button from "../buttons/Button";
import LogoHmi from "../svg/LogoHmi";
import { useActingHref } from "@/hooks/useActingEntity";

export type EntityStat = {
  label: string;
  value: number;
};

export type EntityAffiliation = {
  label: string;
  href?: string;
};

interface EntityProfileHeaderProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string;
  imageUrl?: string | null;
  type?: BranchTypeEnum | null;
  // The units this one sits under, nearest first; empty for the organization itself.
  parents: EntityAffiliation[];
  stats: EntityStat[];
  // Null when the follow state can't apply: signed out, or browsing as an official account.
  follow: { isFollowing: boolean; followerCount: number } | null;
}

// The level as it reads mid-sentence: "Cabang ini merupakan cabang aktif ...".
const LEVEL_NOUN: Record<AccessEntityTypeEnum, string> = {
  organization: "organisasi",
  coordinating_body: "Badko",
  branch: "cabang",
  coordinating_chapter: "Korkom",
  chapter: "komisariat",
};

const TYPE_BADGE: Record<
  BranchTypeEnum,
  { label: string; hint: string; className: string; iconClassName: string; Icon: typeof IconBuilding }
> = {
  full: {
    label: "Penuh",
    hint: "Telah disahkan sebagai unit penuh",
    className: "border-success-soft-border bg-success-soft-bg text-success-soft-fg",
    iconClassName: "bg-success-soft-fg text-success-soft-bg",
    Icon: IconBoltFilled,
  },
  provisional: {
    label: "Persiapan",
    hint: "Masih dalam masa persiapan menuju unit penuh",
    className: "border-warning-soft-border bg-warning-soft-bg text-warning-soft-fg",
    iconClassName: "bg-warning-soft-fg text-warning-soft-bg",
    Icon: IconHourglassHigh,
  },
};

function TypeBadge({ entityType, type }: { entityType: AccessEntityTypeEnum; type: BranchTypeEnum }) {
  const badge = TYPE_BADGE[type];
  return (
    <span
      title={badge.hint}
      className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-xs font-semibold ${badge.className}`}
    >
      {/* The circle inverts the pill's own text/background pair, so the icon keeps its AA contrast in both themes. */}
      <span
        className={`flex size-5 items-center justify-center rounded-full ${badge.iconClassName}`}
      >
        <badge.Icon className="size-3.5" stroke={2.2} />
      </span>
      {ADMIN_ENTITY_LABEL[entityType]} {badge.label}
    </span>
  );
}

export default function EntityProfileHeader({
  entityType,
  entityId,
  name,
  imageUrl,
  type,
  parents,
  stats,
  follow,
}: EntityProfileHeaderProps) {
  const actingHref = useActingHref();
  const [isFollowing, setIsFollowing] = useState(follow?.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(follow?.followerCount ?? 0);
  const [followLoading, setFollowLoading] = useState(false);

  async function handleFollowToggle() {
    if (followLoading) return;
    const nextFollowing = !isFollowing;
    const previousCount = followerCount;
    setIsFollowing(nextFollowing);
    setFollowerCount((count) => Math.max(0, count + (nextFollowing ? 1 : -1)));
    setFollowLoading(true);
    try {
      const result = nextFollowing
        ? await followEntity(entityType, entityId)
        : await unfollowEntity(entityType, entityId);
      if (!isSuccessStatus(result.status)) {
        setIsFollowing(!nextFollowing);
        setFollowerCount(previousCount);
        toast.error(result.message ?? "Gagal memperbarui status mengikuti.");
      }
    } catch (err) {
      console.error("[EntityProfileHeader] follow toggle threw:", err);
      setIsFollowing(!nextFollowing);
      setFollowerCount(previousCount);
      toast.error("Gagal memperbarui status mengikuti.");
    } finally {
      setFollowLoading(false);
    }
  }

  const allStats = follow ? [...stats, { label: "Pengikut", value: followerCount }] : stats;

  return (
    <div className="overflow-hidden border border-x-0 border-border bg-surface lg:rounded-2xl lg:border-x">
      <div className="relative h-28 overflow-hidden bg-primary-soft sm:h-36">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-24 size-72 sm:right-8"
        >
          <div className="absolute inset-0 rounded-full border-[32px] border-primary-light opacity-50" />
          <div className="absolute left-[-5.5rem] top-32 size-44 rounded-full border-[24px] border-primary-light opacity-40 sm:top-36" />
        </div>
      </div>

      <div className="px-5 pb-5 lg:px-6 lg:pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="relative -mt-14 w-fit shrink-0 lg:-mt-16">
            <span className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-on-dark bg-surface-muted ring-4 ring-primary">
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
                className="flex size-7 items-center justify-center rounded-full border-2 border-on-dark bg-badge-primary text-badge-foreground"
                aria-label="Official Account"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full right-0 z-20 mb-1.5 w-max rounded-md bg-brand-ink px-2.5 py-1.5 text-xs font-medium text-on-dark opacity-0 shadow-lg transition translate-y-1 group-hover/official:translate-y-0 group-hover/official:opacity-100"
              >
                Official Account
              </span>
            </span>
          </div>

          {follow && (
            <Button
              variant={isFollowing ? "light" : "primary"}
              onClick={handleFollowToggle}
              disabled={followLoading}
              className="mt-3"
            >
              {isFollowing ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              {followLoading ? "Memproses..." : isFollowing ? "Mengikuti" : "Ikuti"}
            </Button>
          )}
        </div>

        <div className="mt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            <h1 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
              {name}
            </h1>
            {type && <TypeBadge entityType={entityType} type={type} />}
          </div>

          {parents.length > 0 && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground xl:text-[15px]">
              <IconBuilding className="mt-0.5 size-4 shrink-0 text-primary-foreground" stroke={1.8} />
              <span>
                {ADMIN_ENTITY_LABEL[entityType]} ini merupakan {LEVEL_NOUN[entityType]} aktif di bawah
                naungan{" "}
                {parents.map((parent, index) => (
                  <Fragment key={parent.label}>
                    {index > 0 && ", "}
                    {parent.href ? (
                      <Link
                        href={actingHref(parent.href)}
                        className="font-medium text-heading hover:text-primary-foreground hover:underline"
                      >
                        {parent.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-heading">{parent.label}</span>
                    )}
                  </Fragment>
                ))}
              </span>
            </p>
          )}

          {allStats.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {allStats.map((stat) => (
                <span key={stat.label}>
                  <span className="font-bold text-heading">{stat.value}</span>{" "}
                  <span className="text-muted-foreground">{stat.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
