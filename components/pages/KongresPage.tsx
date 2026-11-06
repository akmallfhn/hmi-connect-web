import type { NewsArticle } from "@/apis/news";
import PageMargin from "../common/PageMargin";
import KongresCommitteeSection from "../kongres/KongresCommitteeSection";
import KongresHero from "../kongres/KongresHero";
import KongresHostSection from "../kongres/KongresHostSection";
import KongresLogoSection from "../kongres/KongresLogoSection";
import KongresMomentsSection from "../kongres/KongresMomentsSection";
import KongresNewsSection from "../kongres/KongresNewsSection";
import KongresPhotoCredits from "../kongres/KongresPhotoCredits";
import KongresRundownSection from "../kongres/KongresRundownSection";
import KongresFloatingNav from "../kongres/KongresFloatingNav";
import KongresVenueSection from "../kongres/KongresVenueSection";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";

interface KongresPageProps {
  userId?: string;
  username?: string;
  newsArticles: NewsArticle[];
}

// Campaign content laid out like any HMI Connect page: full-width card sections and a floating section nav.
export default function KongresPage({ userId, username, newsArticles }: KongresPageProps) {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <Header mobileBrandOnly />
      <PageMargin className="pb-24 pt-4 lg:pt-6">
        <main className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <KongresHero canShareToFeed={Boolean(userId)} />
          <KongresHostSection />
          <KongresVenueSection />
          <KongresRundownSection />
          <KongresCommitteeSection />
          <KongresMomentsSection />
          <KongresNewsSection articles={newsArticles} />
          <KongresLogoSection />
          <KongresPhotoCredits />
        </main>
      </PageMargin>

      <KongresFloatingNav />

      <BottomNav userId={userId} username={username} />
    </div>
  );
}
