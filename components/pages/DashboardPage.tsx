import PageMargin from "../common/PageMargin";
import Feed from "../dashboard/Feed";
import ProfileSidebar from "../dashboard/ProfileSidebar";
import RightSidebar from "../dashboard/RightSidebar";
import DashboardHeader from "../navigations/DashboardHeader";

interface DashboardPageProps {
  fullName?: string;
  avatar?: string;
  role?: string;
  userId?: string;
}

export default function DashboardPage({
  fullName,
  avatar,
  role,
  userId,
}: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <DashboardHeader
        fullName={fullName}
        avatar={avatar}
        role={role}
        userId={userId}
      />

      <PageMargin className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:gap-6">
        <aside>
          <div className="lg:sticky lg:top-20">
            <ProfileSidebar
              fullName={fullName}
              avatar={avatar}
              role={role}
              userId={userId}
            />
          </div>
        </aside>

        <main>
          <Feed fullName={fullName} avatar={avatar} />
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
