import type { EventStatusTone } from "@/lib/event-ui";
import Label, { type LabelVariant } from "../common/Label";

const TONE_VARIANT: Record<EventStatusTone, LabelVariant> = {
  live: "green",
  soon: "orange",
  upcoming: "blue",
  ended: "gray",
};

export default function EventStatusLabel({
  label,
  tone,
  className,
}: {
  label: string;
  tone: EventStatusTone;
  className?: string;
}) {
  return (
    <Label variant={TONE_VARIANT[tone]} className={className}>
      {tone === "live" && (
        <span className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" />
      )}
      {label}
    </Label>
  );
}
