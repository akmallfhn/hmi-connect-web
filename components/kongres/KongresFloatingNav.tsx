"use client";

import {
  IconBuildingCommunity,
  IconCalendarTime,
  IconHome,
  IconMapPin,
  IconNews,
  IconPalette,
  IconPhoto,
  IconUsersGroup,
  type TablerIcon,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export const KONGRES_SECTIONS: { id: string; label: string; icon: TablerIcon }[] = [
  { id: "beranda", label: "Beranda", icon: IconHome },
  { id: "tuan-rumah", label: "Tuan Rumah", icon: IconBuildingCommunity },
  { id: "lokasi", label: "Lokasi", icon: IconMapPin },
  { id: "rundown", label: "Rundown", icon: IconCalendarTime },
  { id: "panitia", label: "Panitia", icon: IconUsersGroup },
  { id: "momen", label: "Momen", icon: IconPhoto },
  { id: "berita", label: "Berita", icon: IconNews },
  { id: "logo", label: "Filosofi Logo", icon: IconPalette },
];

// Liputan6-style floating pill: hidden over the hero, then follows the reader with the active section lit.
export default function KongresFloatingNav() {
  const [active, setActive] = useState(KONGRES_SECTIONS[0].id);
  const [visible, setVisible] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setActive(current.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    for (const section of KONGRES_SECTIONS) {
      const element = document.getElementById(section.id);
      if (element) sections.observe(element);
    }

    const hero = document.getElementById("beranda");
    const heroWatcher = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (hero) heroWatcher.observe(hero);

    return () => {
      sections.disconnect();
      heroWatcher.disconnect();
    };
  }, []);

  // Keeps the lit item in view when the pill scrolls sideways on a phone.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!list || !item) return;
    list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Navigasi halaman Kongres"
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-max -translate-x-1/2 transition duration-300 motion-reduce:transition-none lg:bottom-6 lg:left-[calc(50%+8rem)] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ul
        ref={listRef}
        className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#04291a]/90 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {KONGRES_SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} data-section={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  isActive ? "bg-[#e8b628] text-[#04291a]" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4" stroke={isActive ? 2.4 : 2} />
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
