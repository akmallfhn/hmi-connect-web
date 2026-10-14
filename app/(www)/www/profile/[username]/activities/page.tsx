import { redirect } from "next/navigation";

interface ActivitiesRouteProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ as?: string | string[] }>;
}

export default async function Activities({
  params,
  searchParams,
}: ActivitiesRouteProps) {
  const { username } = await params;
  const { as } = (await searchParams) ?? {};
  const profileHref = `/profile/${encodeURIComponent(username)}`;
  const actingParam =
    typeof as === "string" ? `?as=${encodeURIComponent(as)}` : "";

  redirect(`${profileHref}${actingParam}`);
}
