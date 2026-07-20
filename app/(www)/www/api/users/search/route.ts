import { NextResponse } from "next/server";
import { searchPeople } from "@/apis/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const { list, hasMore } = await searchPeople(q, { page, pageSize });

  return NextResponse.json({ data: list, hasMore });
}
