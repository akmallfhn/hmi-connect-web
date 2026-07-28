import { NextResponse } from "next/server";
import { searchCities } from "@/apis/locations";

// Duplicate of app/(www)/www/api/cities/search/route.ts — see the note in ../branches/search/route.ts.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = Number(searchParams.get("province_id") ?? "0");
  if (!provinceId) return NextResponse.json({ data: [], hasMore: false });

  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const { list, hasMore } = await searchCities(provinceId, {
    search,
    page,
    pageSize,
  });

  return NextResponse.json({ data: list, hasMore });
}
