"use client";

import { IconMapPin, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";
import { KONGRES_RUNDOWN, type KongresAgendaItem } from "@/lib/kongres-data";
import { SectionHeading } from "./KongresDecor";

const TAG_CLASS: Record<KongresAgendaItem["tag"], string> = {
  Seremoni: "bg-[#e8b628]/15 text-[#f6d77a]",
  Sidang: "bg-sky-400/15 text-sky-300",
  Pemilihan: "bg-rose-400/15 text-rose-300",
  Budaya: "bg-fuchsia-400/15 text-fuchsia-300",
  Ibadah: "bg-emerald-400/15 text-emerald-300",
  Logistik: "bg-white/10 text-white/70",
};

export default function KongresRundownSection() {
  const [dayIndex, setDayIndex] = useState(0);
  const day = KONGRES_RUNDOWN[dayIndex];

  return (
    <section id="rundown" className="relative scroll-mt-14 overflow-hidden bg-[#04291a] py-16 text-white lg:py-24">
      <div className="absolute -right-40 bottom-0 size-[480px] rounded-full bg-[#e8b628]/10 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          tone="dark"
          eyebrow="Rundown"
          title="Delapan hari menuju kepemimpinan baru"
          description="Dari kirab budaya hingga pemilihan Ketua Umum PB HMI. Jadwal dapat berubah mengikuti keputusan sidang."
        />

        {/* The day picker doubles as the week's timeline: one connected track, one stop per day. */}
        <div className="relative mt-10 -mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <ol className="relative flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-8">
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-[19px] h-px bg-white/15"
            />
            {KONGRES_RUNDOWN.map((item, index) => {
              const selected = index === dayIndex;
              const passed = index < dayIndex;
              return (
                <li key={item.date} className="relative w-28 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setDayIndex(index)}
                    aria-pressed={selected}
                    className="group flex w-full cursor-pointer flex-col items-start text-left"
                  >
                    <span
                      className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-stack-sans-headline text-sm font-medium transition ${
                        selected
                          ? "border-[#e8b628] bg-[#e8b628] text-[#04291a]"
                          : passed
                            ? "border-[#e8b628]/60 bg-[#04291a] text-[#f6d77a]"
                            : "border-white/20 bg-[#04291a] text-white/70 group-hover:border-white/50"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`mt-3 text-xs font-bold uppercase tracking-wider ${
                        selected ? "text-[#f6d77a]" : "text-white/50"
                      }`}
                    >
                      {item.weekday}, {item.date}
                    </span>
                    <span
                      className={`mt-0.5 text-sm font-semibold ${selected ? "text-white" : "text-white/70"}`}
                    >
                      {item.phase}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-stack-sans-headline text-2xl font-medium">
              Hari {dayIndex + 1} · {day.phase}
            </h3>
            <p className="text-sm text-white/60">
              {day.weekday}, {day.date} 2026
            </p>
          </div>

          <ol className="mt-6">
            {day.agenda.map((item, index) => {
              const last = index === day.agenda.length - 1;
              return (
                <li key={`${item.time}-${item.title}`} className="relative grid grid-cols-[56px_24px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[72px_24px_minmax(0,1fr)]">
                  <span className="pt-3 font-stack-sans-headline text-base font-medium tabular-nums text-white/80 sm:text-lg">
                    {item.time}
                  </span>
                  <span className="relative flex justify-center">
                    {!last && (
                      <span aria-hidden="true" className="absolute top-6 h-full w-px bg-white/15" />
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative mt-4 size-3.5 rounded-full border-2 ${
                        item.highlight
                          ? "border-[#e8b628] bg-[#e8b628] shadow-[0_0_0_4px_rgba(232,182,40,0.2)]"
                          : "border-white/40 bg-[#04291a]"
                      }`}
                    />
                  </span>
                  <div
                    className={`mb-3 rounded-2xl border p-4 ${
                      item.highlight
                        ? "border-[#e8b628]/50 bg-[#e8b628]/10"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TAG_CLASS[item.tag]}`}>
                        {item.tag}
                      </span>
                      {item.highlight && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#f6d77a]">
                          <IconStarFilled className="size-3" />
                          Momen utama
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold leading-6">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
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
