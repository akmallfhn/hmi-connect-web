import { NextResponse } from "next/server";
import { searchPeople } from "@/apis/search";
import { getSession } from "@/apis/session";
import { listUsers, type ListUsersOptions } from "@/apis/users";
import { canScopeToEntityLevel } from "@/lib/access";
import type {
  AccessEntityTypeEnum,
  VerificationStatusEnum,
} from "@/lib/types";

// Query param carrying each entity scope, paired with the listUsers filter it maps onto.
const SCOPES: {
  param: string;
  entityType: AccessEntityTypeEnum;
  filter: keyof Pick<
    ListUsersOptions,
    | "chapterId"
    | "branchId"
    | "coordinatingChapterId"
    | "coordinatingBodyId"
    | "organizationId"
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
  {
    param: "organization_id",
    entityType: "organization",
    filter: "organizationId",
  },
];

function parseVerificationStatus(
  value: string | null
): VerificationStatusEnum | undefined {
  if (value === "unverified" || value === "pending" || value === "verified") {
    return value;
  }
  return undefined;
}

// Duplicate of app/(www)/www/api/users/search/route.ts — the admin subdomain is a separate origin, needs its own copy.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const scope = SCOPES.find((entry) => searchParams.get(entry.param));
  // The access-grant picker asks for verified only; the training contact-person picker sends nothing.
  const verificationStatus = parseVerificationStatus(
    searchParams.get("verification_status")
  );

  if (scope) {
    const entityId = searchParams.get(scope.param) as string;
    const { user } = await getSession();

    // users/list scopes rows to the caller's own domain, so only the filter's level is ours to check.
    if (!canScopeToEntityLevel(user, scope.entityType)) {
      return NextResponse.json({ data: [], hasMore: false }, { status: 403 });
    }

    const result = await listUsers({
      search: q.trim() || undefined,
      status: "active",
      verificationStatus,
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
