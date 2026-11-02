import { NextResponse } from "next/server";
import { checkMentionNameAvailability } from "@/apis/entity-mentions";
import { ADMIN_ENTITY_ORDER } from "@/lib/access";
import { isSuccessStatus, type MentionEntityTypeEnum } from "@/lib/types";

const MENTION_ENTITY_TYPES: MentionEntityTypeEnum[] = [...ADMIN_ENTITY_ORDER, "special_body"];

export async function POST(request: Request) {
  let body: { mention_name?: unknown; entity_type?: unknown; entity_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "BAD_REQUEST", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const mentionName =
    typeof body.mention_name === "string" ? body.mention_name.trim() : "";
  if (!mentionName) {
    return NextResponse.json(
      { status: "BAD_REQUEST", message: "mention_name is required" },
      { status: 400 },
    );
  }

  const entityType = MENTION_ENTITY_TYPES.find((type) => type === body.entity_type);
  const entityId = typeof body.entity_id === "string" ? body.entity_id : "";
  const result = await checkMentionNameAvailability(
    mentionName,
    entityType && entityId ? { type: entityType, id: entityId } : undefined,
  );
  const statusCode =
    result.code ??
    (isSuccessStatus(result.status)
      ? 200
      : result.status === "UNAUTHORIZED"
        ? 401
        : 500);

  return NextResponse.json(result, { status: statusCode });
}
