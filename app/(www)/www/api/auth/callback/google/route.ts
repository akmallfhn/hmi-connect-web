import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSuccessStatus, type StatusName } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

type AuthLoginResponse = {
  code?: number;
  status?: StatusName;
  message?: string;
  data?: { access_token?: string };
};

export async function POST(request: Request) {
  const baseUrl = process.env.BASE_URL;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "BASE_URL is not configured" },
      { status: 500 }
    );
  }

  if (!clientSecret) {
    return NextResponse.json(
      { message: "CLIENT_SECRET is not configured" },
      { status: 500 }
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
      { status: 400 }
    );
  }

  const endpoint = new URL("/api/v1/auth/login", baseUrl).toString();

  const authResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_token: accessToken }),
    cache: "no-store",
  });

  let authData: AuthLoginResponse;
  try {
    authData = await authResponse.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid response from auth server" },
      { status: 502 }
    );
  }

  const sessionToken = authData.data?.access_token;

  if (!authResponse.ok || !isSuccessStatus(authData.status) || !sessionToken) {
    console.error(
      "[auth/callback/google] unexpected backend response:",
      authResponse.status,
      JSON.stringify(authData)
    );
    return NextResponse.json(
      { message: authData.message ?? "Authentication failed" },
      { status: authData.code ?? authResponse.status }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ message: authData.message ?? "Success" });
}
