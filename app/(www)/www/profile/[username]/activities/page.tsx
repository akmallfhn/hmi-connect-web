import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserByUsername, listUserActivity } from "@/apis/users";
import ProfileActivitiesPage from "@/components/pages/ProfileActivitiesPage";
import { resolveActingEntity } from "@/lib/acting-entity";

interface ActivitiesRouteProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ as?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: ActivitiesRouteProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserByUsername(username);
  const title = profile
    ? `Aktivitas ${profile.full_name}`
    : "Profil Tidak Ditemukan";

  return {
    title,
    alternates: { canonical: `/profile/${username}/activities` },
    robots: { index: false, follow: false },
  };
}

export default async function Activities({
  params,
  searchParams,
}: ActivitiesRouteProps) {
  const { username } = await params;
  const { as } = (await searchParams) ?? {};
  const { sessionToken, user: viewer } = await getSession();
  const [profile, actingEntity] = await Promise.all([
    getUserByUsername(username, sessionToken),
    resolveActingEntity(viewer, as),
  ]);

  if (!profile || profile.status !== "active") return notFound();

  const { list: activities, hasMore } = await listUserActivity(username, {
    page: 1,
    pageSize: 20,
  });

  return (
    <ProfileActivitiesPage
      username={username}
      initialItems={activities}
      initialHasMore={hasMore}
      actingEntity={actingEntity}
      viewer={{
        fullName: viewer?.full_name,
        avatar: viewer?.avatar,
        userId: viewer?.id,
        username: viewer?.username,
        verificationStatus: viewer?.verification_status,
      }}
    />
  );
}
