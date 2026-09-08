import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllBranchesAdmin } from "@/apis/branches";
import {
  getCoordinatingBodyDetail,
  listCoordinatingBodiesAdmin,
} from "@/apis/coordinating-bodies";
import { getSession } from "@/apis/session";
import { getStructuralOverview } from "@/apis/structurals";
import EntityProfilePage from "@/components/pages/EntityProfilePage";
import {
  entityLevelField,
  entityProfileMetadata,
  kaderMeta,
} from "@/lib/entity-profile";
import { entityProfileHref, formatEntityAuthorName } from "@/lib/feed-author";

interface CoordinatingBodyProfileRouteProps {
  params: Promise<{ coordinating_body_id: string }>;
}

export async function generateMetadata({
  params,
}: CoordinatingBodyProfileRouteProps): Promise<Metadata> {
  const { coordinating_body_id } = await params;
  const coordinatingBody = await getCoordinatingBodyDetail(
    coordinating_body_id
  );

  return entityProfileMetadata({
    entityType: "coordinating_body",
    entityId: coordinating_body_id,
    name: coordinatingBody
      ? formatEntityAuthorName("coordinating_body", coordinatingBody.name)
      : null,
    description: coordinatingBody?.description,
    status: coordinatingBody?.status,
  });
}

export default async function CoordinatingBodyProfile({
  params,
}: CoordinatingBodyProfileRouteProps) {
  const { coordinating_body_id } = await params;
  const [{ user: viewer }, coordinatingBody] = await Promise.all([
    getSession(),
    getCoordinatingBodyDetail(coordinating_body_id),
  ]);

  if (!coordinatingBody || coordinatingBody.status !== "active")
    return notFound();

  // A Badko's own kader/Cabang counts are only exposed on the organization's own Badko list row.
  const [siblings, branches, structural] = await Promise.all([
    listCoordinatingBodiesAdmin({ status: "active", pageSize: 100 }),
    listAllBranchesAdmin({
      coordinatingBodyId: coordinating_body_id,
      status: "active",
    }),
    getStructuralOverview("coordinating_body", coordinating_body_id, null),
  ]);
  const self = siblings.list.find((row) => row.id === coordinating_body_id);

  const organizationName = coordinatingBody.organization?.name;

  return (
    <EntityProfilePage
      entity={{
        name: formatEntityAuthorName(
          "coordinating_body",
          coordinatingBody.name
        ),
        imageUrl: coordinatingBody.image_url,
        description: coordinatingBody.description,
        createdAt: coordinatingBody.created_at,
        affiliations: organizationName ? [{ label: organizationName }] : [],
        infoFields: [
          entityLevelField("coordinating_body"),
          ...(organizationName
            ? [{ label: "Organisasi", value: organizationName }]
            : []),
        ],
        stats: [
          { label: "Cabang", value: self?.branch_count ?? branches.length },
          {
            label: "Komisariat",
            value: branches.reduce(
              (total, row) => total + (row.chapter_count ?? 0),
              0
            ),
          },
          { label: "Kader", value: self?.user_count ?? 0 },
        ],
        structuralPeriod: structural.selectedPeriod,
        children: {
          title: "Daftar Cabang",
          emptyMessage: "Belum ada Cabang yang terdaftar.",
          items: branches.map((row) => ({
            id: row.id,
            name: formatEntityAuthorName("branch", row.name),
            href: entityProfileHref("branch", row.id),
            imageUrl: row.image_url,
            meta: kaderMeta(row.user_count),
          })),
        },
      }}
      viewer={viewer}
    />
  );
}
