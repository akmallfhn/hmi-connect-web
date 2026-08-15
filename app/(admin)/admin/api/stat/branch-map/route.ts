import { NextResponse } from "next/server";
import { getBranchMap } from "@/apis/stat";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const coordinatingBodyId =
    searchParams.get("coordinating_body_id") ?? undefined;
  const branchMap = await getBranchMap({
    coverage: "nationwide",
    coordinatingBodyId,
    search,
  });

  return NextResponse.json({ data: branchMap?.list ?? [] });
}
