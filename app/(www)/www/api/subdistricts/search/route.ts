import { NextResponse } from "next/server";
import { searchSubdistricts } from "@/apis/locations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = Number(searchParams.get("city_id") ?? "0");
  if (!cityId) return NextResponse.json({ data: [], hasMore: false });

  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const { list, hasMore } = await searchSubdistricts(cityId, {
    search,
    page,
    pageSize,
  });

  return NextResponse.json({ data: list, hasMore });
}
