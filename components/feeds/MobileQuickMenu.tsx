import Link from "next/link";
import AlQuranIcon from "../icons/AlQuranIcon";
import EKTAIcon from "../icons/EKTAIcon";
import EventIcon from "../icons/EventIcon";
import NewsIcon from "../icons/NewsIcon";

// Event has no page built yet, so it's still an href="#" placeholder (plain <a>, not
// <Link>) — News, E-KTA, and Al-Qur'an route to real pages.
const MENU_ITEMS = [
  { label: "News", href: "/news", icon: NewsIcon, isReal: true },
  { label: "E-KTA", href: "/membership", icon: EKTAIcon, isReal: true },
  { label: "Event", href: "#", icon: EventIcon, isReal: false },
  { label: "Al-Qur'an", href: "/quran", icon: AlQuranIcon, isReal: true },
] as const;

export default function MobileQuickMenu() {
  return (
    <div className="grid grid-cols-4 gap-2 border border-x-0 border-[#e6e9ef] bg-white px-4 py-4">
      {MENU_ITEMS.map(({ label, href, icon: Icon, isReal }) => {
        const content = (
          <>
            <Icon className="size-14" />
            <span className="text-center text-sm font-medium text-[#5f6573]">
              {label}
            </span>
          </>
        );

        return isReal ? (
          <Link key={label} href={href} className="flex flex-col items-center gap-1.5">
            {content}
          </Link>
        ) : (
          <a key={label} href={href} className="flex flex-col items-center gap-1.5">
            {content}
          </a>
        );
      })}
    </div>
  );
}
