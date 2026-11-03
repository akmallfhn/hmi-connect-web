import { IconHash, IconHeartFilled } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { KONGRES_HASHTAG, KONGRES_MOMENTS } from "@/lib/kongres-data";
import KongresShareMomentButton from "./KongresShareMomentButton";
import { KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading } from "./KongresDecor";

const HASHTAG_SEARCH_HREF = `/search?q=${encodeURIComponent(`#${KONGRES_HASHTAG.toLowerCase()}`)}&tab=feed`;

const compactNumber = new Intl.NumberFormat("id-ID", { notation: "compact" });

export default function KongresMomentsSection() {
  return (
    <section id="momen" className={`bg-[#fbf6e9] dark:bg-surface-muted ${KONGRES_SECTION_CLASS}`}>
      <div className={KONGRES_SECTION_BODY}>
        <SectionHeading
          eyebrow={`#${KONGRES_HASHTAG}`}
          title="Momen Kongres"
          description="Kumpulan foto dan cerita pilihan dari kader. Bagikan momenmu dengan tagar resmi agar tampil di sini."
          action={
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={HASHTAG_SEARCH_HREF}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#0a8a42]/40 px-5 text-sm font-semibold text-[#0a8a42] transition hover:bg-[#0a8a42]/10 dark:border-[#e8b628]/40 dark:text-[#e8b628]"
              >
                <IconHash className="size-4" />
                Lihat semua
              </Link>
              <KongresShareMomentButton />
            </div>
          }
        />

        <ul className="mt-10 columns-1 gap-4 sm:columns-2 xl:columns-3">
          {KONGRES_MOMENTS.map((moment) => (
            <li key={moment.id} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-surface">
              <div className={`group relative overflow-hidden ${moment.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                <Image
                  src={moment.photo.src}
                  alt={moment.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2.5">
                  <Image
                    src={moment.avatar}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{moment.author}</p>
                    <p className="truncate text-xs text-muted-foreground">@{moment.username}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <IconHeartFilled className="size-4 text-rose-500" />
                    {compactNumber.format(moment.likes)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-content-foreground">
                  {moment.caption}{" "}
                  <span className="font-semibold text-[#0a8a42] dark:text-[#e8b628]">#{KONGRES_HASHTAG}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
