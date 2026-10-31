import { ADMIN_ENTITY_LABEL, ADMIN_ENTITY_ORDER } from "@/lib/access";
import { formatEntityAuthorName, stripEntityNamePrefix } from "@/lib/feed-author";
import type { AccessEntityTypeEnum, SpecialBodyTypeEnum } from "@/lib/types";

export const SPECIAL_BODY_LABEL: Record<SpecialBodyTypeEnum, string> = {
  kohati: "KOHATI",
  bpl: "BPL",
  balitbang: "Balitbang",
  lpp: "LPP",
};

export const SPECIAL_BODY_FULL_NAME: Record<SpecialBodyTypeEnum, string> = {
  kohati: "Korps HMI-Wati",
  bpl: "Badan Pengelola Latihan",
  balitbang: "Badan Penelitian dan Pengembangan",
  lpp: "Lembaga Pengembangan Profesi",
};

// Mirrors the backend's SpecialBodyParentTypes allowed-level check.
export const SPECIAL_BODY_PARENT_TYPES: Record<
  SpecialBodyTypeEnum,
  AccessEntityTypeEnum[]
> = {
  kohati: [
    "organization",
    "coordinating_body",
    "branch",
    "coordinating_chapter",
    "chapter",
  ],
  bpl: ["organization", "branch"],
  balitbang: ["organization"],
  lpp: ["organization", "branch"],
};

const ORGANIZATION_SHORT_NAME = "PB HMI";

// Tingkatan label; the organization level reads as PB HMI rather than "Organisasi".
export function specialBodyLevelLabel(level: AccessEntityTypeEnum): string {
  return level === "organization"
    ? ORGANIZATION_SHORT_NAME
    : ADMIN_ENTITY_LABEL[level];
}

export function specialBodyLevelRank(level: AccessEntityTypeEnum): number {
  return ADMIN_ENTITY_ORDER.indexOf(level);
}

const TYPE_PREFIX = /^(?:kohati|bpl|balitbang|lpp)\s+/i;

// The stored name is the bare unit name ("Samarinda"); type, HMI, and level prefixes are stripped off.
export function stripSpecialBodyName(
  parentType: AccessEntityTypeEnum,
  name: string
): string {
  return stripEntityNamePrefix(parentType, name.trim().replace(TYPE_PREFIX, ""));
}

export function formatSpecialBodyName(
  type: SpecialBodyTypeEnum,
  parentType: AccessEntityTypeEnum,
  name: string
): string {
  if (parentType === "organization") {
    return `${SPECIAL_BODY_LABEL[type]} ${ORGANIZATION_SHORT_NAME}`;
  }
  const bareName = stripSpecialBodyName(parentType, name) || name.trim();
  return `${SPECIAL_BODY_LABEL[type]} ${ADMIN_ENTITY_LABEL[parentType]} ${bareName}`;
}

// "Dinaungi oleh" text: HMI-prefixed entity name, with the organization written as PB HMI.
export function formatSpecialBodyParent(
  parentType: AccessEntityTypeEnum,
  parentName: string
): string {
  if (parentType === "organization") return ORGANIZATION_SHORT_NAME;
  return formatEntityAuthorName(parentType, parentName);
}
