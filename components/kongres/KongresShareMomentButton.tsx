"use client";

import { IconCameraPlus } from "@tabler/icons-react";
import { KONGRES_GOLD_BG } from "./KongresDecor";
import { useShareMoment } from "@/lib/useShareMoment";

export default function KongresShareMomentButton() {
  const shareMoment = useShareMoment();

  return (
    <button
      type="button"
      onClick={shareMoment}
      className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-bold text-[#04291a] transition hover:brightness-110 ${KONGRES_GOLD_BG}`}
    >
      <IconCameraPlus className="size-4" />
      Bagikan Momenmu
    </button>
  );
}
