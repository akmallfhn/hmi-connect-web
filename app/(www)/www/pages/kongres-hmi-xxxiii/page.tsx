import type { Metadata } from "next";
import { getSession } from "@/apis/session";
import KongresPage from "@/components/pages/KongresPage";
import { KONGRES_PATH, KONGRES_THEME } from "@/lib/kongres-data";

const DESCRIPTION = `Kongres XXXIII Himpunan Mahasiswa Islam di Bandar Lampung, 28 November – 5 Desember 2026. ${KONGRES_THEME}.`;

export const metadata: Metadata = {
  title: "Kongres XXXIII HMI · Bandar Lampung 2026",
  description: DESCRIPTION,
  alternates: { canonical: KONGRES_PATH },
  openGraph: {
    title: "Kongres XXXIII HMI · Bandar Lampung 2026",
    description: DESCRIPTION,
    url: KONGRES_PATH,
    images: [{ url: "/images/kongres/logo-kongres-xxxiii.png", width: 991, height: 1200 }],
  },
};

// Public campaign page; the session only feeds BottomNav.
export default async function KongresHmiXxxiii() {
  const { user } = await getSession();
  return <KongresPage userId={user?.id} username={user?.username} />;
}
