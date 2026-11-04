import "server-only";

import { getOrganizationDetail } from "@/apis/organizations";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getBranchDetail } from "@/apis/branches";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getChapterDetail } from "@/apis/chapters";
import type { ComposerAuthorEntity } from "@/components/forms/CreateFeedForms";
import { formatEntityAuthorName } from "@/lib/feed-author";
import type { AccessEntityTypeEnum } from "@/lib/types";

export async function loadOfficialAccountEntity(
  type: AccessEntityTypeEnum,
  id: string,
): Promise<ComposerAuthorEntity | null> {
  switch (type) {
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
