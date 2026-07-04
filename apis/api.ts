import "server-only";

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  code?: number;
  status?: string;
  message?: string;
  data?: T;
};

export async function callApi<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<ApiEnvelope<T>> {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL is not configured");
  }

  const { method = "POST", body, token } = options;

  const response = await fetch(new URL(path, baseUrl).toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!data) {
    return {
      success: false,
      code: response.status,
      message: "Invalid response from server",
    };
  }

  // Some endpoints omit `success` and only report `code`/`status`/HTTP status —
  // fall back to the real HTTP status so callers don't misread a 2xx as a failure.
  return {
    ...data,
    success: data.success ?? response.ok,
  };
}
