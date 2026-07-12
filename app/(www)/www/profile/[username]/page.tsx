import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstitutions } from "@/apis/institutions";
import { getSession } from "@/apis/session";
import { getSocialMediaPlatforms } from "@/apis/social-media-platforms";
import {
  getUserByUsername,
  listEducationHistories,
  listOrganizationExperiences,
  listSocialMediaAccounts,
  listTrainingHistories,
  listUserActivity,
} from "@/apis/users";
import ProfilePage from "@/components/pages/ProfilePage";

interface ProfileRouteProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfileRouteProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserByUsername(username);
  const title = profile ? profile.full_name : "Profil Tidak Ditemukan";
  const description = profile
    ? profile.headline
      ? `${profile.full_name} - ${profile.headline}`
      : `Lihat profil ${profile.full_name} di HMI Connect.`
    : "Profil HMI Connect yang kamu cari tidak ditemukan.";
  const profileUrl = `/profile/${username}`;
  const image = profile?.avatar
    ? [{ url: profile.avatar, alt: `Foto profil ${profile.full_name}` }]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${title} | HMI Connect`,
      description,
      url: profileUrl,
      type: "profile",
      images: image,
    },
    twitter: {
      card: profile?.avatar ? "summary_large_image" : "summary",
      title: `${title} | HMI Connect`,
      description,
      images: profile?.avatar ? [profile.avatar] : undefined,
    },
    robots: {
      index: profile?.status === "active",
      follow: profile?.status === "active",
    },
  };
}

export default async function Profile({ params }: ProfileRouteProps) {
  const { username } = await params;
  const { sessionToken, user: viewer } = await getSession();
  const profile = await getUserByUsername(username, sessionToken);

  if (!profile || profile.status !== "active") return notFound();

  const isOwnProfile = Boolean(viewer?.id && viewer.id === profile.id);

  // education/training/organization-experiences list are client-secret gated (like
  // getUserByUsername), so these work for anonymous visitors too.
  const [
    { list: educationHistories },
    { list: trainingHistories },
    { list: organizationExperiences },
    { list: socialMediaAccounts },
    { list: activities },
    institutions,
    socialMediaPlatforms,
    viewerProfile,
  ] = await Promise.all([
    listEducationHistories(username),
    listTrainingHistories(username),
    listOrganizationExperiences(username),
    listSocialMediaAccounts(profile.id),
    listUserActivity(username, { pageSize: 3 }),
    isOwnProfile ? getInstitutions() : Promise.resolve([]),
    isOwnProfile
      ? getSocialMediaPlatforms({ page: 1, pageSize: 20 })
      : Promise.resolve([]),
    viewer?.username
      ? getUserByUsername(viewer.username, sessionToken)
      : Promise.resolve(null),
  ]);

  return (
    <ProfilePage
      profile={{
        fullName: profile.full_name,
        avatar: profile.avatar,
        headline: profile.headline,
        bio: profile.bio,
        chapterName: profile.chapter_name,
        branchName: profile.branch_name,
        coordinatingBodyName: profile.coordinating_body_name,
        organizationName: profile.organization_name,
        isVerified: profile.is_verified,
        isSubscribe: profile.is_subscribe,
        followingCount: profile.following_count,
        followersCount: profile.followers_count,
        feedCount: profile.feed_count,
        createdAt: profile.created_at,
        isFollowedByMe: profile.is_followed_by_me,
        educationHistories,
        organizationExperiences,
        socialMediaAccounts,
        trainingHistories,
        activities,
        userId: profile.id,
        username,
      }}
      viewer={{
        fullName: viewer?.full_name,
        avatar: viewer?.avatar,
        email: viewerProfile?.email,
        userId: viewer?.id,
        username: viewer?.username,
        isVerified: viewer?.is_verified,
      }}
      isOwnProfile={isOwnProfile}
      institutions={institutions}
      socialMediaPlatforms={socialMediaPlatforms}
    />
  );
}
