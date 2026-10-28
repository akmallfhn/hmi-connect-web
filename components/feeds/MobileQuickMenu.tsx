import Link from "next/link";
import AlQuranIcon from "../icons/AlQuranIcon";
import DocumentIcon from "../icons/DocumentIcon";
import EKTAIcon from "../icons/EKTAIcon";
import EventIcon from "../icons/EventIcon";
import NewsIcon from "../icons/NewsIcon";
import PrayerIcon from "../icons/PrayerIcon";

const MENU_ITEMS = [
  { label: "Artikel", href: "/articles", icon: NewsIcon },
  { label: "E-KTA", href: "/membership", icon: EKTAIcon },
  { label: "LK Center", href: "/trainings", icon: EventIcon },
  { label: "Al-Qur'an", href: "/quran", icon: AlQuranIcon },
  {
    label: "Pedoman Organisasi",
    href: "/organizational-documents",
    icon: DocumentIcon,
  },
  { label: "Jadwal Sholat", href: "/prayer-schedules", icon: PrayerIcon },
] as const;

export default function MobileQuickMenu() {
  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-4 border border-x-0 border-border bg-surface px-4 py-4">
      {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex flex-col items-center gap-1.5"
        >
          <Icon className="size-14" />
          <span className="text-center text-sm font-medium leading-tight text-muted-foreground">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
