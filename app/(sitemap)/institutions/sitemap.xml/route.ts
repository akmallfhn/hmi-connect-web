import { searchInstitutions } from "@/apis/institutions";
import { institutionHref } from "@/lib/institution";
import { collectPages, urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// No lastmod: institutions/list carries no updated_at, and a wrong lastmod is worse than none.
export async function GET() {
  const institutions = await collectPages((page, pageSize) =>
    searchInstitutions({ page, pageSize }),
  );

  return urlsetResponse(
    institutions.map((institution) => ({
      path: institutionHref(institution.id, institution.slug),
      images: institution.image_url ? [institution.image_url] : undefined,
    })),
  );
}
