import PageMargin from "../common/PageMargin";
import Feed from "../feeds/Feed";
import MobileGreetingBar from "../feeds/MobileGreetingBar";
import RightSidebar from "../feeds/RightSidebar";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";

interface FeedPageProps {
  fullName?: string;
  avatar?: string;
  userId?: string;
  username?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
}

export default function FeedPage({
  fullName,
  avatar,
  userId,
  username,
  userStatus,
  verificationStatus,
}: FeedPageProps) {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Header
        fullName={fullName}
        avatar={avatar}
        userId={userId}
        username={username}
        verificationStatus={verificationStatus}
      />

      {userId && (
        <MobileGreetingBar
          fullName={fullName}
          avatar={avatar}
          username={username}
          userId={userId}
        />
      )}

      <PageMargin
        noMobilePadding
        className="grid grid-cols-1 gap-1.5 pb-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-8 lg:pt-6"
      >
        <main className="min-w-0">
          <Feed
            fullName={fullName}
            avatar={avatar}
            currentUserId={userId}
            userStatus={userStatus}
            verificationStatus={verificationStatus}
          />
        </main>

        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <RightSidebar userId={userId} />
        </aside>
      </PageMargin>

      <BottomNav userId={userId} username={username} />
    </div>
  );
}
