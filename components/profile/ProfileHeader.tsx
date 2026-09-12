"use client";

import type { SocialMediaPlatform } from "@/apis/social-media-platforms";
import type { SocialMediaAccountEntry } from "@/apis/users";
import { followUser, unfollowUser } from "@/lib/actions";
import { isSuccessStatus, type VerificationStatusEnum } from "@/lib/types";
import {
  Building2,
  Camera,
  Pencil,
  Settings,
  TriangleAlert,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import ProfileBadges from "../common/ProfileBadges";
import EditAvatarForm from "../forms/EditAvatarForm";
import EditProfileForm from "../forms/EditProfileForm";
import FollowListModal from "../modals/FollowListModal";
import SendMessageButton from "./SendMessageButton";
import SocialLinks from "./SocialLinks";

interface ProfileHeaderProps {
  viewerId?: string;
  userId?: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  phoneNumber?: string;
  bio?: string;
  chapterName?: string;
  branchName?: string;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
  followingCount?: number;
  followersCount?: number;
  isFollowedByMe?: boolean;
  isOwnProfile?: boolean;
  socialMediaAccounts: SocialMediaAccountEntry[];
  socialMediaPlatforms: SocialMediaPlatform[];
}

export default function ProfileHeader({
  viewerId,
  userId,
  username,
  fullName,
  avatar,
  headline,
  phoneNumber,
  bio,
  chapterName,
  branchName,
  verificationStatus,
  isAlumni,
  followingCount,
  followersCount,
  isFollowedByMe,
  isOwnProfile,
  socialMediaAccounts,
  socialMediaPlatforms,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(Boolean(isFollowedByMe));
  const [followersTotal, setFollowersTotal] = useState(followersCount ?? 0);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAvatarEditOpen, setIsAvatarEditOpen] = useState(false);
  const [followListType, setFollowListType] = useState<
    "following" | "followers" | null
  >(null);
  const displayName = fullName ?? "Kader";
  const affiliation = [
    chapterName ? `HMI Komisariat ${chapterName}` : null,
    branchName ? `Cabang ${branchName}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const hasAffiliation = Boolean(affiliation);

  async function handleFollowToggle() {
    if (!userId || followLoading) return;

    const nextFollowing = !isFollowing;
    const previousFollowersTotal = followersTotal;
    setIsFollowing(nextFollowing);
    setFollowersTotal((prev) => Math.max(0, prev + (nextFollowing ? 1 : -1)));
    setFollowLoading(true);

    try {
      const result = nextFollowing
        ? await followUser(userId)
        : await unfollowUser(userId);

      if (!isSuccessStatus(result.status)) {
        setIsFollowing(!nextFollowing);
        setFollowersTotal(previousFollowersTotal);
        toast.error(result.message ?? "Gagal memperbarui status mengikuti.");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error("[ProfileHeader] follow toggle threw:", err);
      setIsFollowing(!nextFollowing);
      setFollowersTotal(previousFollowersTotal);
      toast.error("Gagal memperbarui status mengikuti.");
    } finally {
      setFollowLoading(false);
    }
  }

  const actionButton = isOwnProfile ? (
    <Button variant="light" onClick={() => setIsEditOpen(true)}>
      <Pencil className="size-3.5" />
      Edit Profil
    </Button>
  ) : (
    <div className="flex items-center gap-2">
      {viewerId && userId && (
        <div className="hidden lg:block">
          <SendMessageButton
            userId={userId}
            username={username}
            fullName={displayName}
            avatar={avatar}
          />
        </div>
      )}
      <Button
        variant={isFollowing ? "light" : "primary"}
        onClick={handleFollowToggle}
        disabled={followLoading}
      >
        {isFollowing ? (
          <UserCheck className="size-3.5" />
        ) : (
          <UserPlus className="size-3.5" />
        )}
        {followLoading ? "Memproses..." : isFollowing ? "Mengikuti" : "Ikuti"}
      </Button>
    </div>
  );

  return (
    <div className="overflow-hidden border border-x-0 border-[#e6e9ef] bg-white lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="relative h-28 bg-gradient-to-r from-primary to-secondary sm:h-40">
        {isOwnProfile && (
          <Link
            href="/settings"
            aria-label="Pengaturan"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30 lg:hidden"
          >
            <Settings className="size-5" />
          </Link>
        )}
      </div>

      <div className="px-5 pb-5 lg:px-6 lg:pb-6">
        <div className="flex items-start justify-between">
          {isOwnProfile ? (
            <button
              type="button"
              onClick={() => setIsAvatarEditOpen(true)}
              className="group relative -mt-14 shrink-0 overflow-hidden rounded-full border-4 border-white hover:cursor-pointer lg:-mt-16"
              aria-label="Ubah foto profil"
            >
              <Avatar src={avatar} name={displayName} size={112} />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <Camera className="size-6" />
              </span>
            </button>
          ) : (
            <Avatar
              src={avatar}
              name={displayName}
              size={112}
              className="relative -mt-14 shrink-0 border-4 border-white lg:-mt-16"
            />
          )}

          <div className="mt-3">{actionButton}</div>
        </div>

        <div className="mt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <h1 className="truncate text-xl font-bold text-[#172033] sm:text-2xl">
              {displayName}
            </h1>
            {verificationStatus !== "verified" && (
              <TriangleAlert
                className="size-5 text-destructive"
                aria-label="Belum terverifikasi"
              />
            )}
            <ProfileBadges
              isVerified={verificationStatus === "verified"}
              isAlumni={Boolean(isAlumni)}
              size={20}
            />
          </div>

          {username && (
            <p className="text-sm text-[#5f6573] xl:text-[15px]">@{username}</p>
          )}

          {headline && (
            <p className="mt-3 text-sm text-[#172033] xl:text-[15px]">
              {headline}
            </p>
          )}

          <p className="mt-2 flex items-start gap-1.5 text-sm text-[#5f6573] xl:text-[15px]">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              {hasAffiliation ? affiliation : "Belum tergabung cabang"}
            </span>
          </p>

          <SocialLinks
            className="mt-2"
            accounts={socialMediaAccounts}
            isOwnProfile={isOwnProfile}
            onAdd={() => setIsEditOpen(true)}
          />

          <div className="mt-3 flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setFollowListType("following")}
              className="cursor-pointer hover:underline"
            >
              <span className="font-bold text-[#172033]">
                {followingCount ?? 0}
              </span>{" "}
              <span className="text-[#5f6573]">Mengikuti</span>
            </button>
            <button
              type="button"
              onClick={() => setFollowListType("followers")}
              className="cursor-pointer hover:underline"
            >
              <span className="font-bold text-[#172033]">{followersTotal}</span>{" "}
              <span className="text-[#5f6573]">Pengikut</span>
            </button>
          </div>

          {!isOwnProfile && viewerId && userId && (
            <div className="mt-3 lg:hidden">
              <SendMessageButton
                userId={userId}
                username={username}
                fullName={displayName}
                avatar={avatar}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <>
          <EditProfileForm
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSaved={() => {
              setIsEditOpen(false);
              router.refresh();
            }}
            userId={userId}
            username={username}
            fullName={fullName}
            headline={headline}
            phoneNumber={phoneNumber}
            bio={bio}
            socialMediaAccounts={socialMediaAccounts}
            socialMediaPlatforms={socialMediaPlatforms}
          />
          <EditAvatarForm
            open={isAvatarEditOpen}
            onClose={() => setIsAvatarEditOpen(false)}
            onSaved={() => {
              setIsAvatarEditOpen(false);
              router.refresh();
            }}
            userId={userId}
            fullName={fullName}
            avatar={avatar}
          />
        </>
      )}

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
