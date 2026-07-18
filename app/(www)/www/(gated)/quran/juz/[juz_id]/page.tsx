import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuranJuzDetailPage from "@/components/pages/QuranJuzDetailPage";
import { getSession } from "@/apis/session";
import { getQuranJuzDetail } from "@/apis/quran";

interface QuranJuzRouteProps {
  params: Promise<{ juz_id: string }>;
}

async function fetchJuz(juzIdParam: string) {
  const juzId = Number(juzIdParam);
  if (!Number.isFinite(juzId)) return null;
  return getQuranJuzDetail(juzId);
}

export async function generateMetadata({
  params,
}: QuranJuzRouteProps): Promise<Metadata> {
  const { juz_id } = await params;
  const juz = await fetchJuz(juz_id);

  if (!juz) {
    return {
      title: "Juz Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Juz ${juz.number} - Al-Qur'an`,
    description: `Baca Juz ${juz.number} Al-Qur'an di HMI Connect.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function QuranJuz({ params }: QuranJuzRouteProps) {
  const { juz_id } = await params;

  const [{ user }, juz] = await Promise.all([getSession(), fetchJuz(juz_id)]);

  if (!juz) notFound();

  return (
    <QuranJuzDetailPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      juz={juz}
    />
  );
}
