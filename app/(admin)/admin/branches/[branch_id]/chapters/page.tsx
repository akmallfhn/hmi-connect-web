import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Kelola Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BranchChaptersPage() {
  return (
    <MasterPlaceholderPage
      title="Kelola Komisariat"
      description="Daftar dan pengaturan Komisariat di bawah Cabang ini akan segera hadir di sini."
    />
  );
}
