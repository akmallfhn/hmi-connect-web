import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Latihan Kader 2",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BranchLk2Page() {
  return (
    <MasterPlaceholderPage
      title="Latihan Kader 2"
      description="Data penyelenggaraan Latihan Kader 2 (LK2) Cabang ini akan segera hadir di sini."
    />
  );
}
