"use client";

import { IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  KONGRES_ENDS_AT,
  KONGRES_PATH,
  KONGRES_STARTS_AT,
} from "@/lib/kongres-data";

const START_MINUTE = Date.parse(KONGRES_STARTS_AT) / 60_000;
const END_MINUTE = Date.parse(KONGRES_ENDS_AT) / 60_000;
const MINUTES_PER_DAY = 24 * 60;

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 60_000);
  return () => window.clearInterval(id);
}

function nowInMinutes() {
  return Math.floor(Date.now() / 60_000);
}

export default function KongresCountdownFloatingLink() {
  const [hidden, setHidden] = useState(false);
  const now = useSyncExternalStore(subscribe, nowInMinutes, () => null);
  const days = now !== null && now < START_MINUTE
    ? Math.ceil((START_MINUTE - now) / MINUTES_PER_DAY)
    : null;
  const eyebrow = days !== null
    ? `${days} hari menuju`
    : now === null
      ? "Menuju"
      : now < END_MINUTE
        ? "Sedang berlangsung"
        : "Jelajahi kembali";

  if (hidden) return null;

  return (
    <div className="fixed bottom-20 -right-3 z-30 w-44 max-w-[calc(100vw-0.75rem)] lg:bottom-8 lg:-right-2">
      <Link
        href={KONGRES_PATH}
        aria-label={`${eyebrow} Kongres HMI ke XXXIII`}
        className="group flex w-full flex-col items-center text-center transition hover:-translate-y-0.5 focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none"
      >
        <span className="flex size-20 items-center justify-center rounded-2xl border border-primary/25 bg-white p-2.5 shadow-[0_8px_22px_rgba(0,128,111,0.18)] transition-shadow group-hover:shadow-[0_10px_26px_rgba(0,128,111,0.24)]">
          <Image
            src="/images/twibbon/logo-kongres-emblem.png"
            alt=""
            width={60}
            height={60}
            className="size-full object-contain"
          />
        </span>
        <span className="relative z-10 -mt-1 -rotate-2 rounded-lg bg-secondary px-3 py-1.5 font-stack-sans-headline text-xs font-medium leading-none text-on-secondary shadow-md">
          {eyebrow}
        </span>
        <span className="relative z-20 -mt-0.5 rotate-1 whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 font-stack-sans-headline text-xs font-medium leading-none text-on-primary-action shadow-md">
          Kongres HMI ke XXXIII
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Tutup pengingat Kongres"
        className="absolute -top-1 right-[38px] z-30 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-md transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <IconX className="size-3" stroke={2.4} />
      </button>
    </div>
  );
}
