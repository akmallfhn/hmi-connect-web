import { NextResponse } from "next/server";
import { searchProvinces } from "@/apis/locations";

// Duplicate of app/(www)/www/api/provinces/search/route.ts — see the note in ../branches/search/route.ts.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const { list, hasMore } = await searchProvinces({ search, page, pageSize });

  return NextResponse.json({ data: list, hasMore });
}
