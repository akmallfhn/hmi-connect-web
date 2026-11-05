import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTING_ACCOUNT_COOKIE_NAME, SESSION_COOKIE_NAME, getSessionCookieDomain } from "@/lib/constants";

export async function GET(request: Request) {
  const cookieDomain = getSessionCookieDomain();

  const cookieStore = await cookies();
  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
  cookieStore.delete({
    name: ACTING_ACCOUNT_COOKIE_NAME,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
