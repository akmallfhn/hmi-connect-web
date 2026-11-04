import { NextResponse } from "next/server";
import { searchResults } from "@/apis/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const { list, hasMore } = await searchResults("entity", keyword, {
    page,
    pageSize,
  });

  return NextResponse.json({ data: list, hasMore });
}
