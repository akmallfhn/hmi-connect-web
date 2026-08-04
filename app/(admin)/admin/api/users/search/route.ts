import { NextResponse } from "next/server";
import { searchPeople } from "@/apis/search";
import { getSession } from "@/apis/session";
import { listUsers } from "@/apis/users";

// Duplicate of app/(www)/www/api/users/search/route.ts — admin.(example.com) is a separate origin, needs its own copy.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const branchId = searchParams.get("branch_id") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  if (branchId) {
    const { user } = await getSession();
    const canAccessBranch =
      user?.role_name === "Super Admin" ||
      (user?.can_manage_branch === true && user.branch_id === branchId);

    if (!canAccessBranch) {
      return NextResponse.json(
        { data: [], hasMore: false },
        { status: 403 }
      );
    }

    const result = await listUsers({
      search: q.trim() || undefined,
      status: "active",
      branchId,
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
