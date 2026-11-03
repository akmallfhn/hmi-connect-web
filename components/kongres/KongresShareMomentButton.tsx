"use client";

import { IconCameraPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { COMPOSE_INTENT_KEY } from "@/lib/constants";
import { KONGRES_GOLD_BG } from "./KongresDecor";

// Opens the home composer through the same compose intent the Posting menus use.
export default function KongresShareMomentButton() {
  const router = useRouter();

  function handleClick() {
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-bold text-[#04291a] transition hover:brightness-110 ${KONGRES_GOLD_BG}`}
    >
      <IconCameraPlus className="size-4" />
      Bagikan Momenmu
    </button>
  );
}
