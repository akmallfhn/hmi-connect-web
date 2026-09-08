import type { Metadata } from "next";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { entityProfileHref } from "@/lib/feed-author";
import type {
  AccessEntityTypeEnum,
  BranchTypeEnum,
  StatusEnum,
} from "@/lib/types";

// The pieces every one of the five entity profile routes shares; the per-entity fetching stays in its own route.
export const ENTITY_TYPE_LABEL: Record<BranchTypeEnum, string> = {
  full: "Penuh",
  provisional: "Persiapan",
};

export function entityLevelField(entityType: AccessEntityTypeEnum) {
  return { label: "Tingkat", value: ADMIN_ENTITY_LABEL[entityType] };
}

export function kaderMeta(userCount?: number): string | undefined {
  return userCount === undefined ? undefined : `${userCount} kader`;
}

export function entityActivitiesMetadata(options: {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string | null;
}): Metadata {
  const { entityType, entityId, name } = options;

  return {
    title: name ? `Postingan ${name}` : "Halaman Tidak Ditemukan",
    alternates: {
      canonical: `${entityProfileHref(entityType, entityId)}/activities`,
    },
    robots: { index: false, follow: false },
  };
}

export function entityProfileMetadata(options: {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  name: string | null;
  description?: string | null;
  status?: StatusEnum;
}): Metadata {
  const { entityType, entityId, name, description, status } = options;
  const title = name ?? "Halaman Tidak Ditemukan";

  return {
    title,
    description: name
      ? (description ?? `Profil resmi ${name} di HMI Connect.`)
      : "Halaman HMI Connect yang kamu cari tidak ditemukan.",
    alternates: { canonical: entityProfileHref(entityType, entityId) },
    robots: { index: status === "active", follow: status === "active" },
  };
}
