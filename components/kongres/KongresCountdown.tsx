"use client";

import { useSyncExternalStore } from "react";
import { KONGRES_ENDS_AT, KONGRES_STARTS_AT } from "@/lib/kongres-data";

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}

// Whole seconds keep the snapshot stable between renders within one tick.
const nowInSeconds = () => Math.floor(Date.now() / 1000);

const START = Date.parse(KONGRES_STARTS_AT) / 1000;
const END = Date.parse(KONGRES_ENDS_AT) / 1000;

export default function KongresCountdown() {
  // The server has no clock to agree with, so it renders dashes until the client takes over.
  const now = useSyncExternalStore(subscribe, nowInSeconds, () => null);

  if (now !== null && now >= END) {
    return <CountdownMessage text="Kongres XXXIII telah usai. Terima kasih, Bandar Lampung!" />;
  }
  if (now !== null && now >= START) {
    return <CountdownMessage text="Kongres XXXIII sedang berlangsung" live />;
  }

  const remaining = now === null ? null : START - now;
  const units = [
    { label: "Hari", value: remaining === null ? null : Math.floor(remaining / 86400) },
    { label: "Jam", value: remaining === null ? null : Math.floor((remaining % 86400) / 3600) },
    { label: "Menit", value: remaining === null ? null : Math.floor((remaining % 3600) / 60) },
    { label: "Detik", value: remaining === null ? null : remaining % 60 },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        Menuju pembukaan
      </p>
      <div className="mt-3 flex justify-center gap-2 sm:justify-start sm:gap-3" role="timer" aria-live="off">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex w-16 flex-col items-center rounded-xl border border-white/15 bg-white/5 py-2.5 backdrop-blur-sm sm:w-20 sm:py-3"
          >
            <span className="font-stack-sans-headline text-2xl font-medium tabular-nums text-white sm:text-3xl">
              {unit.value === null ? "--" : String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e8b628] sm:text-xs">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountdownMessage({ text, live }: { text: string; live?: boolean }) {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
      {live && (
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#e8b628] opacity-75 motion-reduce:hidden" />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#e8b628]" />
        </span>
      )}
      {text}
    </p>
  );
}
