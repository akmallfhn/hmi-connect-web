import { sitemapIndexResponse } from "@/lib/sitemap";

// The index only names the per-type sitemaps; each one fetches its own data when a crawler asks for it.
export function GET() {
  return sitemapIndexResponse([
    { path: "/basic/sitemap.xml" },
    { path: "/articles/sitemap.xml" },
    { path: "/trainings/sitemap.xml" },
  ]);
}
