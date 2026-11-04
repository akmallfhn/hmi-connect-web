"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateEventAttendance } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";

export function useEventAttendance({
  eventId,
  initialAttending,
  initialCount,
}: {
  eventId: string;
  initialAttending: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [isAttending, setIsAttending] = useState(initialAttending);
  const [attendeeCount, setAttendeeCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    const previous = { isAttending, attendeeCount };
    const next = !isAttending;
    setIsAttending(next);
    setAttendeeCount((count) => Math.max(0, count + (next ? 1 : -1)));
    setSaving(true);

    try {
      const result = await updateEventAttendance(eventId, next);
      if (!isSuccessStatus(result.status) || !result.data) {
        throw new Error(result.message);
      }
      setIsAttending(result.data.is_attending);
      setAttendeeCount(result.data.attendee_count);
      toast.success(next ? "Kamu tercatat ikut event ini." : "Keikutsertaanmu dibatalkan.");
      // Clears the router cache too, so going back to the list doesn't replay the old state.
      router.refresh();
    } catch {
      setIsAttending(previous.isAttending);
      setAttendeeCount(previous.attendeeCount);
      toast.error("Gagal memperbarui keikutsertaan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return { isAttending, attendeeCount, saving, toggle };
}
