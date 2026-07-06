import type { Institution } from "@/apis/institutions";
import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";
import PageMargin from "../common/PageMargin";
import DashboardHeader from "../navigations/DashboardHeader";
import AboutCard from "../profile/AboutCard";
import ActivityCard from "../profile/ActivityCard";
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
  institutions: Institution[];
}

export default function ProfilePage({
  profile,
  viewer,
  isOwnProfile,
  institutions,
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
          <ProfileHeader
            userId={profile.userId}
            fullName={profile.fullName}
            avatar={profile.avatar}
            headline={profile.headline}
            bio={profile.bio}
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
      </PageMargin>
    </div>
  );
}
