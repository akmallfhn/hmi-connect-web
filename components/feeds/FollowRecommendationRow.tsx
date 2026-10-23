"use client";

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
  variant?: "compact" | "list";
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

  const followButton = (
    <Button
      variant={isFollowing ? "outline" : "soft"}
      size="sm"
      onClick={handleFollowToggle}
      disabled={loading}
      className="shrink-0"
    >
      {isFollowing ? "Mengikuti" : "Ikuti"}
    </Button>
  );

  if (variant === "list") {
    return (
      <div className="border-b border-border">
        <div className="rounded-xl px-3 py-4 transition-colors hover:bg-surface-muted">
          <div className="flex items-center gap-3">
            <Link href={profileHref} className="shrink-0">
              <Avatar
                src={connection.avatar}
                name={connection.full_name}
                size={40}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={profileHref}
                className="block truncate text-sm font-semibold text-heading lg:text-[15px]"
              >
                {connection.full_name}
              </Link>
              <Link
                href={profileHref}
                className="block truncate text-[13px] text-subtle-foreground lg:text-sm"
              >
                @{connection.username}
              </Link>
            </div>
            {followButton}
          </div>
          <p className="ml-[52px] mt-2 line-clamp-2 text-[13px] leading-5 text-muted-foreground lg:text-sm">
            {subtitle}
          </p>
        </div>
      </div>
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
      {followButton}
    </div>
  );
}
