import type { FollowRecommendationEntry } from "@/apis/users";

// How a suggested person is introduced, most self-descriptive first — never empty.
export function followRecommendationSubtitle(
  connection: FollowRecommendationEntry
): string {
  const headline = connection.headline?.trim();
  if (headline) return headline;
  if (connection.branch_name) return `Cabang ${connection.branch_name}`;
  if (connection.education_institution_name)
    return connection.education_institution_name;
  return "Pengguna HMI Connect";
}
