import { formatEventDateTile } from "@/lib/event-ui";

export default function EventDateTile({ value }: { value: string }) {
  const { day, month } = formatEventDateTile(value);
  return (
    <span className="flex w-12 shrink-0 flex-col overflow-hidden rounded-lg border border-border-strong bg-surface text-center">
      <span className="bg-secondary-soft py-0.5 text-[11px] font-semibold tracking-wide text-secondary-foreground">
        {month}
      </span>
      <span className="py-1 font-stack-sans-headline text-lg font-medium leading-6 text-heading">
        {day}
      </span>
    </span>
  );
}
