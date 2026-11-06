import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import {
  KONGRES_PHOTOS,
  kongresAsset,
} from "@/lib/kongres-data";
import KongresCountdown from "./KongresCountdown";
import {
  KONGRES_GOLD_TEXT,
  KONGRES_SECTION_CLASS,
  TapisBand,
} from "./KongresDecor";
import KongresHeroActions from "./KongresHeroActions";

export default function KongresHero({ canShareToFeed }: { canShareToFeed: boolean }) {
  return (
    <section
      id="beranda"
      className={`relative isolate bg-[#04291a] text-white ${KONGRES_SECTION_CLASS}`}
    >
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
        <div className="text-center sm:text-left">
          <h1 className="font-stack-sans-headline text-3xl font-medium leading-tight sm:text-4xl">
            Kongres HMI
            <br />
            <span className={KONGRES_GOLD_TEXT}>XXXIII</span>
          </h1>

          {/* Mobile has no side column, so the emblem sits above the venue and date chips. */}
          <KongresEmblem className="mt-8 max-w-[240px] sm:hidden" />

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm sm:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5">
              <IconMapPin className="size-4 text-[#e8b628]" />
              PKOR Way Halim, Lampung
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
            <KongresHeroActions canShareToFeed={canShareToFeed} />
          </div>
        </div>

        <KongresEmblem className="hidden sm:block" />
      </div>

      <TapisBand className="text-[#e8b628]" />
    </section>
  );
}

function KongresEmblem({ className }: { className: string }) {
  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <div className="absolute inset-[12%] rounded-full bg-[#e8b628]/25 blur-3xl" />
      <Image
        src={kongresAsset("emblem-kongres-xxxiii.png")}
        alt="Logo Kongres XXXIII HMI"
        width={695}
        height={800}
        priority
        className="relative h-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
