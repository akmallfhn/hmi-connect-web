"use client";

import Image from "next/image";
import { useState } from "react";
import TwibbonEditorModal from "./TwibbonEditorModal";

interface TwibbonFloatingButtonProps {
  canShareToFeed: boolean;
}

// Sits above BottomNav on mobile; the editor runs entirely in the browser.
export default function TwibbonFloatingButton({
  canShareToFeed,
}: TwibbonFloatingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group fixed bottom-20 right-4 z-30 lg:bottom-8 lg:right-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buat Twibbon Kongres XXXIII"
          className="relative flex size-16 cursor-pointer items-center justify-center rounded-full border border-border bg-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:size-[72px]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-primary/20 [animation-duration:2.4s] motion-reduce:hidden"
          />
          <Image
            src="/images/twibbon/logo-kongres-emblem.png"
            alt=""
            width={48}
            height={48}
            className="relative size-11 object-contain lg:size-12"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Twibbon
          </span>
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 lg:block"
        >
          Buat Twibbon Kongres XXXIII
        </span>
      </div>

      <TwibbonEditorModal
        open={open}
        onClose={() => setOpen(false)}
        canShareToFeed={canShareToFeed}
      />
    </>
  );
}
