import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getSession } from "@/apis/session";
import { resolveActingEntity } from "@/lib/acting-entity";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import { loadEntityProfileFeeds } from "@/lib/entity-profile-data";
import {
  canonicalEntityProfileHref,
  entityProfileHandle,
  redirectToCanonicalEntityProfile,
  resolveEntityProfileSegment,
} from "@/lib/entity-profile-route";
import { entityProfileMetadata, kaderMeta } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingChapterProfileRouteProps {
  params: Promise<{ coordinating_chapter_id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Shared by generateMetadata and the page, so one request resolves the segment.
const loadCoordinatingChapter = cache((segment: string) =>
  resolveEntityProfileSegment(segment, getCoordinatingChapterDetail),
);

export async function generateMetadata({
  params,
}: CoordinatingChapterProfileRouteProps): Promise<Metadata> {
  const { coordinating_chapter_id: segment } = await params;
  const coordinatingChapter = (await loadCoordinatingChapter(segment))?.entity;

  return entityProfileMetadata({
    canonicalPath: entityProfileHref(
      "coordinating_chapter",
      coordinatingChapter ? entityProfileHandle(coordinatingChapter) : segment,
    ),
    name: coordinatingChapter
      ? formatEntityAuthorName("coordinating_chapter", coordinatingChapter.name)
      : null,
    description: coordinatingChapter?.description,
    status: coordinatingChapter?.status,
  });
}

export default async function CoordinatingChapterProfile({
  params,
  searchParams,
}: CoordinatingChapterProfileRouteProps) {
  const { coordinating_chapter_id: segment } = await params;
  const [{ user: viewer }, resolved, query] = await Promise.all([
    getSession(),
    loadCoordinatingChapter(segment),
    searchParams,
  ]);

  if (!resolved || resolved.entity.status !== "active") return notFound();
  redirectToCanonicalEntityProfile("coordinating_chapter", segment, resolved, query);
  const coordinatingChapter = resolved.entity;
  const coordinating_chapter_id = coordinatingChapter.id;

  const actingEntity = await resolveActingEntity(viewer);

  const [chapters, feeds] = await Promise.all([
    listAllChaptersAdmin({
      coordinatingChapterId: coordinating_chapter_id,
      status: "active",
    }),
    loadEntityProfileFeeds("coordinating_chapter", coordinating_chapter_id),
  ]);

  const branchHref = entityProfileHref("branch", coordinatingChapter.branch_id);

  return (
    <EntityProfilePage
      entity={{
        entityType: "coordinating_chapter",
        entityId: coordinating_chapter_id,
        mentionName: coordinatingChapter.mention_name,
        profileHref: canonicalEntityProfileHref("coordinating_chapter", coordinatingChapter),
        name: formatEntityAuthorName(
          "coordinating_chapter",
          coordinatingChapter.name,
        ),
        imageUrl: coordinatingChapter.image_url,
        description: coordinatingChapter.description,
        parents: [
          {
            label: formatEntityAuthorName(
              "branch",
              coordinatingChapter.branch_name,
            ),
            href: branchHref,
          },
        ],
        stats: [
          { label: "Komisariat", value: chapters.length },
          {
            label: "Kader",
            value: chapters.reduce(
              (total, row) => total + (row.user_count ?? 0),
              0,
            ),
          },
        ],
        feeds,
        children: {
          tab: "chapters",
          title: "Daftar Komisariat",
          items: chapters.map((row) => ({
            id: row.id,
            name: formatEntityAuthorName("chapter", row.name),
            href: canonicalEntityProfileHref("chapter", row),
            imageUrl: row.image_url,
            meta: row.institution_name ?? kaderMeta(row.user_count),
          })),
        },
      }}
      actingEntity={actingEntity}
      viewer={viewer}
    />
  );
}
