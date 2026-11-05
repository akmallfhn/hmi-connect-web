"use client";

import { IconInfoCircle } from "@tabler/icons-react";

export default function FieldHelpTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <IconInfoCircle className="size-4" stroke={2} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 hidden w-64 rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs leading-5 text-heading shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
