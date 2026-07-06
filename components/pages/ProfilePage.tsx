import PageMargin from "../common/PageMargin";
import DashboardHeader from "../dashboard/DashboardHeader";
import AboutCard from "../profile/AboutCard";
import ActivityCard from "../profile/ActivityCard";
import EducationCard from "../profile/EducationCard";
import ProfileHeader from "../profile/ProfileHeader";
import TrainingCard from "../profile/TrainingCard";

interface ProfilePageProps {
  fullName?: string;
  avatar?: string;
  roleName?: string;
  branchName?: string;
  coordinatingBodyName?: string;
  organizationName?: string;
  isVerified?: boolean;
  isSubscribe?: boolean;
}

export default function ProfilePage({
  fullName,
  avatar,
  roleName,
  branchName,
  coordinatingBodyName,
  organizationName,
  isVerified,
  isSubscribe,
}: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <DashboardHeader fullName={fullName} avatar={avatar} role={roleName} />

      <PageMargin className="py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <ProfileHeader
            fullName={fullName}
            avatar={avatar}
            roleName={roleName}
            branchName={branchName}
            coordinatingBodyName={coordinatingBodyName}
            organizationName={organizationName}
            isVerified={isVerified}
            isSubscribe={isSubscribe}
          />
          <AboutCard />
          <EducationCard />
          <TrainingCard />
          <ActivityCard />
        </div>
      </PageMargin>
    </div>
  );
}
