import { listTrainings } from "@/apis/trainings";
import { collectPages, urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// No lastmod: trainings/list carries no updated_at, and a wrong lastmod is worse than none.
export async function GET() {
  const trainings = await collectPages((page, pageSize) =>
    listTrainings({ page, pageSize }),
  );

  return urlsetResponse(
    trainings.map((training) => ({
      path: `/trainings/${training.id}`,
      images: training.image_url ? [training.image_url] : undefined,
    })),
  );
}
