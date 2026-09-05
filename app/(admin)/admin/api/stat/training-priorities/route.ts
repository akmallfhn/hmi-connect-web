import { NextResponse } from "next/server";
import { getTrainingPriorities, type TrainingPriorities } from "@/apis/stat";

const PAGE_SIZE = 5;

function parsePage(value: string | null) {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page > 0 ? page : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity");
  const page = parsePage(searchParams.get("page"));
  const organizationId = searchParams.get("organization_id") ?? undefined;
  const coordinatingBodyId =
    searchParams.get("coordinating_body_id") ?? undefined;
  const branchId = searchParams.get("branch_id") ?? undefined;
  const coordinatingChapterId =
    searchParams.get("coordinating_chapter_id") ?? undefined;
  const scopeCount = [
    organizationId,
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

  const paging = { page, pageSize: PAGE_SIZE };
  let data: TrainingPriorities | null;

  if (entity === "branch") {
    data = organizationId
      ? await getTrainingPriorities({ entity, organizationId, ...paging })
      : coordinatingBodyId
        ? await getTrainingPriorities({ entity, coordinatingBodyId, ...paging })
        : await getTrainingPriorities({ entity, ...paging });
  } else {
    data = organizationId
      ? await getTrainingPriorities({ entity, organizationId, ...paging })
      : coordinatingBodyId
        ? await getTrainingPriorities({ entity, coordinatingBodyId, ...paging })
        : branchId
          ? await getTrainingPriorities({ entity, branchId, ...paging })
          : coordinatingChapterId
            ? await getTrainingPriorities({
                entity,
                coordinatingChapterId,
                ...paging,
              })
            : await getTrainingPriorities({ entity, ...paging });
  }

  if (!data) {
    return NextResponse.json(
      { data: null, message: "Prioritas pengkaderan gagal dimuat." },
      { status: 502 },
    );
  }

  return NextResponse.json({ data });
}
