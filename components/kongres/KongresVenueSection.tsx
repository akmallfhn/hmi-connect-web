"use client";

import {
  IconCalendarEvent,
  IconExternalLink,
  IconMapPin,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";
import { KONGRES_VENUES } from "@/lib/kongres-data";
import { DuotonePhoto, KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading } from "./KongresDecor";

function mapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function mapLinkUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function KongresVenueSection() {
  const [venueId, setVenueId] = useState(KONGRES_VENUES[0].id);
  const venue = KONGRES_VENUES.find((item) => item.id === venueId) ?? KONGRES_VENUES[0];

  return (
    <section id="lokasi" className={`border border-border bg-surface ${KONGRES_SECTION_CLASS}`}>
      <div className={KONGRES_SECTION_BODY}>
        <SectionHeading
          eyebrow="Peta Kongres"
          title="Lokasi Kongres & Persidangan"
          description="Enam titik utama Kongres XXXIII di Bandar Lampung. Pilih lokasi untuk melihat detail dan petanya."
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ol className="flex flex-col gap-2.5">
            {KONGRES_VENUES.map((item, index) => {
              const selected = item.id === venue.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setVenueId(item.id)}
                    aria-pressed={selected}
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#0a8a42] bg-[#0a8a42]/8 dark:bg-[#0a8a42]/15"
                        : "border-border hover:border-border-strong hover:bg-surface-muted"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-stack-sans-headline text-base font-medium ${
                        selected ? "bg-[#0a8a42] text-white" : "bg-surface-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#0a8a42] dark:text-[#e8b628]">
                        {item.role}
                      </span>
                      <span className="mt-0.5 block truncate font-semibold text-heading">{item.name}</span>
                      <span className="block truncate text-sm text-muted-foreground">{item.schedule}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <article className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="relative">
              <DuotonePhoto
                key={venue.id}
                photo={venue.photo}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[21/9]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#04291a]/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-[#f6d77a]">{venue.role}</p>
                <h3 className="mt-1 font-stack-sans-headline text-2xl font-medium">{venue.name}</h3>
              </div>
            </div>

            <ul className="grid gap-2.5 p-5 text-sm">
              <li className="flex gap-2 text-muted-foreground">
                <IconMapPin className="size-4 shrink-0 text-[#0a8a42]" />
                {venue.address}
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <IconCalendarEvent className="size-4 shrink-0 text-[#0a8a42]" />
                {venue.schedule}
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <IconUsersGroup className="size-4 shrink-0 text-[#0a8a42]" />
                {venue.capacity}
              </li>
            </ul>

            <div className="px-5 pb-5">
              <iframe
                key={venue.id}
                title={`Peta ${venue.name}`}
                src={mapEmbedUrl(venue.mapQuery)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[16/10] w-full rounded-2xl border border-border"
              />
              <a
                href={mapLinkUrl(venue.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a8a42] hover:underline dark:text-[#e8b628]"
              >
                Buka di Google Maps
                <IconExternalLink className="size-4" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
