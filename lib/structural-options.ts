import type { LoadOptionsResult } from "@/components/fields/SearchableSelect";
import type { StructuralEntityTypeEnum } from "./types";

// /api/users/search's scoping param per entity type — organization has none, matching AdminMemberListPage's own org-wide roster.
const ENTITY_USER_SEARCH_PARAM: Record<
  StructuralEntityTypeEnum,
  string | null
> = {
  organization: null,
  coordinating_body: "coordinating_body_id",
  branch: "branch_id",
  coordinating_chapter: "coordinating_chapter_id",
  chapter: "chapter_id",
};

export async function loadEntityUserOptions(
  entityType: StructuralEntityTypeEnum,
  entityId: string,
  inputValue: string,
  page: number
): Promise<LoadOptionsResult> {
  const params = new URLSearchParams({ q: inputValue, page: String(page) });
  const scopeParam = ENTITY_USER_SEARCH_PARAM[entityType];
  if (scopeParam) params.set(scopeParam, entityId);
  const response = await fetch(`/api/users/search?${params}`);
  const json = await response.json();
  const results: { id: string; full_name: string; avatar?: string }[] =
    json.data ?? [];
  return {
    options: results.map((item) => ({
      label: item.full_name,
      value: item.id,
      image: item.avatar,
    })),
    hasMore: Boolean(json.hasMore),
  };
}

export async function loadStructuralPositionOptions(
  inputValue: string,
  page: number
): Promise<LoadOptionsResult> {
  const params = new URLSearchParams({ q: inputValue, page: String(page) });
  const response = await fetch(`/api/structural-positions/search?${params}`);
  const json = await response.json();
  const results: { id: number; name: string }[] = json.data ?? [];
  return {
    options: results.map((item) => ({ label: item.name, value: item.id })),
    hasMore: Boolean(json.hasMore),
  };
}
