import Image from "next/image";
import {
  KONGRES_BRAND_COLORS,
  KONGRES_LOGO_DOWNLOADS,
  KONGRES_LOGO_PHILOSOPHY,
  kongresAsset,
} from "@/lib/kongres-data";
import KongresLogoDownloadButton from "./KongresLogoDownloadButton";
import { KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS } from "./KongresDecor";

// Mirrors the committee's "Filosofi Logo" sheet: title, logo, six elements, then the brand colour strip.
export default function KongresLogoSection() {
  return (
    <section id="logo" className={`relative border border-border bg-surface ${KONGRES_SECTION_CLASS}`}>
      <Image
        src={kongresAsset("kelopak-bunga.png")}
        alt=""
        width={407}
        height={480}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-10 w-[420px] opacity-[0.06] grayscale lg:w-[560px]"
      />
      <Image
        src={kongresAsset("kelopak-bunga.png")}
        alt=""
        width={407}
        height={480}
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 w-[380px] opacity-[0.05] grayscale lg:w-[480px]"
      />

      <div className={`relative ${KONGRES_SECTION_BODY}`}>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Identitas Visual
          </p>
          <h2 className="mt-3 bg-linear-to-b from-[#0a9a4a] to-[#0b5d33] bg-clip-text font-stack-sans-headline text-3xl font-medium leading-tight text-transparent sm:text-4xl dark:from-[#3fd07f] dark:to-[#0a9a4a]">
            Filosofi Logo
          </h2>
          <div className="mx-auto mt-8 max-w-xl rounded-2xl dark:bg-white dark:p-4">
            <Image
              src={kongresAsset("logo-kongres-xxxiii-horizontal-light.png")}
              alt="Logo Kongres XXXIII Himpunan Mahasiswa Islam, Bandar Lampung 28 November – 5 Desember 2026"
              width={1600}
              height={398}
              className="h-auto w-full"
            />
          </div>
        </div>

        <ul className="mt-12 grid gap-x-10 gap-y-10 xl:grid-cols-2">
          {KONGRES_LOGO_PHILOSOPHY.map((item) => (
            <li key={item.title} className="flex items-start gap-5 sm:gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-28">
                <Image
                  src={item.icon}
                  alt=""
                  width={480}
                  height={480}
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-content-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14">
          <h3 className="font-stack-sans-headline text-2xl font-medium text-heading">Kanal Unduhan</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KONGRES_LOGO_DOWNLOADS.map((file) => (
              <li
                key={file.href}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div
                  className={`flex h-40 items-center justify-center p-5 ${
                    file.dark ? "bg-[#04291a]" : "bg-[#f7f7f5] dark:bg-white"
                  }`}
                >
                  <Image
                    src={file.preview}
                    alt=""
                    width={800}
                    height={800}
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-semibold text-heading">{file.title}</p>
                  <p className="text-xs text-muted-foreground">{file.meta}</p>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{file.description}</p>
                  <KongresLogoDownloadButton href={file.href} downloadName={file.downloadName} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div aria-hidden="true" className="relative grid h-5 grid-cols-4 lg:h-7">
        {KONGRES_BRAND_COLORS.map((color) => (
          <span key={color} style={{ backgroundColor: color }} />
        ))}
      </div>
    </section>
  );
}
