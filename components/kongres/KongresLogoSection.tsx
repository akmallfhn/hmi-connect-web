import { IconDownload } from "@tabler/icons-react";
import Image from "next/image";
import {
  KONGRES_BRAND_COLORS,
  KONGRES_LOGO_DOWNLOADS,
  KONGRES_LOGO_PHILOSOPHY,
} from "@/lib/kongres-data";

// Mirrors the committee's "Filosofi Logo" sheet: title, logo, six elements, then the brand colour strip.
export default function KongresLogoSection() {
  return (
    <section id="logo" className="relative scroll-mt-14 overflow-hidden bg-surface">
      <Image
        src="/images/kongres/filosofi/kelopak-bunga.png"
        alt=""
        width={407}
        height={480}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-10 w-[420px] opacity-[0.06] grayscale lg:w-[560px]"
      />
      <Image
        src="/images/kongres/filosofi/kelopak-bunga.png"
        alt=""
        width={407}
        height={480}
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 w-[380px] opacity-[0.05] grayscale lg:w-[480px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Identitas Visual
          </p>
          <h2 className="mt-3 bg-linear-to-b from-[#0a9a4a] to-[#0b5d33] bg-clip-text font-stack-sans-headline text-5xl font-medium text-transparent sm:text-6xl lg:text-7xl dark:from-[#3fd07f] dark:to-[#0a9a4a]">
            Filosofi Logo
          </h2>
          <div className="mx-auto mt-8 max-w-xl rounded-2xl dark:bg-white dark:p-4">
            <Image
              src="/images/kongres/logo-kongres-xxxiii-horizontal-light.png"
              alt="Logo Kongres XXXIII Himpunan Mahasiswa Islam, Bandar Lampung 28 November – 5 Desember 2026"
              width={1600}
              height={398}
              className="h-auto w-full"
            />
          </div>
        </div>

        <ul className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-20 lg:gap-y-14">
          {KONGRES_LOGO_PHILOSOPHY.map((item) => (
            <li key={item.title} className="flex items-start gap-5 sm:gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center sm:h-32 sm:w-36">
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

        <div className="mt-16 lg:mt-24">
          <h3 className="font-stack-sans-headline text-2xl font-medium text-heading">Kanal Unduhan</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Gunakan file resmi berikut tanpa mengubah warna, proporsi, atau susunannya.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <a
                    href={file.href}
                    download={file.fileName}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0a8a42] text-sm font-semibold text-white transition hover:bg-[#08743a]"
                  >
                    <IconDownload className="size-4" />
                    Unduh
                  </a>
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
