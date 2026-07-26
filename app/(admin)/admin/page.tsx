import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import AdminIndexPage from "@/components/pages/AdminIndexPage";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const { user } = await getSession();
  return <AdminIndexPage user={user} />;
}
