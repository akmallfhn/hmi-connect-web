import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { KONGRES_NEWS } from "@/lib/kongres-data";
import { SectionHeading } from "./KongresDecor";

// Placeholder stories render as cards without links until real Kongres articles exist.
export default function KongresNewsSection() {
  const [featured, ...rest] = KONGRES_NEWS;

  return (
    <section id="berita" className="scroll-mt-14 bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Kabar Kongres"
          title="Berita Terkini"
          description="Perkembangan terbaru dari panitia, persidangan, dan tuan rumah."
          action={
            <Link
              href="/articles"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0a8a42] hover:underline dark:text-[#e8b628]"
            >
              Semua artikel
              <IconArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <article className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-[#04291a] text-white">
            <Image
              src={featured.photo.src}
              alt={featured.photo.alt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#04291a] via-[#04291a]/60 to-transparent" />
            <div className="relative p-6 sm:p-8">
              <span className="inline-block rounded-full bg-[#e8b628] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#04291a]">
                {featured.category}
              </span>
              <h3 className="mt-3 font-stack-sans-headline text-2xl font-medium leading-tight sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                {featured.excerpt}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                {featured.date}
              </p>
            </div>
          </article>

          <ol className="flex flex-col divide-y divide-border">
            {rest.map((item, index) => (
              <li key={item.id} className="group flex gap-4 py-4 first:pt-0 last:pb-0">
                <span className="w-7 shrink-0 font-stack-sans-headline text-3xl font-medium leading-none text-[#e8b628]">
                  {index + 2}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0a8a42] dark:text-[#e8b628]">
                    {item.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-stack-sans-headline text-base font-medium leading-6 text-heading">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:w-24">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="96px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
