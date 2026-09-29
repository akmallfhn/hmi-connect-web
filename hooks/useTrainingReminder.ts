"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  activateTrainingReminder,
  deactivateTrainingReminder,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";

const REMINDER_CHANGE_EVENT = "hmi-training-reminder-change";

type ReminderChange = { trainingId: string; active: boolean };

// Server state is the source of truth; the in-memory event only keeps sibling cards for one training in step.
export function useTrainingReminder({
  trainingId,
  initialActive,
  isSignedIn,
}: {
  trainingId: string;
  initialActive: boolean | null | undefined;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(initialActive ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleChange(event: Event) {
      const detail = (event as CustomEvent<ReminderChange>).detail;
      if (detail.trainingId === trainingId) setActive(detail.active);
    }
    window.addEventListener(REMINDER_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(REMINDER_CHANGE_EVENT, handleChange);
  }, [trainingId]);

  function broadcast(value: boolean) {
    window.dispatchEvent(
      new CustomEvent<ReminderChange>(REMINDER_CHANGE_EVENT, {
        detail: { trainingId, active: value },
      })
    );
  }

  async function toggle() {
    if (!isSignedIn) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (saving) return;

    const next = !active;
    setActive(next);
    setSaving(true);
    try {
      const result = next
        ? await activateTrainingReminder(trainingId)
        : await deactivateTrainingReminder(trainingId);
      if (!isSuccessStatus(result.status)) throw new Error(result.message);
      broadcast(next);
      toast.success(
        next
          ? "Pengingat aktif. Kami akan mengirim email H-7, H-3, dan H-1."
          : "Pengingat dinonaktifkan."
      );
    } catch {
      setActive(!next);
      toast.error("Gagal memperbarui pengingat. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return { active, saving, toggle };
}
