"use client";

import {
  Building2,
  Camera,
  ExternalLink,
  MapPin,
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

interface ProfileHeaderProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  chapterName?: string;
  branchName?: string;
  coordinatingBodyName?: string;
  organizationName?: string;
  isVerified?: boolean;
  isSubscribe?: boolean;
  followingCount?: number;
  followersCount?: number;
  feedCount?: number;
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
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#dbe3ef] bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-soft"
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
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e6e9ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#172033] transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
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
  fullName,
  avatar,
  headline,
  bio,
  chapterName,
  branchName,
  coordinatingBodyName,
  organizationName,
  isVerified,
  isSubscribe,
  followingCount,
  followersCount,
  feedCount,
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
  const displayName = fullName ?? "Kader";
  const primaryAffiliation = [chapterName, branchName].filter(Boolean).join(" • ");
  const organizationInfo = [coordinatingBodyName, organizationName]
    .filter(Boolean)
    .join(" • ");
  const hasAffiliation = Boolean(primaryAffiliation || organizationInfo);

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

  return (
    <div className="overflow-hidden border border-x-0 border-[#e6e9ef] bg-white shadow-sm lg:rounded-2xl lg:border-x">
      <div className="h-28 bg-gradient-to-r from-primary to-secondary sm:h-40" />

      <div className="px-5 pb-5 lg:px-6 lg:pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="-mt-12 flex min-w-0 items-end gap-4 lg:-mt-16">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setIsAvatarEditOpen(true)}
                className="group relative overflow-hidden rounded-full border-4 border-white hover:cursor-pointer"
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
                className="border-4 border-white"
              />
            )}

            <div className="min-w-0 pb-1">
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
              </div>

              {headline && (
                <p className="mt-1 line-clamp-2 text-sm font-medium text-[#5f6573]">
                  {headline}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 lg:mt-5 lg:min-w-[220px] lg:items-end">
            {isOwnProfile ? (
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
            )}

            <SocialLinks
              accounts={socialMediaAccounts}
              isOwnProfile={isOwnProfile}
              onAdd={() => setIsEditOpen(true)}
              className="hidden justify-end lg:flex"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-[#5f6573] lg:max-w-2xl">
          {primaryAffiliation && (
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>{primaryAffiliation}</span>
            </p>
          )}
          {organizationInfo && (
            <p className="flex items-start gap-1.5">
              <Building2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>{organizationInfo}</span>
            </p>
          )}
        </div>

        <SocialLinks
          accounts={socialMediaAccounts}
          isOwnProfile={isOwnProfile}
          onAdd={() => setIsEditOpen(true)}
          className="mt-4 lg:hidden"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <VerifiedBadge size={14} />
              Anggota Terverifikasi
            </span>
          )}
          {isSubscribe && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="size-3.5" />
              HMI Connect+
            </span>
          )}
          {!hasAffiliation && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-medium text-[#5f6573]">
              <Building2 className="size-3.5" />
              Belum tergabung cabang
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-[#e6e9ef] bg-[#fbfcfe] text-center lg:max-w-md">
          <div className="px-3 py-3">
            <p className="font-bold text-[#172033]">{followingCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Mengikuti</p>
          </div>
          <div className="border-x border-[#e6e9ef] px-3 py-3">
            <p className="font-bold text-[#172033]">{followersTotal}</p>
            <p className="text-xs text-[#5f6573]">Pengikut</p>
          </div>
          <div className="px-3 py-3">
            <p className="font-bold text-[#172033]">{feedCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Postingan</p>
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
    </div>
  );
}
