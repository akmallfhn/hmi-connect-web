"use client";

import { IconCameraPlus, IconFrame } from "@tabler/icons-react";
import { toast } from "sonner";
import { KONGRES_GOLD_BG } from "./KongresDecor";
import { useShareMoment } from "@/lib/useShareMoment";

export default function KongresHeroActions() {
  const shareMoment = useShareMoment();

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
      {/* The twibbon editor is still on its own branch; this toast stands in until it ships. */}
      <button
        type="button"
        onClick={() => toast.info("Twibbon Kongres XXXIII segera hadir.")}
        className={`inline-flex h-12 cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-bold text-[#04291a] shadow-lg shadow-[#e8b628]/20 transition hover:brightness-110 ${KONGRES_GOLD_BG}`}
      >
        <IconFrame className="size-4" />
        Pasang Twibbon
      </button>
      <button
        type="button"
        onClick={shareMoment}
        className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <IconCameraPlus className="size-4" />
        Bagikan Momen
      </button>
    </div>
  );
}
