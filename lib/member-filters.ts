import type { SelectOption } from "@/components/fields/Select";
import type { SortTypeEnum, UserSortByEnum } from "./types";

export type MemberFilterScope =
  | "master"
  | "organization"
  | "coordinating_body"
  | "branch"
  | "coordinating_chapter"
  | "chapter";

export type MemberFilterLevel =
  "coordinating_body" | "branch" | "coordinating_chapter" | "chapter";

export type MemberFilterEntity = { id: string; name: string };

// Absent means the backend default, newest registration first.
export type MemberSort = {
  by: UserSortByEnum;
  type: SortTypeEnum;
} | null;

export type MemberFilterSelection = {
  status: string;
  verificationStatus: string;
  coordinatingBody: MemberFilterEntity | null;
  branch: MemberFilterEntity | null;
  coordinatingChapter: MemberFilterEntity | null;
  chapter: MemberFilterEntity | null;
};

// The route's own entity ids, used to scope each picker to the roster being viewed.
export type MemberFilterAnchors = {
  coordinatingBodyId?: string;
  branchId?: string;
  coordinatingChapterId?: string;
};

// Hierarchy filters each roster offers — only the levels below its own scope.
export const MEMBER_FILTER_LEVELS: Record<
  MemberFilterScope,
  MemberFilterLevel[]
> = {
  master: ["coordinating_body", "branch", "coordinating_chapter", "chapter"],
  organization: [
    "coordinating_body",
    "branch",
    "coordinating_chapter",
    "chapter",
  ],
  coordinating_body: ["branch", "coordinating_chapter", "chapter"],
  branch: ["coordinating_chapter", "chapter"],
  coordinating_chapter: ["chapter"],
  chapter: [],
};

export const MEMBER_STATUS_OPTIONS: SelectOption[] = [
  { label: "Semua Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

export const MEMBER_VERIFICATION_OPTIONS: SelectOption[] = [
  { label: "Semua Status Verifikasi", value: "" },
  { label: "Tidak Terverifikasi", value: "unverified" },
  { label: "Menunggu Review", value: "pending" },
  { label: "Terverifikasi", value: "verified" },
];

export function hasMemberFilters(selection: MemberFilterSelection) {
  return Boolean(
    selection.status ||
    selection.verificationStatus ||
    selection.coordinatingBody ||
    selection.branch ||
    selection.coordinatingChapter ||
    selection.chapter,
  );
}
