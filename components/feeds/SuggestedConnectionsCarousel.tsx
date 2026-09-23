"use client";

import type { FollowRecommendationEntry } from "@/apis/users";
import { followUser, unfollowUser } from "@/lib/actions";
import { followRecommendationSubtitle } from "@/lib/follow-recommendation";
import { isSuccessStatus } from "@/lib/types";
import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";

interface SuggestedConnectionsCarouselProps {
  connections: FollowRecommendationEntry[];
  title?: string;
}

export default function SuggestedConnectionsCarousel({
  connections,
  title = "Mungkin Kamu Kenal",
}: SuggestedConnectionsCarouselProps) {
  // Dismissals last only for this mount — follow-recommendations/list has no endpoint to remember them.
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const visible = connections.filter(
    (connection) => !dismissedIds.includes(connection.id)
  );

  if (visible.length === 0) return null;

  return (
    <section className="border border-x-0 border-[#e6e9ef] bg-white py-4 lg:rounded-2xl lg:border-x">
      <h2 className="font-stack-sans-headline px-4 text-sm font-medium text-[#172033] xl:text-[15px]">
        {title}
      </h2>

      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onDismiss={(id) => setDismissedIds((prev) => [...prev, id])}
          />
        ))}
      </div>
    </section>
  );
}

function ConnectionCard({
  connection,
  onDismiss,
}: {
  connection: FollowRecommendationEntry;
  onDismiss: (id: string) => void;
}) {
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
      console.error("[SuggestedConnectionsCarousel] follow toggle threw:", err);
      setIsFollowing(!nextFollowing);
      toast.error("Gagal memperbarui status mengikuti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex w-40 shrink-0 snap-start flex-col items-center rounded-xl border border-[#e6e9ef] p-4 sm:w-44">
      <button
        type="button"
        onClick={() => onDismiss(connection.id)}
        aria-label={`Sembunyikan ${connection.full_name}`}
        className="absolute right-1.5 top-1.5 cursor-pointer rounded-full p-1 text-[#7b8190] transition hover:bg-[#f5f7fb] hover:text-[#172033]"
      >
        <X className="size-4" />
      </button>

      <Link href={profileHref} aria-label={connection.full_name}>
        <Avatar src={connection.avatar} name={connection.full_name} size={72} />
      </Link>

      <Link
        href={profileHref}
        className="mt-3 line-clamp-1 w-full text-center text-sm font-semibold text-[#172033] hover:underline lg:text-[15px]"
      >
        {connection.full_name}
      </Link>

      {/* Reserved even when empty, so every card's Ikuti button lands on the same line. */}
      <p className="mt-0.5 line-clamp-2 h-8 w-full text-center text-xs text-[#5f6573] lg:text-[13px]">
        {subtitle}
      </p>

      <Button
        variant={isFollowing ? "outline" : "soft"}
        size="sm"
        onClick={handleFollowToggle}
        disabled={loading}
        className="mt-3 w-full"
      >
        {isFollowing ? "Mengikuti" : "Ikuti"}
      </Button>
    </div>
  );
}
