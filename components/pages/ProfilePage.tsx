import type { Institution } from "@/apis/institutions";
import type { ActivityEntry } from "@/apis/feeds";
import type { SocialMediaPlatform } from "@/apis/social-media-platforms";
import type {
  EducationHistoryEntry,
  HonorAwardEntry,
  ProfileCompletion,
  OrganizationExperienceEntry,
  PublicationEntry,
  SocialMediaAccountEntry,
  TrainingHistoryEntry,
  WorkExperienceEntry,
} from "@/apis/users";
import type { VerificationStatusEnum } from "@/lib/types";
import PageMargin from "../common/PageMargin";
import SuggestedConnectionsCard from "../feeds/SuggestedConnectionsCard";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import ActingAwareBottomNav from "../official/ActingAwareBottomNav";
import { ActingEntityProvider } from "@/hooks/useActingEntity";
import Header from "../navigations/Header";
import AboutCard from "../profile/AboutCard";
import ActivityCard from "../profile/ActivityCard";
import EducationCard from "../profile/EducationCard";
import HonorAwardCard from "../profile/HonorAwardCard";
import OrganizationExperienceCard from "../profile/OrganizationExperienceCard";
import ProfileCompletionCard from "../profile/ProfileCompletionCard";
import ProfileHeader from "../profile/ProfileHeader";
import PublicationCard from "../profile/PublicationCard";
import TrainingCard from "../profile/TrainingCard";
import WorkExperienceCard from "../profile/WorkExperienceCard";

interface ViewerProps {
  fullName?: string;
  avatar?: string;
  memberCard?: string;
  registrationNumber?: number;
  email?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
}

interface ProfileProps extends ViewerProps {
  headline?: string;
  phoneNumber?: string;
  bio?: string;
  chapterName?: string;
  branchName?: string;
  coordinatingBodyName?: string;
  organizationName?: string;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
  followingCount?: number;
  followersCount?: number;
  feedCount?: number;
  isFollowedByMe?: boolean;
  educationHistories: EducationHistoryEntry[];
  organizationExperiences: OrganizationExperienceEntry[];
  workExperiences: WorkExperienceEntry[];
  socialMediaAccounts: SocialMediaAccountEntry[];
  trainingHistories: TrainingHistoryEntry[];
  publications: PublicationEntry[];
  honorAwards: HonorAwardEntry[];
  activities: ActivityEntry[];
}

interface ProfilePageProps {
  profile: ProfileProps;
  viewer: ViewerProps;
  isOwnProfile: boolean;
  // Set by a valid ?as=: the page is read from that entity's point of view, with no personal actions.
  actingEntity?: ComposerAuthorEntity | null;
  institutions: Institution[];
  socialMediaPlatforms: SocialMediaPlatform[];
  // Null unless this is the viewer's own, verified, still-incomplete profile.
  profileCompletion: ProfileCompletion | null;
}

export default function ProfilePage({
  profile,
  viewer,
  isOwnProfile,
  actingEntity,
  institutions,
  socialMediaPlatforms,
  profileCompletion,
}: ProfilePageProps) {
  const completionForms = {
    userId: profile.userId,
    username: profile.username,
    fullName: profile.fullName,
    headline: profile.headline,
    phoneNumber: profile.phoneNumber,
    bio: profile.bio,
    institutions,
    socialMediaPlatforms,
    socialMediaAccounts: profile.socialMediaAccounts,
    educationHistories: profile.educationHistories,
    trainingHistories: profile.trainingHistories,
    organizationExperiences: profile.organizationExperiences,
    workExperiences: profile.workExperiences,
  };

  return (
    <ActingEntityProvider entity={actingEntity ?? null}>
      <div className="min-h-screen bg-white pb-16 lg:pb-0">
        <Header
          fullName={viewer.fullName}
          avatar={viewer.avatar}
          email={viewer.email}
          userId={viewer.userId}
          username={viewer.username}
          verificationStatus={viewer.verificationStatus}
        />

        <PageMargin noMobilePadding className="pb-6 lg:py-6">
          <div className="grid grid-cols-1 gap-1.5 lg:items-start lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
              <ProfileHeader
                key={`${profile.userId}-${profile.isFollowedByMe}-${profile.followersCount}`}
                viewerId={actingEntity ? undefined : viewer.userId}
                readOnly={Boolean(actingEntity)}
                userId={profile.userId}
                username={profile.username}
                fullName={profile.fullName}
                avatar={profile.avatar}
                memberCard={profile.memberCard}
                registrationNumber={profile.registrationNumber}
                headline={profile.headline}
                phoneNumber={profile.phoneNumber}
                bio={profile.bio}
                chapterName={profile.chapterName}
                branchName={profile.branchName}
                verificationStatus={profile.verificationStatus}
                isAlumni={profile.isAlumni}
                followingCount={profile.followingCount}
                followersCount={profile.followersCount}
                isFollowedByMe={profile.isFollowedByMe}
                isOwnProfile={isOwnProfile}
                socialMediaAccounts={profile.socialMediaAccounts}
                socialMediaPlatforms={socialMediaPlatforms}
              />
              {profileCompletion && (
                <div className="lg:hidden">
                  <ProfileCompletionCard
                    completion={profileCompletion}
                    forms={completionForms}
                    collapsible
                  />
                </div>
              )}
              <AboutCard bio={profile.bio} />
              <WorkExperienceCard
                userId={profile.userId}
                entries={profile.workExperiences}
                isOwnProfile={isOwnProfile}
              />
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
              <PublicationCard
                userId={profile.userId}
                entries={profile.publications}
                isOwnProfile={isOwnProfile}
              />
              <HonorAwardCard
                userId={profile.userId}
                entries={profile.honorAwards}
                isOwnProfile={isOwnProfile}
              />
              <ActivityCard
                entries={profile.activities}
                seeAllHref={
                  profile.username
                    ? `/profile/${profile.username}/activities`
                    : undefined
                }
              />
            </div>

            <aside className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-4 lg:self-start">
              {profileCompletion && (
                <ProfileCompletionCard
                  completion={profileCompletion}
                  forms={completionForms}
                />
              )}
              {!actingEntity && <SuggestedConnectionsCard />}
            </aside>
          </div>
        </PageMargin>

        <ActingAwareBottomNav
          actingEntity={actingEntity}
          userId={viewer.userId}
          username={viewer.username}
        />
      </div>
    </ActingEntityProvider>
  );
}
