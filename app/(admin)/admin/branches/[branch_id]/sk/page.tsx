import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Penerbitan SK",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BranchSkPage() {
  return (
    <MasterPlaceholderPage
      title="Penerbitan SK"
      description="Penerbitan Surat Keputusan (SK) untuk Cabang ini akan segera hadir di sini."
    />
  );
}
