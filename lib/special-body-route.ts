import "server-only";

import { getOrganizationDetail } from "@/apis/organizations";
import { getSession } from "@/apis/session";
import { listSpecialBodiesAdmin } from "@/apis/special-bodies";
import type { SpecialBodyRow } from "@/components/pages/AdminSpecialBodyListPage";
import { canManageEntity, isSuperAdmin } from "@/lib/access";
import { SPECIAL_BODY_PARENT_TYPES } from "@/lib/special-body";
import type {
  AccessEntityTypeEnum,
  SpecialBodyTypeEnum,
  StatusEnum,
} from "@/lib/types";

export const SPECIAL_BODY_PAGE_SIZE = 20;

export type SpecialBodyRouteQuery = {
  search?: string;
  status?: string;
  level?: string;
  page?: string;
};

// Master creates at any allowed level; an Organization admin's grant only governs bodies hung off the organization itself.
export async function loadSpecialBodyPage({
  type,
  scope,
  organizationId,
  query,
}: {
  type: SpecialBodyTypeEnum;
  scope: "master" | "organization";
  organizationId: string | undefined;
  query: SpecialBodyRouteQuery;
}) {
  const allowedLevels = SPECIAL_BODY_PARENT_TYPES[type];
  const search = query.search?.trim() ?? "";
  const status =
    query.status === "active" || query.status === "inactive"
      ? (query.status as StatusEnum)
      : undefined;
  const level = allowedLevels.includes(query.level as AccessEntityTypeEnum)
    ? (query.level as AccessEntityTypeEnum)
    : undefined;
  const page = Math.max(1, Number(query.page ?? "1") || 1);

  const [{ user }, result, organization] = await Promise.all([
    getSession(),
    listSpecialBodiesAdmin({
      type,
      parentEntityType: level,
      status,
      search: search || undefined,
      page,
      pageSize: SPECIAL_BODY_PAGE_SIZE,
    }),
    organizationId ? getOrganizationDetail(organizationId) : null,
  ]);

  const specialBodies: SpecialBodyRow[] = result.list.map((body) => ({
    ...body,
    canManage: canManageEntity(
      user,
      body.parent_entity_type,
      body.parent_entity_id
    ),
  }));

  return {
    type,
    specialBodies,
    totalData: result.totalData,
    totalPage: result.totalPage,
    currentPage: result.currentPage,
    pageSize: SPECIAL_BODY_PAGE_SIZE,
    initialSearch: search,
    initialStatus: status ?? "",
    initialLevel: level ?? "",
    createParentLevels:
      scope === "master"
        ? allowedLevels
        : organization
          ? (["organization"] as AccessEntityTypeEnum[])
          : [],
    organization: organization
      ? { id: organization.id, name: organization.name }
      : null,
    allowDelete: scope === "master" && isSuperAdmin(user),
  };
}
