import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "User Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MasterUsersPage() {
  return (
    <MasterPlaceholderPage
      title="User Management"
      description="Kelola akun dan hak akses pengguna HMI Connect."
    />
  );
}
