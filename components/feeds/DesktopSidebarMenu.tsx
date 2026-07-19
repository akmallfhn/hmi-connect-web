import Link from "next/link";
import AlQuranIcon from "../icons/AlQuranIcon";
import EKTAIcon from "../icons/EKTAIcon";
import EventIcon from "../icons/EventIcon";
import NewsIcon from "../icons/NewsIcon";

// Same destinations/icons as MobileQuickMenu, just laid out as a Facebook-style vertical
// icon+label list instead of a 4-up grid — Event still has no page, so it stays href="#".
const MENU_ITEMS = [
  { label: "News", href: "/news", icon: NewsIcon, isReal: true },
  { label: "E-KTA", href: "/membership", icon: EKTAIcon, isReal: true },
  { label: "Al-Qur'an", href: "/quran", icon: AlQuranIcon, isReal: true },
  { label: "Event", href: "#", icon: EventIcon, isReal: false },
] as const;

export default function DesktopSidebarMenu() {
  return (
    <nav className="flex flex-col gap-1 rounded-2xl border border-[#e6e9ef] bg-white p-2 shadow-sm">
      {MENU_ITEMS.map(({ label, href, icon: Icon, isReal }) => {
        const content = (
          <>
            <Icon className="size-11 shrink-0" />
            <span className="text-sm font-medium text-[#172033]">{label}</span>
          </>
        );

        return isReal ? (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-[#f5f7fb]"
          >
            {content}
          </Link>
        ) : (
          <a
            key={label}
            href={href}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-[#f5f7fb]"
          >
            {content}
          </a>
        );
      })}
    </nav>
  );
}
