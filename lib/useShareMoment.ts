"use client";

import { useRouter } from "next/navigation";
import { COMPOSE_INTENT_KEY, COMPOSE_INTENT_TEXT_KEY } from "@/lib/constants";
import { KONGRES_HASHTAG } from "@/lib/kongres-data";

// Opens the home composer with the Kongres hashtag already typed, through the shared compose intent.
export function useShareMoment() {
  const router = useRouter();
  return () => {
    window.sessionStorage.setItem(COMPOSE_INTENT_TEXT_KEY, `#${KONGRES_HASHTAG} `);
    window.sessionStorage.setItem(COMPOSE_INTENT_KEY, "1");
    router.push("/");
  };
}
