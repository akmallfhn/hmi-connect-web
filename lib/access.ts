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
  entityId: string,
): string {
  return `${ADMIN_ENTITY_BASE_PATH[entityType]}/${entityId}`;
}

// The entity's own official-account surface on the main site, one route per level.
export function officialEntityHref(
  entityType: AccessEntityTypeEnum,
  entityId: string,
): string {
  return `/official${adminEntityHref(entityType, entityId)}`;
}

// The inverse of officialEntityHref, so the desktop rail can tell which entity page it sits on.
export function parseOfficialEntityPath(
  pathname: string,
): { entityType: AccessEntityTypeEnum; entityId: string } | null {
  const match = pathname.match(/^\/official(\/[^/]+)\/([^/]+)/);
  if (!match) return null;
  const entry = Object.entries(ADMIN_ENTITY_BASE_PATH).find(
    ([, basePath]) => basePath === match[1],
  );
  if (!entry) return null;
  return {
    entityType: entry[0] as AccessEntityTypeEnum,
    entityId: decodeURIComponent(match[2]),
  };
}

// `?as=branch:{id}` lets /feeds/* and /profile/* render from an official account's point of view.
export const ACTING_ENTITY_PARAM = "as";

export type ActingEntityRef = {
  entityType: AccessEntityTypeEnum;
  entityId: string;
};

export function formatActingEntityParam(entity: ActingEntityRef): string {
  return `${entity.entityType}:${entity.entityId}`;
}

export function parseActingEntityParam(
  value: string | string[] | null | undefined,
): ActingEntityRef | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const separator = raw.indexOf(":");
  const entityType = raw.slice(0, separator);
  const entityId = raw.slice(separator + 1);
  if (separator < 1 || !entityId || !(entityType in ADMIN_ENTITY_BASE_PATH)) {
    return null;
  }
  return { entityType: entityType as AccessEntityTypeEnum, entityId };
}

// Feed detail, user profiles, and the five entity profiles understand the param; nothing else does.
const ACTING_ENTITY_PATH = new RegExp(
  `^/(feeds|profile|${Object.values(ADMIN_ENTITY_BASE_PATH)
    .map((path) => path.slice(1))
    .join("|")})/`,
);

export function supportsActingEntity(pathname: string): boolean {
  return ACTING_ENTITY_PATH.test(pathname);
}

export function withActingEntity(
  href: string,
  entity: ActingEntityRef | null | undefined,
): string {
  if (!entity || !supportsActingEntity(href)) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${ACTING_ENTITY_PARAM}=${encodeURIComponent(
    formatActingEntityParam(entity),
  )}`;
}

// Super Admin sits outside access_grants entirely — it is the root of the grant chain.
export function isSuperAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role_name === "Super Admin";
}

export function manageGrants(
  user: SessionUser | null | undefined,
): SessionGrant[] {
  return (user?.grants ?? []).filter((grant) => grant.capability === "manage");
}

export function manageGrantsOfType(
  user: SessionUser | null | undefined,
  entityType: AccessEntityTypeEnum,
): SessionGrant[] {
  return manageGrants(user).filter((grant) => grant.entity_type === entityType);
}

// An accepted grant at exactly this entity, with no Super Admin shortcut.
export function holdsGrantAtEntity(
  user: SessionUser | null | undefined,
  entityType: AccessEntityTypeEnum,
  entityId: string | undefined,
): boolean {
  if (!entityId) return false;
  return manageGrants(user).some(
    (grant) => grant.entity_type === entityType && grant.entity_id === entityId,
  );
}

// Governance rule: a grant must sit at exactly this entity — one held above it confers nothing.
export function canManageEntity(
  user: SessionUser | null | undefined,
  entityType: AccessEntityTypeEnum,
  entityId: string | undefined,
): boolean {
  return isSuperAdmin(user) || holdsGrantAtEntity(user, entityType, entityId);
}

// Read rule: a grant reaches its own level and every level beneath it, never the ones above.
export function canScopeToEntityLevel(
  user: SessionUser | null | undefined,
  entityType: AccessEntityTypeEnum,
): boolean {
  if (isSuperAdmin(user)) return true;
  const targetLevel = ADMIN_ENTITY_ORDER.indexOf(entityType);
  return manageGrants(user).some(
    (grant) => ADMIN_ENTITY_ORDER.indexOf(grant.entity_type) <= targetLevel,
  );
}

// Whether the account may see the admin area at all, without saying which entity.
export function hasAnyManageAccess(
  user: SessionUser | null | undefined,
): boolean {
  return isSuperAdmin(user) || manageGrants(user).length > 0;
}
