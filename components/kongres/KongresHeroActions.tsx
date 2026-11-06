"use client";

import { IconCameraPlus, IconFrame } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useShareMoment } from "@/lib/useShareMoment";
import TwibbonEditorModal from "../twibbon/TwibbonEditorModal";
import { KONGRES_GOLD_BG } from "./KongresDecor";

const TWIBBON_EDITOR_ENABLED = false;

export default function KongresHeroActions({ canShareToFeed }: { canShareToFeed: boolean }) {
  const shareMoment = useShareMoment();
  const [twibbonOpen, setTwibbonOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
        <button
          type="button"
          onClick={() => {
            if (!TWIBBON_EDITOR_ENABLED) {
              toast.info("Fitur Twibbon segera hadir.");
              return;
            }
            setTwibbonOpen(true);
          }}
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
      {TWIBBON_EDITOR_ENABLED && (
        <TwibbonEditorModal
          open={twibbonOpen}
          onClose={() => setTwibbonOpen(false)}
          canShareToFeed={canShareToFeed}
        />
      )}
    </>
  );
}
