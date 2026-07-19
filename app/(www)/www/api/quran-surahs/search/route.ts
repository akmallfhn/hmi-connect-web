import { NextResponse } from "next/server";
import { listQuranSurahs } from "@/apis/quran";

// There are only 114 surahs total, so a single 100-cap page is always enough to cover
// every match — no "load more" pagination needed for search results.
const SEARCH_PAGE_SIZE = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;

  const { list } = await listQuranSurahs({
    search,
    page: 1,
    pageSize: SEARCH_PAGE_SIZE,
  });

  return NextResponse.json({ data: list });
}
