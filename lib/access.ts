import type { SessionGrant, SessionUser } from "@/apis/session";
import type { AccessEntityTypeEnum } from "@/lib/types";

// Admin route segment per hierarchy entity — the one place these five paths are spelled out.
export const ADMIN_ENTITY_BASE_PATH: Record<AccessEntityTypeEnum, string> = {
  organization: "/organizations",
  coordinating_body: "/coordinating-bodies",
  branch: "/branches",
  coordinating_chapter: "/coordinating-chapters",
  chapter: "/chapters",
};

// Indonesian label per hierarchy entity, as used in menus and "Kelola ..." links.
export const ADMIN_ENTITY_LABEL: Record<AccessEntityTypeEnum, string> = {
  organization: "Organisasi",
  coordinating_body: "Badko",
  branch: "Cabang",
  coordinating_chapter: "Korkom",
  chapter: "Komisariat",
};

export const ADMIN_ENTITY_ORDER: AccessEntityTypeEnum[] = [
  "organization",
  "coordinating_body",
  "branch",
  "coordinating_chapter",
  "chapter",
];

export function adminEntityHref(
  entityType: AccessEntityTypeEnum,
  entityId: string
): string {
  return `${ADMIN_ENTITY_BASE_PATH[entityType]}/${entityId}`;
}

// Super Admin sits outside access_grants entirely — it is the root of the grant chain.
export function isSuperAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role_name === "Super Admin";
}

export function manageGrants(user: SessionUser | null | undefined): SessionGrant[] {
  return (user?.grants ?? []).filter((grant) => grant.capability === "manage");
}

export function manageGrantsOfType(
  user: SessionUser | null | undefined,
  entityType: AccessEntityTypeEnum
): SessionGrant[] {
  return manageGrants(user).filter((grant) => grant.entity_type === entityType);
}

// Governance rule: a grant must sit at exactly this entity — one held above it confers nothing.
export function canManageEntity(
  user: SessionUser | null | undefined,
  entityType: AccessEntityTypeEnum,
  entityId: string | undefined
): boolean {
  if (isSuperAdmin(user)) return true;
  if (!entityId) return false;
  return manageGrants(user).some(
    (grant) => grant.entity_type === entityType && grant.entity_id === entityId
  );
}

// Whether the account may see the admin area at all, without saying which entity.
export function hasAnyManageAccess(
  user: SessionUser | null | undefined
): boolean {
  return isSuperAdmin(user) || manageGrants(user).length > 0;
}
