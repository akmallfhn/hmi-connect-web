import type { Metadata } from "next";
import MasterDashboardPage from "@/components/pages/MasterDashboardPage";

export const metadata: Metadata = {
  title: "Master Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MasterPage() {
  return <MasterDashboardPage />;
}
