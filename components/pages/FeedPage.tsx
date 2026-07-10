import PageMargin from "../common/PageMargin";
import Feed from "../feeds/Feed";
import ProfileSidebar from "../feeds/ProfileSidebar";
import RightSidebar from "../feeds/RightSidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import type { EducationHistoryEntry, TrainingHistoryEntry } from "@/apis/users";

interface FeedPageProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  headline?: string;
  userId?: string;
  username?: string;
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
  username,
  isVerified,
  followingCount,
  followersCount,
  feedCount,
  educationHistories,
  trainingHistories,
}: FeedPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={fullName}
        avatar={avatar}
        email={email}
        userId={userId}
        username={username}
        isVerified={isVerified}
      />

      <PageMargin
        noMobilePadding
        className="grid grid-cols-1 gap-1.5 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]"
      >
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <div className="flex flex-col gap-4">
            <ProfileSidebar
              fullName={fullName}
              avatar={avatar}
              headline={headline}
              username={username}
              isVerified={isVerified}
              followingCount={followingCount}
              followersCount={followersCount}
              feedCount={feedCount}
              educationHistories={educationHistories}
              trainingHistories={trainingHistories}
            />
            <div className="xl:hidden">
              <RightSidebar />
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Feed
            fullName={fullName}
            avatar={avatar}
            currentUserId={userId}
            isVerified={isVerified}
          />
        </main>

        <aside className="lg:hidden xl:sticky xl:top-20 xl:block xl:self-start">
          <RightSidebar />
        </aside>
      </PageMargin>

      <BottomNav username={username} avatar={avatar} fullName={fullName} />
    </div>
  );
}
