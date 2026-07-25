import type { Metadata } from "next";
import MasterPlaceholderPage from "@/components/pages/MasterPlaceholderPage";

export const metadata: Metadata = {
  title: "Badko",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MasterCoordinatingBodiesPage() {
  return (
    <MasterPlaceholderPage
      title="Badko"
      description="Kelola data Badan Koordinasi (Badko) tingkat wilayah."
    />
  );
}
