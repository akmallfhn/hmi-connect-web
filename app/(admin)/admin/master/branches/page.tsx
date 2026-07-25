import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Cabang",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MasterBranchesPage() {
  return (
    <MasterPlaceholderPage
      title="Cabang"
      description="Kelola data dan status Cabang HMI di seluruh wilayah."
    />
  );
}
