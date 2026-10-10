import "server-only";

import { getBranchDetail } from "@/apis/branches";
import { getChapterDetail } from "@/apis/chapters";
import { getCoordinatingBodyDetail } from "@/apis/coordinating-bodies";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import type { ListUsersOptions } from "@/apis/users";
import {
  MEMBER_FILTER_LEVELS,
  MEMBER_STATUS_OPTIONS,
  MEMBER_VERIFICATION_OPTIONS,
  type MemberFilterLevel,
  type MemberFilterScope,
  type MemberFilterSelection,
  type MemberSort,
} from "./member-filters";
import type {
  SortTypeEnum,
  UserSortByEnum,
  UserStatusEnum,
  VerificationStatusEnum,
} from "./types";

const SORT_BY_VALUES: UserSortByEnum[] = ["created_at", "full_name"];
const SORT_TYPE_VALUES: SortTypeEnum[] = ["asc", "desc"];

export type MemberFilterQuery = {
  search?: string;
  status?: string;
  verification_status?: string;
  coordinating_body_id?: string;
  branch_id?: string;
  coordinating_chapter_id?: string;
  chapter_id?: string;
  sort_by?: string;
  sort_type?: string;
  page?: string;
};

export type MemberRouteScope = {
  scope: MemberFilterScope;
  organizationId?: string;
  coordinatingBodyId?: string;
  branchId?: string;
  coordinatingChapterId?: string;
  chapterId?: string;
};

function isOptionValue(options: { value: unknown }[], value: string) {
  return Boolean(value) && options.some((option) => option.value === value);
}

// Turns a roster's query string into users/list options, dropping any pick outside the route's own scope.
export async function resolveMemberFilters(
  route: MemberRouteScope,
  query: MemberFilterQuery,
) {
  const levels = MEMBER_FILTER_LEVELS[route.scope];
  const pick = (level: MemberFilterLevel, value?: string) =>
    levels.includes(level) ? (value?.trim() ?? "") : "";

  const coordinatingBodyId = pick(
    "coordinating_body",
    query.coordinating_body_id,
  );
  const branchId = pick("branch", query.branch_id);
  const coordinatingChapterId = pick(
    "coordinating_chapter",
    query.coordinating_chapter_id,
  );
  const chapterId = pick("chapter", query.chapter_id);

  const [bodyDetail, branchDetail, korkomDetail, chapterDetail] =
    await Promise.all([
      coordinatingBodyId ? getCoordinatingBodyDetail(coordinatingBodyId) : null,
      branchId ? getBranchDetail(branchId) : null,
      coordinatingChapterId
        ? getCoordinatingChapterDetail(coordinatingChapterId)
        : null,
      chapterId ? getChapterDetail(chapterId) : null,
    ]);

  const coordinatingBody =
    bodyDetail &&
    (!route.organizationId ||
      bodyDetail.organization_id === route.organizationId)
      ? bodyDetail
      : null;
  const bodyAnchor = coordinatingBody?.id ?? route.coordinatingBodyId;
  const branch =
    branchDetail &&
    (!bodyAnchor || branchDetail.coordinating_body_id === bodyAnchor)
      ? branchDetail
      : null;
  const branchAnchor = branch?.id ?? route.branchId;
  const coordinatingChapter =
    korkomDetail && branchAnchor && korkomDetail.branch_id === branchAnchor
      ? korkomDetail
      : null;
  const korkomAnchor = coordinatingChapter?.id ?? route.coordinatingChapterId;
  const chapter =
    chapterDetail &&
    (branchAnchor || korkomAnchor) &&
    (!branchAnchor || chapterDetail.branch_id === branchAnchor) &&
    (!korkomAnchor || chapterDetail.coordinating_chapter_id === korkomAnchor)
      ? chapterDetail
      : null;

  const status = isOptionValue(MEMBER_STATUS_OPTIONS, query.status ?? "")
    ? (query.status as UserStatusEnum)
    : undefined;
  const verificationStatus = isOptionValue(
    MEMBER_VERIFICATION_OPTIONS,
    query.verification_status ?? "",
  )
    ? (query.verification_status as VerificationStatusEnum)
    : undefined;

  // users/list takes at most one hierarchy id, so the most specific pick replaces the route's own scope.
  const hierarchy: ListUsersOptions = chapter
    ? { chapterId: chapter.id }
    : coordinatingChapter
      ? { coordinatingChapterId: coordinatingChapter.id }
      : branch
        ? { branchId: branch.id }
        : coordinatingBody
          ? { coordinatingBodyId: coordinatingBody.id }
          : route.chapterId
            ? { chapterId: route.chapterId }
            : route.coordinatingChapterId
              ? { coordinatingChapterId: route.coordinatingChapterId }
              : route.branchId
                ? { branchId: route.branchId }
                : route.coordinatingBodyId
                  ? { coordinatingBodyId: route.coordinatingBodyId }
                  : {};

  const sort: MemberSort =
    SORT_BY_VALUES.includes(query.sort_by as UserSortByEnum) &&
    SORT_TYPE_VALUES.includes(query.sort_type as SortTypeEnum)
      ? {
          by: query.sort_by as UserSortByEnum,
          type: query.sort_type as SortTypeEnum,
        }
      : null;

  const search = query.search?.trim() ?? "";
  const page = Number(query.page ?? "1") || 1;
  const toEntity = (entity: { id: string; name: string } | null) =>
    entity ? { id: entity.id, name: entity.name } : null;

  const selection: MemberFilterSelection = {
    status: status ?? "",
    verificationStatus: verificationStatus ?? "",
    coordinatingBody: toEntity(coordinatingBody),
    branch: toEntity(branch),
    coordinatingChapter: toEntity(coordinatingChapter),
    chapter: toEntity(chapter),
  };

  const listOptions: ListUsersOptions = {
    ...hierarchy,
    search: search || undefined,
    status,
    verificationStatus,
    sortBy: sort?.by,
    sortType: sort?.type,
    page,
  };

  return { search, selection, sort, listOptions };
}
