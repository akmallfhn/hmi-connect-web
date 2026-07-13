"use client";

import { Award, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Avatar from "../common/Avatar";
import VerifiedBadge from "../common/VerifiedBadge";
import FollowListModal from "../modals/FollowListModal";
import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";
import { DEGREE_LABELS } from "@/lib/education";
import type { TrainingResultEnum, TrainingStatusEnum } from "@/lib/types";

interface ProfileSidebarProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  username?: string;
  isVerified?: boolean;
  followingCount?: number;
  followersCount?: number;
  feedCount?: number;
  educationHistories?: EducationHistoryEntry[];
  trainingHistories?: TrainingHistoryEntry[];
}

const RESULT_LABELS: Record<TrainingResultEnum, string> = {
  passed: "Lulus",
  conditional_pass: "Lulus Bersyarat",
  failed: "Tidak Lulus",
};

const LEVEL_RANK: Record<TrainingStatusEnum, number> = { LK1: 1, LK2: 2, LK3: 3 };

function getLatestEducation(
  entries: EducationHistoryEntry[]
): EducationHistoryEntry | undefined {
  return [...entries].sort(
    (a, b) => (b.end_year ?? b.start_year) - (a.end_year ?? a.start_year)
  )[0];
}

function getLatestTraining(
  entries: TrainingHistoryEntry[]
): TrainingHistoryEntry | undefined {
  return [...entries].sort((a, b) => {
    const rankDiff = LEVEL_RANK[b.level] - LEVEL_RANK[a.level];
    return rankDiff !== 0 ? rankDiff : b.year - a.year;
  })[0];
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
  feedCount,
  educationHistories = [],
  trainingHistories = [],
}: ProfileSidebarProps) {
  const [followListType, setFollowListType] = useState<"following" | "followers" | null>(
    null
  );
  const displayName = fullName ?? "Kader";
  const latestEducation = getLatestEducation(educationHistories);
  const latestTraining = getLatestTraining(trainingHistories);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
        <Link
          href={username ? `/profile/${username}` : "#"}
          className="flex flex-col items-center gap-3 text-center"
        >
          <Avatar src={avatar} name={displayName} size={72} ring />
          <div>
            <p className="flex items-center justify-center gap-1 font-bold text-[#172033]">
              <span>{displayName}</span>
              {isVerified && <VerifiedBadge size={16} />}
            </p>
            <p className="text-sm text-[#5f6573]">{headline || "Kader • HMI Connect"}</p>
          </div>
        </Link>

        <div className="mt-5 grid grid-cols-3 divide-x divide-[#e6e9ef] border-y border-[#e6e9ef] py-3 text-center">
          <button
            type="button"
            onClick={() => setFollowListType("following")}
            className="cursor-pointer"
          >
            <p className="font-bold text-[#172033]">{followingCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Mengikuti</p>
          </button>
          <button
            type="button"
            onClick={() => setFollowListType("followers")}
            className="cursor-pointer"
          >
            <p className="font-bold text-[#172033]">{followersCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Pengikut</p>
          </button>
          <Link href={username ? `/profile/${username}/activities` : "#"}>
            <p className="font-bold text-[#172033]">{feedCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Postingan</p>
          </Link>
        </div>

        {(latestEducation || latestTraining) && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm font-medium text-[#172033]">Informasi</p>
            {latestEducation && (
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6e9ef] bg-white text-primary">
                  {latestEducation.image_url ? (
                    <Image
                      src={latestEducation.image_url}
                      alt={latestEducation.institution_name}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <GraduationCap className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#5f6573]">Pendidikan Terakhir</p>
                  <p className="truncate text-sm font-medium text-[#172033]">
                    {latestEducation.institution_name}
                  </p>
                  <p className="text-xs text-[#5f6573]">
                    {DEGREE_LABELS[latestEducation.degree]} • {latestEducation.major}
                  </p>
                </div>
              </div>
            )}
            {latestTraining && (
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <Award className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#5f6573]">Kaderisasi Terakhir</p>
                  <p className="truncate text-sm font-medium text-[#172033]">
                    Latihan Kader {latestTraining.level.replace("LK", "")}
                  </p>
                  <p className="text-xs text-[#5f6573]">
                    {RESULT_LABELS[latestTraining.result]} • {latestTraining.year}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
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
