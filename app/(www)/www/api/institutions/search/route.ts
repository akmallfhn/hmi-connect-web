import { NextResponse } from "next/server";
import { getInstitutions } from "@/apis/institutions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");

  const institutions = await getInstitutions({ search, page, pageSize });

  return NextResponse.json({ data: institutions });
}
