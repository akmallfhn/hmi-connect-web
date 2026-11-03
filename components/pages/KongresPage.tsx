import KongresCommitteeSection from "../kongres/KongresCommitteeSection";
import KongresFooter from "../kongres/KongresFooter";
import KongresHero from "../kongres/KongresHero";
import KongresHostSection from "../kongres/KongresHostSection";
import KongresLogoSection from "../kongres/KongresLogoSection";
import KongresMomentsSection from "../kongres/KongresMomentsSection";
import KongresNewsSection from "../kongres/KongresNewsSection";
import KongresRundownSection from "../kongres/KongresRundownSection";
import KongresSectionNav from "../kongres/KongresSectionNav";
import KongresVenueSection from "../kongres/KongresVenueSection";
import BottomNav from "../navigations/BottomNav";

interface KongresPageProps {
  userId?: string;
  username?: string;
}

// A campaign page: its own tournament-style chrome, no Header, and every section anchored for the sticky nav.
export default function KongresPage({ userId, username }: KongresPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface pb-16 lg:pb-0">
      {/* Desktop opens on the nav like a site header; mobile keeps the hero first and the tabs below it. */}
      <KongresSectionNav className="order-2 lg:order-1" />
      <div className="order-1 lg:order-2">
        <KongresHero />
      </div>
      <main className="order-3">
        <KongresLogoSection />
        <KongresCommitteeSection />
        <KongresHostSection />
        <KongresVenueSection />
        <KongresRundownSection />
        <KongresNewsSection />
        <KongresMomentsSection />
      </main>
      <div className="order-4">
        <KongresFooter />
      </div>
      <BottomNav userId={userId} username={username} />
    </div>
  );
}
