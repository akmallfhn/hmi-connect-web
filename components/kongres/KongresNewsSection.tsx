import { IconArrowRight, IconExternalLink, IconNews, IconPhotoOff } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/apis/news";
import { formatShortDate } from "@/lib/time-manipulation";
import { KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading } from "./KongresDecor";

export default function KongresNewsSection({ articles }: { articles: NewsArticle[] }) {
  const [featured, ...rest] = articles;

  return (
    <section id="berita" className={`border border-border bg-surface ${KONGRES_SECTION_CLASS}`}>
      <div className={KONGRES_SECTION_BODY}>
        <SectionHeading
          eyebrow="Kabar Kongres"
          title="Berita Terkini"
          action={
            <Link
              href="/articles?tab=news"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#0a8a42] hover:underline dark:text-[#e8b628]"
            >
              Semua berita
              <IconArrowRight className="size-4" />
            </Link>
          }
        />

        {featured ? (
          <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <a
              href={featured.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-[#04291a] text-white"
            >
              {featured.image_url ? (
                <Image
                  src={featured.image_url}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/30">
                  <IconPhotoOff className="size-16" stroke={1.5} aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[#04291a] via-[#04291a]/70 to-transparent" />
              <div className="relative p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#04291a]">
                  <PublisherLogo article={featured} featured />
                  {featured.source_name}
                  <IconExternalLink className="size-3.5" />
                </span>
                <h3 className="mt-3 font-stack-sans-headline text-2xl font-medium leading-tight sm:text-3xl">
                  {featured.title}
                </h3>
                {featured.published_at && (
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                    {formatShortDate(featured.published_at)}
                  </p>
                )}
              </div>
            </a>

            <ol className="flex flex-col divide-y divide-border">
              {rest.map((article, index) => (
                <li key={article.id} className="py-3 first:pt-0 last:pb-0">
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 sm:gap-4"
                  >
                    <span className="w-7 shrink-0 pt-0.5 font-stack-sans-headline text-3xl font-medium leading-none text-[#e8b628]">
                      {index + 2}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <PublisherLogo article={article} />
                        <p className="truncate text-xs font-bold uppercase tracking-wider text-[#0a8a42] dark:text-[#e8b628]">
                          {article.source_name}
                        </p>
                      </div>
                      <h3 className="mt-1 line-clamp-2 font-stack-sans-headline text-base font-medium leading-6 text-heading transition group-hover:text-[#0a8a42] dark:group-hover:text-[#e8b628]">
                        {article.title}
                      </h3>
                      {article.published_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatShortDate(article.published_at)}
                        </p>
                      )}
                    </div>
                    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted text-subtle-foreground">
                      {article.image_url ? (
                        <Image
                          src={article.image_url}
                          alt=""
                          fill
                          unoptimized
                          sizes="80px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <IconPhotoOff className="size-7" stroke={1.8} aria-hidden="true" />
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
            Belum ada berita Kongres HMI.
          </div>
        )}
      </div>
    </section>
  );
}

function PublisherLogo({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  return (
    <span
      className={`relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md ${
        featured ? "bg-white" : "border border-border bg-white"
      }`}
      aria-hidden="true"
    >
      {article.source_logo_url ? (
        <Image
          src={article.source_logo_url}
          alt=""
          fill
          unoptimized
          sizes="20px"
          className="object-contain p-0.5"
        />
      ) : (
        <IconNews className="size-3.5 text-[#0a8a42]" stroke={2} />
      )}
    </span>
  );
}
