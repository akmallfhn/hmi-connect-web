import { NextResponse } from "next/server";
import { listCoordinatingChaptersAdmin } from "@/apis/coordinating-chapters";

// Korkom picker for the Daftar Kader filters; a Korkom only exists inside one Cabang, so branch_id is required.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id") ?? "";
  if (!branchId) return NextResponse.json({ data: [], hasMore: false });

  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const result = await listCoordinatingChaptersAdmin({
    branchId,
    search,
    status: "active",
    page,
    pageSize,
  });

  return NextResponse.json({
    data: result.list.map(({ id, name }) => ({ id, name })),
    hasMore: result.currentPage < result.totalPage,
  });
}
