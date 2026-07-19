"use client";

import type { EducationHistoryEntry } from "@/apis/users";
import Link from "next/link";
import { useState } from "react";
import Avatar from "../common/Avatar";
import VerifiedBadge from "../common/VerifiedBadge";
import FollowListModal from "../modals/FollowListModal";

interface ProfileSidebarProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  username?: string;
  isVerified?: boolean;
  followingCount?: number;
  followersCount?: number;
  educationHistories?: EducationHistoryEntry[];
}

function getLatestEducation(
  entries: EducationHistoryEntry[]
): EducationHistoryEntry | undefined {
  return [...entries].sort(
    (a, b) => (b.end_year ?? b.start_year) - (a.end_year ?? a.start_year)
  )[0];
}

export default function ProfileSidebar({
  userId,
  fullName,
  avatar,
  headline,
  username,
  isVerified,
  followingCount,
  followersCount,
  educationHistories = [],
}: ProfileSidebarProps) {
  const [followListType, setFollowListType] = useState<
    "following" | "followers" | null
  >(null);
  const displayName = fullName ?? "Kader";
  const latestEducation = getLatestEducation(educationHistories);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
        <Link
          href={username ? `/profile/${username}` : "#"}
          className="flex flex-col items-center gap-2 text-center"
        >
          <Avatar src={avatar} name={displayName} size={72} ring />
          <div className="flex flex-col items-center">
            <p className="flex items-center justify-center gap-1 font-bold text-[#172033]">
              <span>{displayName}</span>
              {isVerified && <VerifiedBadge size={16} />}
            </p>
            {username && <p className="text-sm text-[#5f6573]">@{username}</p>}
            {headline && <p className="text-sm text-[#5f6573]">{headline}</p>}
            {latestEducation && (
              <p className="truncate text-sm text-[#5f6573]">
                {latestEducation.institution_name}
              </p>
            )}
          </div>
        </Link>

        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setFollowListType("following")}
            className="cursor-pointer text-[#5f6573] hover:underline"
          >
            <span className="font-bold text-[#172033]">
              {followingCount ?? 0}
            </span>{" "}
            Mengikuti
          </button>
          <button
            type="button"
            onClick={() => setFollowListType("followers")}
            className="cursor-pointer text-[#5f6573] hover:underline"
          >
            <span className="font-bold text-[#172033]">
              {followersCount ?? 0}
            </span>{" "}
            Pengikut
          </button>
        </div>
      </div>

      {userId && followListType && (
        <FollowListModal
          open
          onClose={() => setFollowListType(null)}
          userId={userId}
          type={followListType}
        />
      )}
    </div>
  );
}
