import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail, listAllBranchesAdmin } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { listCoordinatingChaptersAdmin } from "@/apis/coordinating-chapters";
import { getSession } from "@/apis/session";
import { resolveActingEntity } from "@/lib/acting-entity";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import { loadEntityProfileFeeds } from "@/lib/entity-profile-data";
import { entityProfileMetadata, kaderMeta } from "@/lib/entity-profile";
import { ORGANIZATION_SHORT_NAME } from "@/lib/constants";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface BranchProfileRouteProps {
  params: Promise<{ branch_id: string }>;
  searchParams?: Promise<{ as?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: BranchProfileRouteProps): Promise<Metadata> {
  const { branch_id } = await params;
  const branch = await getBranchDetail(branch_id);

  return entityProfileMetadata({
    entityType: "branch",
    entityId: branch_id,
    name: branch ? formatEntityAuthorName("branch", branch.name) : null,
    description: branch?.description,
    status: branch?.status,
  });
}

export default async function BranchProfile({
  params,
  searchParams,
}: BranchProfileRouteProps) {
  const { branch_id } = await params;
  const [{ user: viewer }, branch] = await Promise.all([
    getSession(),
    getBranchDetail(branch_id),
  ]);

  if (!branch || branch.status !== "active") return notFound();

  const actingEntity = await resolveActingEntity(
    viewer,

    (await searchParams)?.as,
  );

  // A Cabang's own kader/Komisariat counts are only exposed on its parent's branch list row.
  const [siblings, chapters, coordinatingChapters, feeds] =
    await Promise.all([
      listAllBranchesAdmin({
        ...(branch.coordinating_body_id
          ? { coordinatingBodyId: branch.coordinating_body_id }
          : { organizationId: branch.organization_id }),
        status: "active",
      }),
      listAllChaptersAdmin({ branchId: branch_id, status: "active" }),
      listCoordinatingChaptersAdmin({
        branchId: branch_id,
        status: "active",
        pageSize: 1,
      }),
      loadEntityProfileFeeds("branch", branch_id),
    ]);
  const self = siblings.find((row) => row.id === branch_id);

  // A special or Badko-less Cabang sits directly under PB HMI.
  const parent = branch.coordinating_body
    ? {
        label: formatEntityAuthorName(
          "coordinating_body",
          branch.coordinating_body.name,
        ),
        href: entityProfileHref("coordinating_body", branch.coordinating_body.id),
      }
    : {
        label: ORGANIZATION_SHORT_NAME,
        href: entityProfileHref("organization", branch.organization_id),
      };

  return (
    <EntityProfilePage
      entity={{
        entityType: "branch",
        entityId: branch_id,
        name: formatEntityAuthorName("branch", branch.name),
        imageUrl: branch.image_url,
        description: branch.description,
        type: branch.type,
        parents: [parent],
        stats: [
          {
            label: "Komisariat",
            value: self?.chapter_count ?? chapters.length,
          },
          { label: "Korkom", value: coordinatingChapters.totalData },
          { label: "Kader", value: self?.user_count ?? 0 },
        ],
        feeds,
        children: {
          tab: "chapters",
          title: "Daftar Komisariat",
          items: chapters.map((row) => ({
            id: row.id,
            name: formatEntityAuthorName("chapter", row.name),
            href: entityProfileHref("chapter", row.id),
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
