import { NextResponse } from "next/server";
import { checkUsernameAvailability } from "@/apis/users";
import { isSuccessStatus } from "@/lib/types";

export async function POST(request: Request) {
  let body: { username?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "BAD_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";

  if (!username) {
    return NextResponse.json(
      { status: "BAD_REQUEST", message: "username is required" },
      { status: 400 }
    );
  }

  const result = await checkUsernameAvailability(username);
  const statusCode =
    result.code ??
    (isSuccessStatus(result.status)
      ? 200
      : result.status === "UNAUTHORIZED"
        ? 401
        : 500);

  return NextResponse.json(result, { status: statusCode });
}
