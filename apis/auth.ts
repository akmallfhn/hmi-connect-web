import "server-only";

import { cookies } from "next/headers";
import { callApi, type ApiEnvelope } from "./api";
import { isSuccessStatus } from "@/lib/types";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionCookie } from "./session";

export type ForgetPasswordResult = {
  expires_in_minutes?: number;
};

// Both login endpoints and the whole reset flow are authorized by the client secret — the caller holds no JWT yet.
function clientSecret() {
  const secret = process.env.CLIENT_SECRET;
  if (!secret) {
    throw new Error("CLIENT_SECRET is not configured");
  }
  return secret;
}

async function sessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// Exchanges an email or username plus password for a session JWT, then stores it the same way the Google flow does.
export async function loginWithEmail(
  identifier: string,
  password: string
): Promise<ApiEnvelope> {
  const result = await callApi<{ access_token?: string }>(
    "/api/v1/auth/login-email",
    {
      method: "POST",
      token: clientSecret(),
      body: { identifier, password },
    }
  );

  const token = result.data?.access_token;

  if (!isSuccessStatus(result.status) || !token) {
    return result;
  }

  await setSessionCookie(token);

  return result;
}

// Emails a 10-minute, single-use reset link; an unregistered address answers 404 rather than a silent success.
export async function requestPasswordReset(
  email: string
): Promise<ApiEnvelope<ForgetPasswordResult>> {
  return callApi<ForgetPasswordResult>("/api/v1/auth/forget-password", {
    method: "POST",
    token: clientSecret(),
    body: { email },
  });
}

// Checking doesn't consume the reset session — only resetPassword does.
export async function checkPasswordResetSession(
  sessionId: string
): Promise<ApiEnvelope> {
  return callApi("/api/v1/auth/reset-password/check", {
    method: "POST",
    token: clientSecret(),
    body: { session_id: sessionId },
  });
}

// Burns the reset session and ends every session the user holds, so the caller signs in again afterwards.
export async function resetPassword(
  sessionId: string,
  password: string
): Promise<ApiEnvelope> {
  return callApi("/api/v1/auth/reset-password", {
    method: "POST",
    token: clientSecret(),
    body: { session_id: sessionId, password },
  });
}

// Sets a first password on a Google-only account; 409s when one already exists.
export async function addPassword(password: string): Promise<ApiEnvelope> {
  return callApi("/api/v1/auth/password/add", {
    method: "POST",
    token: await sessionToken(),
    body: { password },
  });
}

// Replaces the password, proving ownership with the current one; existing sessions stay valid.
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ApiEnvelope> {
  return callApi("/api/v1/auth/password/change", {
    method: "POST",
    token: await sessionToken(),
    body: { old_password: oldPassword, new_password: newPassword },
  });
}
