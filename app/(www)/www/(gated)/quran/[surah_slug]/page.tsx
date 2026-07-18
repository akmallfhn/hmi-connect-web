import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuranSurahDetailPage from "@/components/pages/QuranSurahDetailPage";
import { getSession } from "@/apis/session";
import { getQuranSurahDetail } from "@/apis/quran";

interface QuranSurahRouteProps {
  params: Promise<{ surah_slug: string }>;
}

export async function generateMetadata({
  params,
}: QuranSurahRouteProps): Promise<Metadata> {
  const { surah_slug } = await params;
  const surah = await getQuranSurahDetail(surah_slug);

  if (!surah) {
    return {
      title: "Surah Tidak Ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${surah.name_latin} - Al-Qur'an`,
    description: surah.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function QuranSurah({ params }: QuranSurahRouteProps) {
  const { surah_slug } = await params;

  const [{ user }, surah] = await Promise.all([
    getSession(),
    getQuranSurahDetail(surah_slug),
  ]);

  if (!surah) notFound();

  return (
    <QuranSurahDetailPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      surah={surah}
    />
  );
}
