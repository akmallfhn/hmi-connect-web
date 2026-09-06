import { NextResponse } from "next/server";
import { searchPeople } from "@/apis/search";
import { getSession } from "@/apis/session";
import {
  listUsers,
  listVerifiedUsers,
  type ListUsersOptions,
} from "@/apis/users";
import { canManageEntity } from "@/lib/access";
import type { AccessEntityTypeEnum } from "@/lib/types";

// Query param carrying each entity scope, paired with the listUsers filter it maps onto.
const SCOPES: {
  param: string;
  entityType: AccessEntityTypeEnum;
  filter: keyof Pick<
    ListUsersOptions,
    "chapterId" | "branchId" | "coordinatingChapterId" | "coordinatingBodyId"
  >;
}[] = [
  { param: "chapter_id", entityType: "chapter", filter: "chapterId" },
  { param: "branch_id", entityType: "branch", filter: "branchId" },
  {
    param: "coordinating_chapter_id",
    entityType: "coordinating_chapter",
    filter: "coordinatingChapterId",
  },
  {
    param: "coordinating_body_id",
    entityType: "coordinating_body",
    filter: "coordinatingBodyId",
  },
];

// Duplicate of app/(www)/www/api/users/search/route.ts — admin.(example.com) is a separate origin, needs its own copy.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const scope = SCOPES.find((entry) => searchParams.get(entry.param));
  // The access-grant picker asks for this; the training contact-person picker deliberately doesn't.
  const verifiedOnly = searchParams.get("verification_status") === "verified";

  if (scope) {
    const entityId = searchParams.get(scope.param) as string;
    const { user } = await getSession();

    if (!canManageEntity(user, scope.entityType, entityId)) {
      return NextResponse.json({ data: [], hasMore: false }, { status: 403 });
    }

    const listScopedUsers = verifiedOnly ? listVerifiedUsers : listUsers;
    const result = await listScopedUsers({
      search: q.trim() || undefined,
      status: "active",
      [scope.filter]: entityId,
      page,
      pageSize,
    });

    return NextResponse.json({
      data: result.list,
      hasMore: result.currentPage < result.totalPage,
    });
  }

  const { list, hasMore } = await searchPeople(q, { page, pageSize });

  return NextResponse.json({ data: list, hasMore });
}
