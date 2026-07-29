import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "AD ART",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BranchAdArtPage() {
  return (
    <MasterPlaceholderPage
      title="AD ART"
      description="Anggaran Dasar dan Anggaran Rumah Tangga (AD ART) Cabang ini akan segera hadir di sini."
    />
  );
}
