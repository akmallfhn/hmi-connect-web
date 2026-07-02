import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session_token_hmi";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 5; // 5 years

export async function POST(request: Request) {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "BASE_URL is not configured" },
      { status: 500 },
    );
  }

  let accessToken: unknown;
  try {
    const body = await request.json();
    accessToken = body?.access_token;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json(
      { message: "access_token is required" },
      { status: 400 },
    );
  }

  const endpoint = new URL("/api/v1/auth/login", baseUrl).toString();

  const authResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
    cache: "no-store",
  });

  let authData: {
    status?: number;
    message?: string;
    session_token?: string;
    user_data?: unknown;
  };
  try {
    authData = await authResponse.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid response from auth server" },
      { status: 502 },
    );
  }

  if (!authResponse.ok || !authData.session_token) {
    return NextResponse.json(
      { message: authData.message ?? "Authentication failed" },
      { status: authResponse.ok ? 401 : authResponse.status },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, authData.session_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({
    message: authData.message ?? "Success",
    user: authData.user_data,
  });
}
