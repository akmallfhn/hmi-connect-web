import type { Metadata } from "next";
import FeedPage from "@/components/pages/FeedPage";
import OfficialAccountPage from "@/components/pages/OfficialAccountPage";
import { getSession } from "@/apis/session";
import { selectedActingEntityRef } from "@/lib/acting-entity";
import { loadOfficialAccountEntity } from "@/lib/official-account";
import { listFeeds } from "@/apis/feeds";
import { notFound } from "next/navigation";

const description =
  "Ikuti kabar, postingan, dan aktivitas kader HMI melalui feed HMI Connect.";

export const metadata: Metadata = {
  title: "Beranda",
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Beranda | HMI Connect",
    description,
    url: "/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HomePage() {
  const { user } = await getSession();
  const selected = await selectedActingEntityRef(user);
  if (selected) {
    const entity = await loadOfficialAccountEntity(selected.entityType, selected.entityId);
    if (!entity) notFound();
    const timeline = await listFeeds({ page: 1, pageSize: 20 });
    return (
      <OfficialAccountPage
        entityType={entity.type}
        entityId={entity.id}
        name={entity.name}
        imageUrl={entity.imageUrl}
        profileHref={entity.profileHref}
        bodyType={entity.bodyType}
        parentType={entity.parentType}
        initialItems={timeline.list}
        initialHasMore={timeline.hasMore}
        viewer={user}
      />
    );
  }

  return (
    <FeedPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      userId={user?.id}
      username={user?.username}
      userStatus={user?.status}
      verificationStatus={user?.verification_status}
      followingCount={user?.following_count}
    />
  );
}
