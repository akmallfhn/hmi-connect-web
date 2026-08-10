import Link from "next/link";
import AlQuranIcon from "../icons/AlQuranIcon";
import EKTAIcon from "../icons/EKTAIcon";
import EventIcon from "../icons/EventIcon";
import NewsIcon from "../icons/NewsIcon";

// Same destinations/icons as MobileQuickMenu, just laid out as a Facebook-style vertical
// icon+label list instead of a 4-up grid.
const MENU_ITEMS = [
  { label: "News", href: "/news", icon: NewsIcon },
  { label: "E-KTA", href: "/membership", icon: EKTAIcon },
  { label: "Al-Qur'an", href: "/quran", icon: AlQuranIcon },
  { label: "Latihan Kader", href: "/trainings", icon: EventIcon },
] as const;

export default function DesktopSidebarMenu() {
  return (
    <nav className="flex flex-col gap-1 rounded-2xl border border-[#e6e9ef] bg-white p-2 shadow-sm">
      {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-[#f5f7fb]"
        >
          <Icon className="size-11 shrink-0" />
          <span className="text-sm font-medium text-[#172033]">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
