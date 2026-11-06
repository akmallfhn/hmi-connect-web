"use client";

import { IconMapPin, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";
import { KONGRES_RUNDOWN, type KongresAgendaItem } from "@/lib/kongres-data";
import { KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading } from "./KongresDecor";

const TAG_CLASS: Record<KongresAgendaItem["tag"], string> = {
  Seremoni: "bg-[#e8b628]/20 text-[#7a5a00] dark:text-[#f6d77a]",
  Sidang: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  Pemilihan: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300",
  Budaya: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
  Ibadah: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  Logistik: "bg-surface-muted text-muted-foreground",
};

export default function KongresRundownSection() {
  const [dayIndex, setDayIndex] = useState(0);
  const day = KONGRES_RUNDOWN[dayIndex];

  return (
    <section id="rundown" className={`border border-border bg-surface ${KONGRES_SECTION_CLASS}`}>
      <div className={KONGRES_SECTION_BODY}>
        <SectionHeading
          eyebrow="Rundown"
          title="Delapan hari menuju kepemimpinan baru"
        />

        {/* The day picker doubles as the week's timeline: one connected track, one stop per day. */}
        <div className="-mx-5 mt-10 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
          <ol className="relative flex min-w-max gap-2 xl:grid xl:min-w-0 xl:grid-cols-8">
            <span aria-hidden="true" className="absolute left-0 right-0 top-[19px] h-px bg-border-strong" />
            {KONGRES_RUNDOWN.map((item, index) => {
              const selected = index === dayIndex;
              const passed = index < dayIndex;
              return (
                <li key={item.date} className="relative w-28 xl:w-auto">
                  <button
                    type="button"
                    onClick={() => setDayIndex(index)}
                    aria-pressed={selected}
                    className="group flex w-full cursor-pointer flex-col items-start text-left"
                  >
                    <span
                      className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-stack-sans-headline text-sm font-medium transition ${
                        selected
                          ? "border-[#0a8a42] bg-[#0a8a42] text-white"
                          : passed
                            ? "border-[#0a8a42]/60 bg-surface text-[#0a8a42]"
                            : "border-border-strong bg-surface text-muted-foreground group-hover:border-[#0a8a42]/60"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`mt-3 text-[11px] font-bold uppercase tracking-wider ${
                        selected ? "text-[#0a8a42] dark:text-[#3fd07f]" : "text-muted-foreground"
                      }`}
                    >
                      {item.weekday}, {item.date}
                    </span>
                    <span className={`mt-0.5 text-sm font-semibold ${selected ? "text-heading" : "text-muted-foreground"}`}>
                      {item.phase}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-surface-muted/60 p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-stack-sans-headline text-2xl font-medium text-heading">
              Hari {dayIndex + 1} · {day.phase}
            </h3>
            <p className="text-sm text-muted-foreground">
              {day.weekday}, {day.date} 2026
            </p>
          </div>

          <ol className="mt-6">
            {day.agenda.map((item, index) => {
              const last = index === day.agenda.length - 1;
              return (
                <li
                  key={`${item.time}-${item.title}`}
                  className="relative grid grid-cols-[52px_24px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[68px_24px_minmax(0,1fr)]"
                >
                  <span className="pt-3 font-stack-sans-headline text-base font-medium tabular-nums text-heading sm:text-lg">
                    {item.time}
                  </span>
                  <span className="relative flex justify-center">
                    {!last && <span aria-hidden="true" className="absolute top-6 h-full w-px bg-border-strong" />}
                    <span
                      aria-hidden="true"
                      className={`relative mt-4 size-3.5 rounded-full border-2 ${
                        item.highlight
                          ? "border-[#e8b628] bg-[#e8b628] shadow-[0_0_0_4px_rgba(232,182,40,0.25)]"
                          : "border-border-strong bg-surface"
                      }`}
                    />
                  </span>
                  <div
                    className={`mb-3 rounded-2xl border p-4 ${
                      item.highlight ? "border-[#e8b628]/60 bg-[#e8b628]/10" : "border-border bg-surface"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TAG_CLASS[item.tag]}`}>
                        {item.tag}
                      </span>
                      {item.highlight && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#a87a0c] dark:text-[#f6d77a]">
                          <IconStarFilled className="size-3" />
                          Momen utama
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold leading-6 text-heading">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <IconMapPin className="size-4 shrink-0" />
                      {item.venue}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
