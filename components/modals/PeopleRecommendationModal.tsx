"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FollowRecommendationEntry } from "@/apis/users";
import { PEOPLE_RECOMMENDATION_MODAL_STORAGE_PREFIX } from "@/lib/constants";
import FollowRecommendationRow from "../feeds/FollowRecommendationRow";
import Modal from "./Modal";

interface PeopleRecommendationModalProps {
  userId: string;
  recommendations: FollowRecommendationEntry[];
}

export default function PeopleRecommendationModal({
  userId,
  recommendations,
}: PeopleRecommendationModalProps) {
  const [open, setOpen] = useState(false);
  const storageKey = useMemo(
    () => `${PEOPLE_RECOMMENDATION_MODAL_STORAGE_PREFIX}:${userId}`,
    [userId]
  );

  useEffect(() => {
    if (recommendations.length === 0) return;

    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, "shown");
      window.setTimeout(() => setOpen(true), 0);
    } catch {
      // If storage is unavailable, fail closed instead of showing on every visit.
    }
  }, [recommendations.length, storageKey]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Mungkin Kamu Kenal"
      panelClassName="max-w-lg"
      variant="bottomSheet"
    >
      <div className="flex flex-col divide-y divide-divider">
        {recommendations.map((connection) => (
          <div key={connection.id} className="py-3 first:pt-0 last:pb-0">
            <FollowRecommendationRow connection={connection} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <Link
          href="/people-recommendation"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-soft px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Lihat semua
        </Link>
      </div>
    </Modal>
  );
}
