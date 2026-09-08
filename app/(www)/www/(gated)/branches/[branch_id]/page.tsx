import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBranchDetail, listAllBranchesAdmin } from "@/apis/branches";
import { listAllChaptersAdmin } from "@/apis/chapters";
import { listCoordinatingChaptersAdmin } from "@/apis/coordinating-chapters";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import {
  ENTITY_TYPE_LABEL,
  entityLevelField,
  entityProfileMetadata,
  kaderMeta,
} from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface BranchProfileRouteProps {
  params: Promise<{ branch_id: string }>;
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
}: BranchProfileRouteProps) {
  const { branch_id } = await params;
  const [{ user: viewer }, branch] = await Promise.all([
    getSession(),
    getBranchDetail(branch_id),
  ]);

  if (!branch || branch.status !== "active") return notFound();

  // A Cabang's own kader/Komisariat counts are only exposed on its Badko's branch list row.
  const [siblings, chapters, coordinatingChapters, structural] =
    await Promise.all([
      listAllBranchesAdmin({
        coordinatingBodyId: branch.coordinating_body_id,
        status: "active",
      }),
      listAllChaptersAdmin({ branchId: branch_id, status: "active" }),
      listCoordinatingChaptersAdmin({
        branchId: branch_id,
        status: "active",
        pageSize: 1,
      }),
      getStructuralOverview("branch", branch_id, null),
    ]);
  const self = siblings.find((row) => row.id === branch_id);

  const coordinatingBodyName = branch.coordinating_body?.name;
  const coordinatingBodyHref = entityProfileHref(
    "coordinating_body",
    branch.coordinating_body_id
  );

  return (
    <EntityProfilePage
      entity={{
        name: formatEntityAuthorName("branch", branch.name),
        imageUrl: branch.image_url,
        description: branch.description,
        type: branch.type,
        createdAt: branch.created_at,
        affiliations: coordinatingBodyName
          ? [
              {
                label: formatEntityAuthorName(
                  "coordinating_body",
                  coordinatingBodyName
                ),
                href: coordinatingBodyHref,
              },
            ]
          : [],
        infoFields: [
          entityLevelField("branch"),
          ...(coordinatingBodyName
            ? [
                {
                  label: "Badko",
                  value: coordinatingBodyName,
                  href: coordinatingBodyHref,
                },
              ]
            : []),
          {
            label: "Status Kepengurusan",
            value: ENTITY_TYPE_LABEL[branch.type],
          },
        ],
        stats: [
          { label: "Komisariat", value: self?.chapter_count ?? chapters.length },
          { label: "Korkom", value: coordinatingChapters.totalData },
          { label: "Kader", value: self?.user_count ?? 0 },
        ],
        structuralPeriod: structural.selectedPeriod,
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
