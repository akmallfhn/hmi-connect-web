import { NextResponse } from "next/server";
import { createInstitution } from "@/apis/institutions";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { data: null, message: "Name is required" },
      { status: 400 }
    );
  }

  const institution = await createInstitution(name);

  if (!institution) {
    return NextResponse.json(
      { data: null, message: "Failed to create institution" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: institution });
}
