import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Konfercab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BranchKonfercabPage() {
  return (
    <MasterPlaceholderPage
      title="Konfercab"
      description="Data Konferensi Cabang (Konfercab) akan segera hadir di sini."
    />
  );
}
