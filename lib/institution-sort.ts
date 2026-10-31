import type { InstitutionSortByEnum, SortTypeEnum } from "./types";

export type InstitutionSort = {
  by: InstitutionSortByEnum;
  type: SortTypeEnum;
} | null;

export const INSTITUTION_DEFAULT_SORT = "name:asc";

export const INSTITUTION_SORT_OPTIONS = [
  { label: "Nama A–Z", value: "name:asc" },
  { label: "Nama Z–A", value: "name:desc" },
  { label: "Komisariat paling sedikit", value: "chapter_count:asc" },
  { label: "Komisariat paling banyak", value: "chapter_count:desc" },
  { label: "Kader paling sedikit", value: "user_count:asc" },
  { label: "Kader paling banyak", value: "user_count:desc" },
] as const;

const SORT_BY_VALUES: InstitutionSortByEnum[] = [
  "name",
  "chapter_count",
  "user_count",
];
const SORT_TYPE_VALUES: SortTypeEnum[] = ["asc", "desc"];

export function parseInstitutionSort(query: {
  sort_by?: string;
  sort_type?: string;
}): InstitutionSort {
  return SORT_BY_VALUES.includes(query.sort_by as InstitutionSortByEnum) &&
    SORT_TYPE_VALUES.includes(query.sort_type as SortTypeEnum)
    ? {
        by: query.sort_by as InstitutionSortByEnum,
        type: query.sort_type as SortTypeEnum,
      }
    : null;
}
