import type { Metadata } from "next";
import QuranPage from "@/components/pages/QuranPage";
import { getSession } from "@/apis/session";
import { listAllQuranJuz, listAllQuranSurahs } from "@/apis/quran";

export const metadata: Metadata = {
  title: "Al-Qur'an",
  description: "Baca Al-Qur'an — daftar surah dan juz, lengkap dengan murottal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Quran() {
  const { user } = await getSession();

  const [surahs, juz] = await Promise.all([
    listAllQuranSurahs(),
    listAllQuranJuz(),
  ]);

  return (
    <QuranPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        isVerified: user?.is_verified,
      }}
      surahs={surahs}
      juz={juz}
    />
  );
}
