"use client";

import {
  Building2,
  Calendar,
  Camera,
  ExternalLink,
  Pencil,
  Plus,
  Sparkles,
  TriangleAlert,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { SocialMediaPlatform } from "@/apis/social-media-platforms";
import type { SocialMediaAccountEntry } from "@/apis/users";
import { followUser, unfollowUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import VerifiedBadge from "../common/VerifiedBadge";
import EditAvatarForm from "../forms/EditAvatarForm";
import EditProfileForm from "../forms/EditProfileForm";
import FollowListModal from "../modals/FollowListModal";

interface ProfileHeaderProps {
  userId?: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  chapterName?: string;
  branchName?: string;
  isVerified?: boolean;
  isSubscribe?: boolean;
  followingCount?: number;
  followersCount?: number;
  createdAt?: string;
  isFollowedByMe?: boolean;
  isOwnProfile?: boolean;
  socialMediaAccounts: SocialMediaAccountEntry[];
  socialMediaPlatforms: SocialMediaPlatform[];
}

function normalizeSocialUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "#";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function SocialLinks({
  accounts,
  isOwnProfile,
  onAdd,
  className,
}: {
  accounts: SocialMediaAccountEntry[];
  isOwnProfile?: boolean;
  onAdd: () => void;
  className?: string;
}) {
  if (accounts.length === 0) {
    if (!isOwnProfile) return null;

    return (
      <div className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#dbe3ef] bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-[#f5f7fb]"
        >
          <Plus className="size-3.5" />
          Tambah sosial media
        </button>
      </div>
    );
  }

  return (
    <div className={["flex flex-wrap gap-2", className].filter(Boolean).join(" ")}>
      {accounts.map((account) => (
        <a
          key={account.id}
          href={normalizeSocialUrl(account.url)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e6e9ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#172033] transition hover:bg-[#f5f7fb]"
          title={account.url}
        >
          {account.logo_url ? (
            <Image
              src={account.logo_url}
              alt={account.platform_name}
              width={16}
              height={16}
              className="size-4 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary-soft text-[10px] text-primary">
              {account.platform_name.slice(0, 1)}
            </span>
          )}
          <span className="max-w-[140px] truncate">{account.platform_name}</span>
          <ExternalLink className="size-3 text-current/70" />
        </a>
      ))}
    </div>
  );
}

export default function ProfileHeader({
  userId,
  username,
  fullName,
  avatar,
  headline,
  bio,
  chapterName,
  branchName,
  isVerified,
  isSubscribe,
  followingCount,
  followersCount,
  createdAt,
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
  const [followListType, setFollowListType] = useState<"following" | "followers" | null>(
    null
  );
  const displayName = fullName ?? "Kader";
  const affiliation = [
    chapterName ? `HMI ${chapterName}` : null,
    branchName ? `Cabang ${branchName}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const hasAffiliation = Boolean(affiliation);
  const joinedLabel = createdAt
    ? new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
        new Date(createdAt)
      )
    : null;

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
  );

  return (
    <div className="overflow-hidden border border-x-0 border-[#e6e9ef] bg-white lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="h-28 bg-gradient-to-r from-primary to-secondary sm:h-40" />

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
              className="-mt-14 shrink-0 border-4 border-white lg:-mt-16"
            />
          )}

          <div className="mt-3">{actionButton}</div>
        </div>

        <div className="mt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <h1 className="truncate text-xl font-bold text-[#172033] sm:text-2xl">
              {displayName}
            </h1>
            {isVerified ? (
              <VerifiedBadge size={20} />
            ) : (
              <TriangleAlert
                className="size-5 text-destructive"
                aria-label="Belum terverifikasi"
              />
            )}
            {isSubscribe && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-soft px-2 py-0.5 text-xs font-semibold text-secondary">
                <Sparkles className="size-3" />
                HMI Connect+
              </span>
            )}
          </div>

          {username && <p className="text-sm text-[#5f6573]">@{username}</p>}

          {headline && <p className="mt-3 text-sm text-[#172033]">{headline}</p>}

          <p className="mt-2 flex items-start gap-1.5 text-sm text-[#5f6573]">
            <Building2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>{hasAffiliation ? affiliation : "Belum tergabung cabang"}</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <SocialLinks
              accounts={socialMediaAccounts}
              isOwnProfile={isOwnProfile}
              onAdd={() => setIsEditOpen(true)}
            />
            {joinedLabel && (
              <span className="flex items-center gap-1.5 text-sm text-[#5f6573]">
                <Calendar className="size-3.5" />
                Bergabung {joinedLabel}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setFollowListType("following")}
              className="cursor-pointer hover:underline"
            >
              <span className="font-bold text-[#172033]">{followingCount ?? 0}</span>{" "}
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
