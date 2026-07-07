import DashboardPage from "@/components/pages/DashboardPage";
import { getSession } from "@/apis/session";
import { getUserById } from "@/apis/users";

export default async function HomePage() {
  const { user } = await getSession();
  const profile = user?.id ? await getUserById(user.id) : null;

  return (
    <DashboardPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      email={profile?.email}
      role={user?.role_name}
      userId={user?.id}
      isVerified={user?.is_verified}
    />
  );
}
