import Link from "next/link";
import AlQuranIcon from "../icons/AlQuranIcon";
import EKTAIcon from "../icons/EKTAIcon";
import EventIcon from "../icons/EventIcon";
import NewsIcon from "../icons/NewsIcon";

const MENU_ITEMS = [
  { label: "News", href: "/news", icon: NewsIcon },
  { label: "E-KTA", href: "/membership", icon: EKTAIcon },
  { label: "Latihan Kader", href: "/trainings", icon: EventIcon },
  { label: "Al-Qur'an", href: "/quran", icon: AlQuranIcon },
] as const;

export default function MobileQuickMenu() {
  return (
    <div className="grid grid-cols-4 gap-2 border border-x-0 border-[#e6e9ef] bg-white px-4 py-4">
      {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex flex-col items-center gap-1.5"
        >
          <Icon className="size-14" />
          <span className="text-center text-sm font-medium text-[#5f6573]">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
