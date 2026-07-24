import type { Metadata } from "next";
import { getSession } from "@/apis/session";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const { user } = await getSession();

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-6 py-10">
      <h1 className="text-2xl font-bold text-[#172033]">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-[#5f6573]">
        Selamat datang, {user?.full_name ?? "Admin"}.
      </p>
    </div>
  );
}
