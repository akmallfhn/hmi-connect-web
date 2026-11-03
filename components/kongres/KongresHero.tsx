import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import { KONGRES_PHOTOS, KONGRES_THEME } from "@/lib/kongres-data";
import KongresCountdown from "./KongresCountdown";
import { KONGRES_GOLD_TEXT, KONGRES_SECTION_CLASS, TapisBand } from "./KongresDecor";
import KongresHeroActions from "./KongresHeroActions";

export default function KongresHero() {
  return (
    <section id="beranda" className={`relative isolate bg-[#04291a] text-white ${KONGRES_SECTION_CLASS}`}>
      <Image
        src={KONGRES_PHOTOS.cityPanorama.src}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 70vw, 100vw"
        className="-z-20 object-cover opacity-25 grayscale"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#04291a]/60 via-[#04291a]/85 to-[#04291a]" />
      <div className="absolute -right-32 top-0 -z-10 size-[420px] rounded-full bg-[#e8b628]/20 blur-[110px]" />
      <div className="absolute -left-24 bottom-0 -z-10 size-[320px] rounded-full bg-[#0a8a42]/40 blur-[100px]" />

      <div className="grid items-center gap-8 px-5 pb-12 pt-10 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] sm:px-8 lg:px-10 lg:pb-14 lg:pt-12">
        <div>
          <h1 className="font-stack-sans-headline text-5xl font-medium leading-[0.95] sm:text-6xl xl:text-7xl">
            Kongres HMI
            <br />
            <span className={KONGRES_GOLD_TEXT}>XXXIII</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-white/80">
            &ldquo;{KONGRES_THEME}&rdquo;
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5">
              <IconMapPin className="size-4 text-[#e8b628]" />
              Bandar Lampung
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5">
              <IconCalendarEvent className="size-4 text-[#e8b628]" />
              28 November – 5 Desember 2026
            </span>
          </div>

          <div className="mt-8">
            <KongresCountdown />
          </div>

          <div className="mt-8">
            <KongresHeroActions />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[240px] sm:max-w-none">
          <div className="absolute inset-[12%] rounded-full bg-[#e8b628]/25 blur-3xl" />
          <Image
            src="/images/kongres/emblem-kongres-xxxiii.png"
            alt="Logo Kongres XXXIII HMI"
            width={695}
            height={800}
            priority
            className="relative h-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>

      <TapisBand className="text-[#e8b628]" />
    </section>
  );
}
