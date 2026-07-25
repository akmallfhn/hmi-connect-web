import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSessionCookieDomain } from "@/lib/constants";

export async function GET(request: Request) {
  const cookieDomain = getSessionCookieDomain();

  const cookieStore = await cookies();
  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
