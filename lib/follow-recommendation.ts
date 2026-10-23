import type { FollowRecommendationEntry } from "@/apis/users";
import { formatEntityAuthorName } from "@/lib/feed-author";

// How a suggested person is introduced, most self-descriptive first — never empty.
export function followRecommendationSubtitle(
  connection: FollowRecommendationEntry
): string {
  const headline = connection.headline?.trim();
  if (headline) return headline;
  if (connection.branch_name)
    return formatEntityAuthorName("branch", connection.branch_name);
  if (connection.education_institution_name)
    return connection.education_institution_name;
  return "Pengguna HMI Connect";
}
