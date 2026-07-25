import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Komisariat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MasterChaptersPage() {
  return (
    <MasterPlaceholderPage
      title="Komisariat"
      description="Kelola data Komisariat di bawah naungan tiap Cabang."
    />
  );
}
