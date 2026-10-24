import { NextResponse } from "next/server";
import { searchHashtags } from "@/apis/hashtags";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? "";
  const pageSize = Number(searchParams.get("page_size") ?? "6");
  const list = await searchHashtags(search, { pageSize });
  return NextResponse.json({ data: list });
}
