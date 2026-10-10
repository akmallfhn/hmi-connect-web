"use client";

import Link from "next/link";

export interface TabItem<Value extends string> {
  value: Value;
  label: string;
  description?: string;
  href?: string;
}

interface TabsProps<Value extends string> {
  ariaLabel: string;
  items: readonly TabItem<Value>[];
  activeValue: Value;
  onChange?: (value: Value) => void;
  className?: string;
}

export default function Tabs<Value extends string>({
  ariaLabel,
  items,
  activeValue,
  onChange,
  className = "",
}: TabsProps<Value>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 overflow-x-auto rounded-full border border-border bg-surface-subtle p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {items.map((item) => {
        const active = item.value === activeValue;
        const content = (
          <>
            {item.label}
            {item.description && (
              <span className={active ? "text-on-dark/65" : "text-subtle-foreground"}>
                {" · "}
                {item.description}
              </span>
            )}
          </>
        );
        const tabClassName = `min-w-max flex-1 cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/30 sm:px-3 sm:text-sm lg:min-w-[96px] lg:flex-none ${
          active
            ? "bg-tertiary text-on-dark"
            : "bg-surface-subtle text-muted-foreground hover:bg-surface-muted hover:text-heading"
        }`;

        return item.href ? (
          <Link
            key={item.value}
            href={item.href}
            role="tab"
            aria-selected={active}
            scroll={false}
            className={tabClassName}
          >
            {content}
          </Link>
        ) : (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(item.value)}
            className={tabClassName}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
