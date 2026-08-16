import { NextResponse } from "next/server";
import { getTrainingPriorities } from "@/apis/stat";

const PAGE_SIZE = 5;

function parsePage(value: string | null) {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page > 0 ? page : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");
  const page = parsePage(searchParams.get("page"));
  const coordinatingBodyId =
    searchParams.get("coordinating_body_id") ?? undefined;
  const branchId = searchParams.get("branch_id") ?? undefined;
  const coordinatingChapterId =
    searchParams.get("coordinating_chapter_id") ?? undefined;
  const scopeCount = [
    coordinatingBodyId,
    branchId,
    coordinatingChapterId,
  ].filter(Boolean).length;

  if ((entity !== "branch" && entity !== "chapter") || page === null) {
    return NextResponse.json(
      { data: null, message: "Parameter pagination tidak valid." },
      { status: 400 },
    );
  }

  if (
    scopeCount > 1 ||
    (entity === "branch" && (branchId || coordinatingChapterId))
  ) {
    return NextResponse.json(
      { data: null, message: "Scope prioritas pengkaderan tidak valid." },
      { status: 400 },
    );
  }

  const data =
    entity === "branch"
      ? await getTrainingPriorities({
          entity,
          coordinatingBodyId,
          page,
          pageSize: PAGE_SIZE,
        })
      : coordinatingBodyId
        ? await getTrainingPriorities({
            entity,
            coordinatingBodyId,
            page,
            pageSize: PAGE_SIZE,
          })
        : branchId
          ? await getTrainingPriorities({
              entity,
              branchId,
              page,
              pageSize: PAGE_SIZE,
            })
          : coordinatingChapterId
            ? await getTrainingPriorities({
                entity,
                coordinatingChapterId,
                page,
                pageSize: PAGE_SIZE,
              })
            : await getTrainingPriorities({
                entity,
                page,
                pageSize: PAGE_SIZE,
              });

  if (!data) {
    return NextResponse.json(
      { data: null, message: "Prioritas pengkaderan gagal dimuat." },
      { status: 502 },
    );
  }

  return NextResponse.json({ data });
}
