"use client";

import {
  BadgeCheck,
  Building2,
  MapPin,
  Pencil,
  Sparkles,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";
import EditProfileForm from "../forms/EditProfileForm";
import { PLACEHOLDER_ACTIVITY } from "./mockData";

interface ProfileHeaderProps {
  userId?: string;
  fullName?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  branchName?: string;
  coordinatingBodyName?: string;
  organizationName?: string;
  isVerified?: boolean;
  isSubscribe?: boolean;
  followingCount?: number;
  followersCount?: number;
  isOwnProfile?: boolean;
}

export default function ProfileHeader({
  userId,
  fullName,
  avatar,
  headline,
  bio,
  branchName,
  coordinatingBodyName,
  organizationName,
  isVerified,
  isSubscribe,
  followingCount,
  followersCount,
  isOwnProfile,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const displayName = fullName ?? "Kader";
  const affiliation = [branchName, coordinatingBodyName, organizationName]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white shadow-sm">
      <div className="h-32 bg-gradient-to-r from-primary to-secondary sm:h-40" />

      <div className="px-5 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
            <Avatar
              src={avatar}
              name={displayName}
              size={96}
              className="border-4 border-white"
            />
          </div>

          <div className="flex shrink-0 justify-end pt-3">
            {isOwnProfile ? (
              <Button variant="light" onClick={() => setIsEditOpen(true)}>
                <Pencil className="size-3.5" />
                Edit Profil
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "light" : "primary"}
                onClick={() => setIsFollowing((prev) => !prev)}
              >
                {isFollowing ? (
                  <UserCheck className="size-3.5" />
                ) : (
                  <UserPlus className="size-3.5" />
                )}
                {isFollowing ? "Mengikuti" : "Ikuti"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-xl font-bold text-[#172033]">{displayName}</h1>
            {isVerified && (
              <BadgeCheck
                className="size-5 text-primary"
                aria-label="Terverifikasi"
              />
            )}
          </div>

          {headline && (
            <p className="mt-1 text-sm font-medium text-[#5f6573]">
              {headline}
            </p>
          )}

          {affiliation && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5f6573]">
              <MapPin className="size-3.5 shrink-0" />
              <span>{affiliation}</span>
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheck className="size-3.5" />
                Anggota Terverifikasi
              </span>
            )}
            {isSubscribe && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
                <Sparkles className="size-3.5" />
                HMI Connect+
              </span>
            )}
            {!affiliation && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-medium text-[#5f6573]">
                <Building2 className="size-3.5" />
                Belum tergabung cabang
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#e6e9ef] border-y border-[#e6e9ef] py-3 text-center sm:max-w-xs">
          <div>
            <p className="font-bold text-[#172033]">{followingCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Mengikuti</p>
          </div>
          <div>
            <p className="font-bold text-[#172033]">{followersCount ?? 0}</p>
            <p className="text-xs text-[#5f6573]">Pengikut</p>
          </div>
          <div>
            <p className="font-bold text-[#172033]">
              {PLACEHOLDER_ACTIVITY.length}
            </p>
            <p className="text-xs text-[#5f6573]">Postingan</p>
          </div>
        </div>
      </div>

      {isOwnProfile && (
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
          avatar={avatar}
        />
      )}
    </div>
  );
}
