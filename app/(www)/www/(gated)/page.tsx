import DashboardPage from "@/components/pages/DashboardPage";
import { getSession } from "@/apis/session";

export default async function HomePage() {
  const { user } = await getSession();

  return (
    <DashboardPage
      fullName={user?.full_name}
      avatar={user?.avatar}
      role={user?.role_name}
    />
  );
}
