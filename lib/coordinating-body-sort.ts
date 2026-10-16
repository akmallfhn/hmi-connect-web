import type { CoordinatingBodySortByEnum, SortTypeEnum } from "./types";

// null means the backend default: west to east by index.
export type CoordinatingBodySort = {
  by: CoordinatingBodySortByEnum;
  type: SortTypeEnum;
} | null;

export const COORDINATING_BODY_DEFAULT_SORT = "index:asc";

export const COORDINATING_BODY_SORT_OPTIONS = [
  { label: "Indonesia Barat ke Timur", value: "index:asc" },
  { label: "Indonesia Timur ke Barat", value: "index:desc" },
  { label: "Nama A–Z", value: "name:asc" },
  { label: "Nama Z–A", value: "name:desc" },
] as const;

const SORT_BY_VALUES: CoordinatingBodySortByEnum[] = ["index", "name"];
const SORT_TYPE_VALUES: SortTypeEnum[] = ["asc", "desc"];

export function parseCoordinatingBodySort(query: {
  sort_by?: string;
  sort_type?: string;
}): CoordinatingBodySort {
  return SORT_BY_VALUES.includes(query.sort_by as CoordinatingBodySortByEnum) &&
    SORT_TYPE_VALUES.includes(query.sort_type as SortTypeEnum)
    ? {
        by: query.sort_by as CoordinatingBodySortByEnum,
        type: query.sort_type as SortTypeEnum,
      }
    : null;
}
