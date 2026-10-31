import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { formatEntityAuthorName } from "@/lib/feed-author";
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

export function formatSpecialBodyParent(
  parentType: AccessEntityTypeEnum,
  parentName: string
): string {
  if (parentType === "organization") return parentName;
  return `${ADMIN_ENTITY_LABEL[parentType]} ${parentName}`;
}

export function suggestSpecialBodyName(
  type: SpecialBodyTypeEnum,
  parentType: AccessEntityTypeEnum,
  parentName: string
): string {
  return `${SPECIAL_BODY_LABEL[type]} ${formatEntityAuthorName(parentType, parentName)}`;
}
