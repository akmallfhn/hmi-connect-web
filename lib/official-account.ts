import "server-only";

import { getOrganizationDetail } from "@/apis/organizations";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getBranchDetail } from "@/apis/branches";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getChapterDetail } from "@/apis/chapters";
import { getSpecialBodyDetail } from "@/apis/special-bodies";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import { formatEntityAuthorName, formatMentionEntityName } from "@/lib/feed-author";
import type { OfficialEntityTypeEnum } from "@/lib/types";

export async function loadOfficialAccountEntity(
  type: OfficialEntityTypeEnum,
  id: string,
): Promise<ComposerAuthorEntity | null> {
  switch (type) {
    case "special_body": {
      const entity = await getSpecialBodyDetail(id);
      if (!entity || entity.status !== "active") return null;
      return {
        type,
        id: entity.id,
        name: formatMentionEntityName(type, entity.name, entity.mention_name),
        imageUrl: entity.image_url,
        profileHref: `/mentions/${entity.mention_name}`,
        bodyType: entity.type,
        parentType: entity.parent_entity_type,
      };
    }
    case "organization": {
      const entity = await getOrganizationDetail(id);
      if (!entity || entity.status !== "active") return null;
      return {
        type,
        id: entity.id,
        name: formatEntityAuthorName(type, entity.name),
        imageUrl: entity.logo_url,
      };
    }
    case "coordinating_body": {
      const entity = await getCoordinatingBodyDetail(id);
      if (!entity || entity.status !== "active") return null;
      return {
        type,
        id: entity.id,
        name: formatEntityAuthorName(type, entity.name),
        imageUrl: entity.image_url,
      };
    }
    case "branch": {
      const entity = await getBranchDetail(id);
      if (!entity || entity.status !== "active") return null;
      return {
        type,
        id: entity.id,
        name: formatEntityAuthorName(type, entity.name),
        imageUrl: entity.image_url,
      };
    }
    case "coordinating_chapter": {
      const entity = await getCoordinatingChapterDetail(id);
      if (!entity || entity.status !== "active") return null;
      return {
        type,
        id: entity.id,
        name: formatEntityAuthorName(type, entity.name),
        imageUrl: entity.image_url,
      };
    }
    case "chapter": {
      const entity = await getChapterDetail(id);
      if (!entity || entity.status !== "active") return null;
      return {
        type,
        id: entity.id,
        name: formatEntityAuthorName(type, entity.name),
        imageUrl: entity.image_url,
      };
    }
  }
}
