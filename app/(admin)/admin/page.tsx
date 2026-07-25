import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import AdminDashboardPage from "@/components/pages/AdminDashboardPage";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const { user } = await getSession();
  return <AdminDashboardPage user={user} />;
}
