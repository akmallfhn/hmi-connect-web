import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { listEntityActivity } from "@/apis/feeds";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import {
  entityLevelField,
  entityProfileMetadata,
  kaderMeta,
} from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingChapterProfileRouteProps {
  params: Promise<{ coordinating_chapter_id: string }>;
}

export async function generateMetadata({
  params,
}: CoordinatingChapterProfileRouteProps): Promise<Metadata> {
  const { coordinating_chapter_id } = await params;
  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id
  );

  return entityProfileMetadata({
    entityType: "coordinating_chapter",
    entityId: coordinating_chapter_id,
    name: coordinatingChapter
      ? formatEntityAuthorName(
          "coordinating_chapter",
          coordinatingChapter.name
        )
      : null,
    description: coordinatingChapter?.description,
    status: coordinatingChapter?.status,
  });
}

export default async function CoordinatingChapterProfile({
  params,
}: CoordinatingChapterProfileRouteProps) {
  const { coordinating_chapter_id } = await params;
  const [{ user: viewer }, coordinatingChapter] = await Promise.all([
    getSession(),
    getCoordinatingChapterDetail(coordinating_chapter_id),
  ]);

  if (!coordinatingChapter || coordinatingChapter.status !== "active")
    return notFound();

  const [chapters, structural, activity] = await Promise.all([
    listAllChaptersAdmin({
      coordinatingChapterId: coordinating_chapter_id,
      status: "active",
    }),
    getStructuralOverview(
      "coordinating_chapter",
      coordinating_chapter_id,
      null
    ),
    listEntityActivity("coordinating_chapter", coordinating_chapter_id, {
      pageSize: 3,
    }),
  ]);

  const branchHref = entityProfileHref("branch", coordinatingChapter.branch_id);

  return (
    <EntityProfilePage
      entity={{
        entityType: "coordinating_chapter",
        entityId: coordinating_chapter_id,
        name: formatEntityAuthorName(
          "coordinating_chapter",
          coordinatingChapter.name
        ),
        imageUrl: coordinatingChapter.image_url,
        description: coordinatingChapter.description,
        createdAt: coordinatingChapter.created_at,
        affiliations: [
          {
            label: formatEntityAuthorName(
              "branch",
              coordinatingChapter.branch_name
            ),
            href: branchHref,
          },
        ],
        infoFields: [
          entityLevelField("coordinating_chapter"),
          {
            label: "Cabang",
            value: coordinatingChapter.branch_name,
            href: branchHref,
          },
        ],
        stats: [
          { label: "Komisariat", value: chapters.length },
          {
            label: "Kader",
            value: chapters.reduce(
              (total, row) => total + (row.user_count ?? 0),
              0
            ),
          },
        ],
        structuralPeriod: structural.selectedPeriod,
        activities: activity.list,
        children: {
          title: "Daftar Komisariat",
          emptyMessage: "Belum ada Komisariat yang terdaftar.",
          items: chapters.map((row) => ({
            id: row.id,
            name: formatEntityAuthorName("chapter", row.name),
            href: entityProfileHref("chapter", row.id),
            imageUrl: row.image_url,
            meta: row.institution_name ?? kaderMeta(row.user_count),
          })),
        },
      }}
      viewer={viewer}
    />
  );
}
