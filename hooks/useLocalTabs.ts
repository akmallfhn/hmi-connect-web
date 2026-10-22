"use client";

import { useSearchParams } from "next/navigation";

export function useLocalTabs<Value extends string>(
  items: readonly { value: Value }[],
  defaultValue: Value,
) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const activeTab =
    items.find((item) => item.value === requested)?.value ?? defaultValue;

  function selectTab(value: Value) {
    const url = new URL(window.location.href);
    if (value === defaultValue) url.searchParams.delete("tab");
    else url.searchParams.set("tab", value);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  return { activeTab, selectTab };
}
