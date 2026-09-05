import { NextResponse } from "next/server";
import { getBranchMap } from "@/apis/stat";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const organizationId = searchParams.get("organization_id") ?? undefined;
  const coordinatingBodyId =
    searchParams.get("coordinating_body_id") ?? undefined;

  if (organizationId && coordinatingBodyId) {
    return NextResponse.json(
      { data: [], message: "Scope peta Cabang tidak valid." },
      { status: 400 },
    );
  }

  const base = { coverage: "nationwide" as const, search };
  const branchMap = organizationId
    ? await getBranchMap({ ...base, organizationId })
    : coordinatingBodyId
      ? await getBranchMap({ ...base, coordinatingBodyId })
      : await getBranchMap(base);

  return NextResponse.json({ data: branchMap?.list ?? [] });
}
