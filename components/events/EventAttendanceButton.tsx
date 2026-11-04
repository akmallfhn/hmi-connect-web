"use client";

import { IconCheck, IconUserPlus } from "@tabler/icons-react";
import Button from "../buttons/Button";

export default function EventAttendanceButton({
  isAttending,
  saving,
  ended,
  onToggle,
  className,
}: {
  isAttending: boolean;
  saving: boolean;
  ended: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const label = isAttending ? "Kamu ikut" : ended ? "Event selesai" : "Saya mau ikut";

  return (
    <Button
      variant={isAttending ? "soft" : "primary"}
      onClick={onToggle}
      disabled={ended}
      aria-pressed={isAttending}
      aria-busy={saving}
      title={isAttending && !ended ? "Klik untuk membatalkan" : undefined}
      className={className}
    >
      {isAttending ? (
        <IconCheck className="size-4.5" stroke={2.4} />
      ) : (
        !ended && <IconUserPlus className="size-4.5" stroke={2.2} />
      )}
      {label}
    </Button>
  );
}
