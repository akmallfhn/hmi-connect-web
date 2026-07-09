import { NextResponse } from "next/server";
import { searchChapters } from "@/apis/chapters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id") ?? "";
  if (!branchId) return NextResponse.json({ data: [], hasMore: false });

  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const { list, hasMore } = await searchChapters(branchId, {
    search,
    page,
    pageSize,
  });

  return NextResponse.json({ data: list, hasMore });
}
