"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { FollowRecommendationEntry } from "@/apis/users";
import { followUser, unfollowUser } from "@/lib/actions";
import { followRecommendationSubtitle } from "@/lib/follow-recommendation";
import { isSuccessStatus } from "@/lib/types";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";

interface FollowRecommendationRowProps {
  connection: FollowRecommendationEntry;
  variant?: "compact" | "card";
}

export default function FollowRecommendationRow({
  connection,
  variant = "compact",
}: FollowRecommendationRowProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const profileHref = `/profile/${connection.username}`;
  const subtitle = followRecommendationSubtitle(connection);

  async function handleFollowToggle() {
    if (loading) return;

    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setLoading(true);

    try {
      const result = nextFollowing
        ? await followUser(connection.id)
        : await unfollowUser(connection.id);

      if (!isSuccessStatus(result.status)) {
        setIsFollowing(!nextFollowing);
        toast.error(result.message ?? "Gagal memperbarui status mengikuti.");
      }
    } catch (err) {
      console.error("[FollowRecommendationRow] follow toggle threw:", err);
      setIsFollowing(!nextFollowing);
      toast.error("Gagal memperbarui status mengikuti.");
    } finally {
      setLoading(false);
    }
  }

  const compactFollowButton = (
    <Button
      variant={isFollowing ? "outline" : "soft"}
      size="sm"
      onClick={handleFollowToggle}
      disabled={loading}
      className="shrink-0"
    >
      {isFollowing ? (
        "Mengikuti"
      ) : (
        <>
          <Plus className="size-3.5" />
          Ikuti
        </>
      )}
    </Button>
  );

  if (variant === "card") {
    return (
      <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-16 shrink-0 bg-primary-soft sm:h-20">
          <Link
            href={profileHref}
            className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-surface p-1 sm:top-7"
            aria-label={connection.full_name}
          >
            <Avatar
              src={connection.avatar}
              name={connection.full_name}
              size={72}
            />
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-11 text-center sm:px-4 sm:pb-4 sm:pt-12">
          <Link
            href={profileHref}
            className="line-clamp-2 text-sm font-semibold leading-5 text-heading sm:text-[15px]"
          >
            {connection.full_name}
          </Link>
          <Link
            href={profileHref}
            className="mt-0.5 max-w-full truncate text-xs text-subtle-foreground sm:text-[13px]"
          >
            @{connection.username}
          </Link>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground sm:text-[13px]">
            {subtitle}
          </p>

          <div className="mt-auto w-full pt-4">
            <Button
              variant={isFollowing ? "outline" : "soft"}
              size="sm"
              onClick={handleFollowToggle}
              disabled={loading}
              className="w-full"
            >
              {isFollowing ? "Mengikuti" : "Ikuti"}
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={profileHref} className="shrink-0">
        <Avatar src={connection.avatar} name={connection.full_name} size={40} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={profileHref}
          className="block truncate text-sm font-medium text-heading hover:underline xl:text-[15px]"
        >
          {connection.full_name}
        </Link>
        <p className="truncate text-xs text-muted-foreground xl:text-[13px]">
          {subtitle}
        </p>
      </div>
      {compactFollowButton}
    </div>
  );
}
