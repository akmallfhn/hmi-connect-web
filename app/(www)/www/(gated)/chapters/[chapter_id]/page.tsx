import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getChapterDetail, listAllChaptersAdmin } from "@/apis/chapters";
import { getSession } from "@/apis/session";
import { resolveActingEntity } from "@/lib/acting-entity";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import { loadEntityProfileFeeds } from "@/lib/entity-profile-data";
import {
  entityProfileHandle,
  redirectToCanonicalEntityProfile,
  resolveEntityProfileSegment,
} from "@/lib/entity-profile-route";
import { entityProfileMetadata } from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface ChapterProfileRouteProps {
  params: Promise<{ chapter_id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Shared by generateMetadata and the page, so one request resolves the segment.
const loadChapter = cache((segment: string) =>
  resolveEntityProfileSegment(segment, getChapterDetail),
);

export async function generateMetadata({
  params,
}: ChapterProfileRouteProps): Promise<Metadata> {
  const { chapter_id: segment } = await params;
  const chapter = (await loadChapter(segment))?.entity;

  return entityProfileMetadata({
    entityType: "chapter",
    handle: chapter ? entityProfileHandle(chapter) : segment,
    name: chapter ? formatEntityAuthorName("chapter", chapter.name) : null,
    description: chapter?.description,
    status: chapter?.status,
  });
}

export default async function ChapterProfile({
  params,
  searchParams,
}: ChapterProfileRouteProps) {
  const { chapter_id: segment } = await params;
  const [{ user: viewer }, resolved, query] = await Promise.all([
    getSession(),
    loadChapter(segment),
    searchParams,
  ]);

  if (!resolved || resolved.entity.status !== "active") return notFound();
  redirectToCanonicalEntityProfile("chapter", segment, resolved, query);
  const chapter = resolved.entity;
  const chapter_id = chapter.id;

  const actingEntity = await resolveActingEntity(
    viewer,

    query?.as,
  );

  // A Komisariat's own kader count is only exposed on its Cabang's chapter list row.
  const [siblings, feeds] = await Promise.all([
    listAllChaptersAdmin({ branchId: chapter.branch_id, status: "active" }),
    loadEntityProfileFeeds("chapter", chapter_id),
  ]);
  const self = siblings.find((row) => row.id === chapter_id);

  const branchHref = entityProfileHref("branch", chapter.branch_id);
  const coordinatingChapterHref = chapter.coordinating_chapter_id
    ? entityProfileHref("coordinating_chapter", chapter.coordinating_chapter_id)
    : undefined;

  return (
    <EntityProfilePage
      entity={{
        entityType: "chapter",
        entityId: chapter_id,
        mentionName: chapter.mention_name,
        name: formatEntityAuthorName("chapter", chapter.name),
        imageUrl: chapter.image_url,
        description: chapter.description,
        type: chapter.type,
        parents: [
          ...(chapter.coordinating_chapter_name
            ? [
                {
                  label: formatEntityAuthorName(
                    "coordinating_chapter",
                    chapter.coordinating_chapter_name,
                  ),
                  href: coordinatingChapterHref,
                },
              ]
            : []),
          {
            label: formatEntityAuthorName("branch", chapter.branch_name),
            href: branchHref,
          },
        ],
        stats: [{ label: "Kader", value: self?.user_count ?? 0 }],
        feeds,
        children: null,
      }}
      actingEntity={actingEntity}
      viewer={viewer}
    />
  );
}
