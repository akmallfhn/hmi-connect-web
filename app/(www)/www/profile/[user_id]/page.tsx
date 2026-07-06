import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/apis/session";
import { getUserById } from "@/apis/users";
import ProfilePage from "@/components/pages/ProfilePage";

interface ProfileRouteProps {
  params: Promise<{ user_id: string }>;
}

export async function generateMetadata({
  params,
}: ProfileRouteProps): Promise<Metadata> {
  const { user_id } = await params;
  const profile = await getUserById(user_id);

  return {
    title: profile
      ? `${profile.full_name} | HMI Connect`
      : "Profil Tidak Ditemukan | HMI Connect",
  };
}

export default async function Profile({ params }: ProfileRouteProps) {
  const { user_id } = await params;
  const [profile, { user: viewer }] = await Promise.all([
    getUserById(user_id),
    getSession(),
  ]);

  if (!profile) return notFound();

  return (
    <ProfilePage
      profile={{
        fullName: profile.full_name,
        avatar: profile.avatar,
        headline: profile.headline,
        bio: profile.bio,
        branchName: profile.branch_name,
        coordinatingBodyName: profile.coordinating_body_name,
        organizationName: profile.organization_name,
        isVerified: profile.is_verified,
        isSubscribe: profile.is_subscribe,
        followingCount: profile.following_count,
        followersCount: profile.followers_count,
        educationHistories: profile.education_histories,
        trainingHistories: profile.training_histories,
        userId: profile.id,
      }}
      viewer={{
        fullName: viewer?.full_name,
        avatar: viewer?.avatar,
        roleName: viewer?.role_name,
        userId: viewer?.id,
      }}
      isOwnProfile={Boolean(viewer?.id && viewer.id === profile.id)}
    />
  );
}
