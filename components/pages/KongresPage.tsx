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
import KongresStatsSection from "../kongres/KongresStatsSection";
import KongresVenueSection from "../kongres/KongresVenueSection";
import BottomNav from "../navigations/BottomNav";

interface KongresPageProps {
  userId?: string;
  username?: string;
}

// Campaign content laid out like any HMI Connect page: full-width card sections and a floating section nav.
export default function KongresPage({ userId, username }: KongresPageProps) {
  return (
    <div className="min-h-screen bg-surface pb-16 lg:pb-0">
      <PageMargin className="pb-24 pt-4 lg:pt-6">
        <main className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <KongresHero />
          <KongresStatsSection />
          <KongresHostSection />
          <KongresVenueSection />
          <KongresRundownSection />
          <KongresCommitteeSection />
          <KongresMomentsSection />
          <KongresNewsSection />
          <KongresLogoSection />
          <KongresPhotoCredits />
        </main>
      </PageMargin>

      <KongresFloatingNav />

      <BottomNav userId={userId} username={username} />
    </div>
  );
}
