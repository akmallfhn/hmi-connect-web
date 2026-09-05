import { NextResponse } from "next/server";
import {
  getSuspendedEntities,
  type SuspendedEntities,
  type SuspendedEntityType,
} from "@/apis/stat";

const PAGE_SIZE = 5;
const ENTITY_TYPES: SuspendedEntityType[] = [
  "coordinating_body",
  "branch",
  "coordinating_chapter",
  "chapter",
];

function parsePage(value: string | null) {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page > 0 ? page : null;
}

function isSuspendedEntityType(
  value: string | null,
): value is SuspendedEntityType {
  return ENTITY_TYPES.some((entityType) => entityType === value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entity_type");
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

  if (!isSuspendedEntityType(entityType) || page === null) {
    return NextResponse.json(
      { data: null, message: "Parameter pagination tidak valid." },
      { status: 400 },
    );
  }

  const branchScopeAllowed =
    entityType === "coordinating_chapter" || entityType === "chapter";
  const coordinatingChapterScopeAllowed = entityType === "chapter";
  if (
    scopeCount > 1 ||
    (branchId && !branchScopeAllowed) ||
    (coordinatingChapterId && !coordinatingChapterScopeAllowed)
  ) {
    return NextResponse.json(
      { data: null, message: "Scope entitas tidak aktif tidak valid." },
      { status: 400 },
    );
  }

  const paging = { page, pageSize: PAGE_SIZE };
  let data: SuspendedEntities | null;

  if (entityType === "coordinating_body" || entityType === "branch") {
    data = organizationId
      ? await getSuspendedEntities({ entityType, organizationId, ...paging })
      : coordinatingBodyId
        ? await getSuspendedEntities({
            entityType,
            coordinatingBodyId,
            ...paging,
          })
        : await getSuspendedEntities({ entityType, ...paging });
  } else if (entityType === "coordinating_chapter") {
    data = organizationId
      ? await getSuspendedEntities({ entityType, organizationId, ...paging })
      : coordinatingBodyId
        ? await getSuspendedEntities({
            entityType,
            coordinatingBodyId,
            ...paging,
          })
        : branchId
          ? await getSuspendedEntities({ entityType, branchId, ...paging })
          : await getSuspendedEntities({ entityType, ...paging });
  } else {
    data = organizationId
      ? await getSuspendedEntities({ entityType, organizationId, ...paging })
      : coordinatingBodyId
        ? await getSuspendedEntities({
            entityType,
            coordinatingBodyId,
            ...paging,
          })
        : branchId
          ? await getSuspendedEntities({ entityType, branchId, ...paging })
          : coordinatingChapterId
            ? await getSuspendedEntities({
                entityType,
                coordinatingChapterId,
                ...paging,
              })
            : await getSuspendedEntities({ entityType, ...paging });
  }

  if (!data) {
    return NextResponse.json(
      { data: null, message: "Data entitas tidak aktif gagal dimuat." },
      { status: 502 },
    );
  }

  return NextResponse.json({ data });
}
