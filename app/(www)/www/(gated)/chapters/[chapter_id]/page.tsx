import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDetail, listAllChaptersAdmin } from "@/apis/chapters";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import {
  ENTITY_TYPE_LABEL,
  entityLevelField,
  entityProfileMetadata,
} from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface ChapterProfileRouteProps {
  params: Promise<{ chapter_id: string }>;
}

export async function generateMetadata({
  params,
}: ChapterProfileRouteProps): Promise<Metadata> {
  const { chapter_id } = await params;
  const chapter = await getChapterDetail(chapter_id);

  return entityProfileMetadata({
    entityType: "chapter",
    entityId: chapter_id,
    name: chapter ? formatEntityAuthorName("chapter", chapter.name) : null,
    description: chapter?.description,
    status: chapter?.status,
  });
}

export default async function ChapterProfile({
  params,
}: ChapterProfileRouteProps) {
  const { chapter_id } = await params;
  const [{ user: viewer }, chapter] = await Promise.all([
    getSession(),
    getChapterDetail(chapter_id),
  ]);

  if (!chapter || chapter.status !== "active") return notFound();

  // A Komisariat's own kader count is only exposed on its Cabang's chapter list row.
  const [siblings, structural, activity] = await Promise.all([
    listAllChaptersAdmin({ branchId: chapter.branch_id, status: "active" }),
    getStructuralOverview("chapter", chapter_id, null),
    listEntityActivity("chapter", chapter_id, { pageSize: 3 }),
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
        name: formatEntityAuthorName("chapter", chapter.name),
        imageUrl: chapter.image_url,
        description: chapter.description,
        type: chapter.type,
        createdAt: chapter.created_at,
        affiliations: [
          {
            label: formatEntityAuthorName("branch", chapter.branch_name),
            href: branchHref,
          },
          ...(chapter.coordinating_chapter_name
            ? [
                {
                  label: formatEntityAuthorName(
                    "coordinating_chapter",
                    chapter.coordinating_chapter_name
                  ),
                  href: coordinatingChapterHref,
                },
              ]
            : []),
        ],
        infoFields: [
          entityLevelField("chapter"),
          { label: "Cabang", value: chapter.branch_name, href: branchHref },
          ...(chapter.coordinating_chapter_name
            ? [
                {
                  label: "Korkom",
                  value: chapter.coordinating_chapter_name,
                  href: coordinatingChapterHref,
                },
              ]
            : []),
          ...(chapter.institution_name
            ? [{ label: "Asal Universitas", value: chapter.institution_name }]
            : []),
          {
            label: "Status Kepengurusan",
            value: ENTITY_TYPE_LABEL[chapter.type],
          },
        ],
        stats: [{ label: "Kader", value: self?.user_count ?? 0 }],
        structuralPeriod: structural.selectedPeriod,
        activities: activity.list,
        children: null,
      }}
      viewer={viewer}
    />
  );
}
