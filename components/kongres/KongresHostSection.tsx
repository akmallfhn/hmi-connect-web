import { IconToolsKitchen2 } from "@tabler/icons-react";
import Image from "next/image";
import {
  KONGRES_CULINARY,
  KONGRES_HOST_FACTS,
  KONGRES_HOST_HIGHLIGHTS,
  kongresAsset,
} from "@/lib/kongres-data";
import { DuotonePhoto, KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading } from "./KongresDecor";

export default function KongresHostSection() {
  return (
    <section id="tuan-rumah" className={`bg-[#fbf6e9] dark:bg-surface-muted ${KONGRES_SECTION_CLASS}`}>
      <div className={KONGRES_SECTION_BODY}>
        <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeading
              eyebrow="Tabik Pun · Tuan Rumah"
              title={
                <>
                  Selamat datang di <span className="text-[#0a8a42] dark:text-[#e8b628]">Bandar Lampung</span>
                </>
              }
              description="Kota Tapis Berseri di ujung selatan Sumatera. Pertemuan budaya pesisir dan pepadun, gerbang utama Jawa–Sumatera, dan kini rumah bagi musyawarah tertinggi HMI."
            />
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
              {KONGRES_HOST_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col-reverse rounded-2xl border border-[#0a8a42]/15 bg-surface p-4"
                >
                  <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="font-stack-sans-headline text-2xl font-medium text-[#0a8a42] dark:text-[#e8b628]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
            <Image
              src={kongresAsset("menara-siger.webp")}
              alt="Bangunan berbentuk mahkota Siger di tengah perbukitan hijau Lampung"
              fill
              sizes="(min-width: 1280px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <h3 className="mt-16 font-stack-sans-headline text-2xl font-medium text-heading">
          Kenali Lampung lebih dekat
        </h3>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {KONGRES_HOST_HIGHLIGHTS.map((item, index) => (
            <li key={item.title} className="group overflow-hidden rounded-2xl bg-surface sm:rounded-3xl">
              <div className="relative">
                <DuotonePhoto
                  photo={item.photo}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-[4/3]"
                />
                <span className="absolute left-3 top-3 font-stack-sans-headline text-2xl font-medium text-white/90 sm:left-4 sm:top-4 sm:text-4xl">
                  0{index + 1}
                </span>
              </div>
              <div className="p-3.5 sm:p-5">
                <p className="font-stack-sans-headline text-base font-medium text-heading sm:text-lg">{item.title}</p>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-[#04291a] p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <p className="flex shrink-0 items-center gap-2 font-stack-sans-headline text-lg font-medium">
            <IconToolsKitchen2 className="size-5 text-[#e8b628]" />
            Wajib dicicipi
          </p>
          <ul className="flex flex-wrap gap-2">
            {KONGRES_CULINARY.map((dish) => (
              <li
                key={dish}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/85"
              >
                {dish}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
