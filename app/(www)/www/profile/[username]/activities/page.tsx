import { redirect } from "next/navigation";

interface ActivitiesRouteProps {
  params: Promise<{ username: string }>;
}

export default async function Activities({
  params,
}: ActivitiesRouteProps) {
  const { username } = await params;
  const profileHref = `/profile/${encodeURIComponent(username)}`;
  redirect(`${profileHref}?tab=activities`);
}
