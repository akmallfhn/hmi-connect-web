import { IconCalendarEvent, IconDownload, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import {
  KONGRES_PHOTOS,
  KONGRES_STATS,
  KONGRES_THEME,
} from "@/lib/kongres-data";
import KongresCountdown from "./KongresCountdown";
import { KONGRES_GOLD_BG, KONGRES_GOLD_TEXT, TapisBand } from "./KongresDecor";

export default function KongresHero() {
  return (
    <header id="beranda" className="relative isolate overflow-hidden bg-[#04291a] text-white">
      <Image
        src={KONGRES_PHOTOS.cityPanorama.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-25 grayscale"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#04291a]/60 via-[#04291a]/85 to-[#04291a]" />
      <div className="absolute -right-40 top-10 -z-10 size-[560px] rounded-full bg-[#e8b628]/20 blur-[120px]" />
      <div className="absolute -left-32 bottom-0 -z-10 size-[420px] rounded-full bg-[#0a8a42]/40 blur-[110px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:pb-20 lg:pt-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e8b628]/40 bg-[#e8b628]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f6d77a]">
            Himpunan Mahasiswa Islam
          </p>
          <h1 className="mt-5 font-stack-sans-headline text-5xl font-medium leading-[0.95] sm:text-7xl lg:text-8xl">
            Kongres
            <br />
            <span className={KONGRES_GOLD_TEXT}>XXXIII</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-white/80 sm:text-xl">
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

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#rundown"
              className={`inline-flex h-12 items-center rounded-full px-6 text-sm font-bold text-[#04291a] shadow-lg shadow-[#e8b628]/20 transition hover:brightness-110 ${KONGRES_GOLD_BG}`}
            >
              Lihat Rundown
            </a>
            <a
              href="#logo"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <IconDownload className="size-4" />
              Unduh Logo
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm lg:max-w-none">
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
      <div className={`${KONGRES_GOLD_BG} text-[#04291a]`}>
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:px-8 lg:grid-cols-4">
          {KONGRES_STATS.map((stat) => (
            <div key={stat.unit} className="py-5 lg:py-7">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-stack-sans-headline text-3xl font-medium sm:text-4xl">
                  {stat.value}
                </span>{" "}
                <span className="text-sm font-bold uppercase tracking-wider">{stat.unit}</span>
                <p className="mt-0.5 text-xs font-medium text-[#04291a]/70 sm:text-sm">{stat.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
