import type { Metadata } from "next";
import type { MentionEntityTypeEnum, StatusEnum } from "@/lib/types";

// The pieces every one of the five entity profile routes shares; the per-entity fetching stays in its own route.
export function kaderMeta(userCount?: number): string | undefined {
  return userCount === undefined ? undefined : `${userCount} kader`;
}

export type EntityTab = "posts" | "people" | "chapters" | "branches";

// Shared by the server hydration and the client lists, so both address the same cache entry.
export function entityPostsQueryKey(
  entityType: MentionEntityTypeEnum,
  entityId: string,
  viewerId?: string,
) {
  return ["entity-posts", entityType, entityId, viewerId ?? "public"] as const;
}

export function entityMembersQueryKey(
  entityType: MentionEntityTypeEnum,
  entityId: string,
  viewerId?: string,
) {
  return ["entity-members", entityType, entityId, viewerId ?? "public"] as const;
}

export function entityProfileMetadata(options: {
  // The profile's own lowercase-handle URL, which every spelling of it collapses onto.
  canonicalPath: string;
  name: string | null;
  description?: string | null;
  status?: StatusEnum;
}): Metadata {
  const { canonicalPath, name, description, status } = options;
  const title = name ?? "Halaman Tidak Ditemukan";

  return {
    title,
    description: name
      ? (description ?? `Profil resmi ${name} di HMI Connect.`)
      : "Halaman HMI Connect yang kamu cari tidak ditemukan.",
    alternates: { canonical: canonicalPath },
    robots: { index: status === "active", follow: status === "active" },
  };
}
