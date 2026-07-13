"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { FollowRecommendationEntry } from "@/apis/users";
import { followUser, unfollowUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";

interface FollowRecommendationRowProps {
  connection: FollowRecommendationEntry;
}

function affiliationLabel(connection: FollowRecommendationEntry): string | undefined {
  if (connection.branch_name) return `Cabang ${connection.branch_name}`;
  if (connection.coordinating_body_name) return connection.coordinating_body_name;
  return connection.chapter_name;
}

export default function FollowRecommendationRow({
  connection,
}: FollowRecommendationRowProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const profileHref = connection.username ? `/profile/${connection.username}` : "#";
  const subtitle = affiliationLabel(connection);

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

  return (
    <div className="flex items-center gap-3">
      <Link href={profileHref} className="shrink-0">
        <Avatar src={connection.avatar} name={connection.full_name} size={40} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={profileHref}
          className="block truncate text-sm font-medium text-[#172033] hover:underline"
        >
          {connection.full_name}
        </Link>
        {subtitle && <p className="truncate text-xs text-[#5f6573]">{subtitle}</p>}
      </div>
      <Button
        variant={isFollowing ? "outline" : "primary"}
        size="sm"
        onClick={handleFollowToggle}
        disabled={loading}
      >
        {isFollowing ? "Mengikuti" : "Ikuti"}
      </Button>
    </div>
  );
}
