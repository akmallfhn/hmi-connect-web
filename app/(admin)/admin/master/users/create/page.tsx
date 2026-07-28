import type { Metadata } from "next";
import AdminUserCreatePage from "@/components/pages/AdminUserCreatePage";

export const metadata: Metadata = {
  title: "Tambah Pengguna",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MasterUserCreatePage() {
  return <AdminUserCreatePage />;
}
