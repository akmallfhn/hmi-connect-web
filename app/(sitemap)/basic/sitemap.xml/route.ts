import { urlsetResponse } from "@/lib/sitemap";

// Public, indexable pages whose URL never changes; everything with an id lives in its own sitemap.
export function GET() {
  return urlsetResponse([
    { path: "/auth/login" },
    { path: "/articles" },
    { path: "/trainings" },
  ]);
}
