import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";
import PageMargin from "../common/PageMargin";
import DashboardHeader from "../navigations/DashboardHeader";
import AboutCard from "../profile/AboutCard";
import ActivityCard from "../profile/ActivityCard";
import AppModals from "../modals/AppModals";
import EducationCard from "../profile/EducationCard";
import ProfileHeader from "../profile/ProfileHeader";
import TrainingCard from "../profile/TrainingCard";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
  userId?: string;
}

interface ProfileProps extends ViewerProps {
  headline?: string;
  bio?: string;
  branchName?: string;
  coordinatingBodyName?: string;
  organizationName?: string;
  isVerified?: boolean;
  isSubscribe?: boolean;
  followingCount?: number;
  followersCount?: number;
  educationHistories: EducationHistoryEntry[];
  trainingHistories: TrainingHistoryEntry[];
}

interface ProfilePageProps {
  profile: ProfileProps;
  viewer: ViewerProps;
  isOwnProfile: boolean;
}

export default function ProfilePage({
  profile,
  viewer,
  isOwnProfile,
}: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <DashboardHeader
        fullName={viewer.fullName}
        avatar={viewer.avatar}
        role={viewer.roleName}
        userId={viewer.userId}
      />

      <PageMargin className="py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <AppModals
            userId={profile.userId}
            fullName={profile.fullName}
            headline={profile.headline}
            bio={profile.bio}
            avatar={profile.avatar}
            educationHistories={profile.educationHistories}
            trainingHistories={profile.trainingHistories}
          >
            <ProfileHeader
              fullName={profile.fullName}
              avatar={profile.avatar}
              headline={profile.headline}
              branchName={profile.branchName}
              coordinatingBodyName={profile.coordinatingBodyName}
              organizationName={profile.organizationName}
              isVerified={profile.isVerified}
              isSubscribe={profile.isSubscribe}
              followingCount={profile.followingCount}
              followersCount={profile.followersCount}
              isOwnProfile={isOwnProfile}
            />
            <AboutCard bio={profile.bio} />
            <EducationCard
              entries={profile.educationHistories}
              isOwnProfile={isOwnProfile}
            />
            <TrainingCard
              entries={profile.trainingHistories}
              isOwnProfile={isOwnProfile}
            />
            <ActivityCard />
          </AppModals>
        </div>
      </PageMargin>
    </div>
  );
}
