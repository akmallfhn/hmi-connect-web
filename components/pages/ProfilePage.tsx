import type { Institution } from "@/apis/institutions";
import type { SocialMediaPlatform } from "@/apis/social-media-platforms";
import type {
  EducationHistoryEntry,
  OrganizationExperienceEntry,
  SocialMediaAccountEntry,
  TrainingHistoryEntry,
} from "@/apis/users";
import PageMargin from "../common/PageMargin";
import SuggestedConnectionsCard from "../feeds/SuggestedConnectionsCard";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import AboutCard from "../profile/AboutCard";
import ActivityCard from "../profile/ActivityCard";
import EducationCard from "../profile/EducationCard";
import OrganizationExperienceCard from "../profile/OrganizationExperienceCard";
import ProfileHeader from "../profile/ProfileHeader";
import TrainingCard from "../profile/TrainingCard";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  isVerified?: boolean;
}

interface ProfileProps extends ViewerProps {
  headline?: string;
  bio?: string;
  chapterName?: string;
  branchName?: string;
  coordinatingBodyName?: string;
  organizationName?: string;
  isVerified?: boolean;
  isSubscribe?: boolean;
  followingCount?: number;
  followersCount?: number;
  feedCount?: number;
  createdAt?: string;
  isFollowedByMe?: boolean;
  educationHistories: EducationHistoryEntry[];
  organizationExperiences: OrganizationExperienceEntry[];
  socialMediaAccounts: SocialMediaAccountEntry[];
  trainingHistories: TrainingHistoryEntry[];
}

interface ProfilePageProps {
  profile: ProfileProps;
  viewer: ViewerProps;
  isOwnProfile: boolean;
  institutions: Institution[];
  socialMediaPlatforms: SocialMediaPlatform[];
}

export default function ProfilePage({
  profile,
  viewer,
  isOwnProfile,
  institutions,
  socialMediaPlatforms,
}: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        email={viewer.email}
        userId={viewer.userId}
        username={viewer.username}
        isVerified={viewer.isVerified}
      />

      <PageMargin noMobilePadding className="pb-6 lg:py-6">
        <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:items-start lg:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
            <ProfileHeader
              key={`${profile.userId}-${profile.isFollowedByMe}-${profile.followersCount}`}
              userId={profile.userId}
              username={profile.username}
              fullName={profile.fullName}
              avatar={profile.avatar}
              headline={profile.headline}
              bio={profile.bio}
              chapterName={profile.chapterName}
              branchName={profile.branchName}
              isVerified={profile.isVerified}
              isSubscribe={profile.isSubscribe}
              followingCount={profile.followingCount}
              followersCount={profile.followersCount}
              createdAt={profile.createdAt}
              isFollowedByMe={profile.isFollowedByMe}
              isOwnProfile={isOwnProfile}
              socialMediaAccounts={profile.socialMediaAccounts}
              socialMediaPlatforms={socialMediaPlatforms}
            />
            <AboutCard bio={profile.bio} />
            <OrganizationExperienceCard
              userId={profile.userId}
              entries={profile.organizationExperiences}
              isOwnProfile={isOwnProfile}
            />
            <EducationCard
              userId={profile.userId}
              entries={profile.educationHistories}
              institutions={institutions}
              isOwnProfile={isOwnProfile}
            />
            <TrainingCard
              userId={profile.userId}
              entries={profile.trainingHistories}
              isOwnProfile={isOwnProfile}
            />
            <ActivityCard />
          </div>

          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-20">
              <SuggestedConnectionsCard title="Orang yang Mungkin Kamu Kenal" />
            </div>
          </aside>
        </div>
      </PageMargin>

      <BottomNav
        username={viewer.username}
        avatar={viewer.avatar}
        fullName={viewer.fullName}
      />
    </div>
  );
}
