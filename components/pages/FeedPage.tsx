import PageMargin from "../common/PageMargin";
import Feed from "../feeds/Feed";
import ProfileSidebar from "../feeds/ProfileSidebar";
import RightSidebar from "../feeds/RightSidebar";
import Header from "../navigations/Header";
import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";

interface FeedPageProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  headline?: string;
  userId?: string;
  isVerified?: boolean;
  followingCount?: number;
  followersCount?: number;
  feedCount?: number;
  educationHistories?: EducationHistoryEntry[];
  trainingHistories?: TrainingHistoryEntry[];
}

export default function FeedPage({
  fullName,
  avatar,
  email,
  headline,
  userId,
  isVerified,
  followingCount,
  followersCount,
  feedCount,
  educationHistories,
  trainingHistories,
}: FeedPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header
        fullName={fullName}
        avatar={avatar}
        email={email}
        userId={userId}
        isVerified={isVerified}
      />

      <PageMargin className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:gap-6">
        <aside>
          <div className="lg:sticky lg:top-20">
            <ProfileSidebar
              fullName={fullName}
              avatar={avatar}
              headline={headline}
              userId={userId}
              isVerified={isVerified}
              followingCount={followingCount}
              followersCount={followersCount}
              feedCount={feedCount}
              educationHistories={educationHistories}
              trainingHistories={trainingHistories}
            />
          </div>
        </aside>

        <main>
          <Feed
            fullName={fullName}
            avatar={avatar}
            currentUserId={userId}
            isVerified={isVerified}
          />
        </main>

        <aside>
          <div className="lg:sticky lg:top-20">
            <RightSidebar />
          </div>
        </aside>
      </PageMargin>
    </div>
  );
}
