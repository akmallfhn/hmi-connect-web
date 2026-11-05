import type { Metadata } from "next";
import { renderOfficialEventCreate } from "@/components/pages/OfficialEventRoutes";

export const metadata: Metadata = {
  title: "Buat Event",
  robots: { index: false, follow: false },
};

export default function CreateManagedEvent() {
  return renderOfficialEventCreate();
}
