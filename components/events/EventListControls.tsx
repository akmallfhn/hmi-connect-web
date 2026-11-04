"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { EventTimeframe } from "@/apis/events";
import Button from "../buttons/Button";
import Tabs from "../common/Tabs";
import Input from "../fields/Input";

function buildHref(basePath: string, timeframe: EventTimeframe, search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (timeframe === "past") params.set("tab", "past");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function EventListControls({
  basePath,
  timeframe,
  initialSearch,
  upcomingCount,
  pastCount,
}: {
  basePath: string;
  timeframe: EventTimeframe;
  initialSearch: string;
  upcomingCount: number;
  pastCount: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [seenSearch, setSeenSearch] = useState(initialSearch);

  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearch(initialSearch);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildHref(basePath, timeframe, search.trim()));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        ariaLabel="Waktu event"
        activeValue={timeframe}
        items={[
          {
            value: "upcoming",
            label: "Akan datang",
            description: String(upcomingCount),
            href: buildHref(basePath, "upcoming", initialSearch),
          },
          {
            value: "past",
            label: "Selesai",
            description: String(pastCount),
            href: buildHref(basePath, "past", initialSearch),
          },
        ]}
      />
      <form onSubmit={handleSubmit} className="w-full sm:max-w-sm">
        <Input
          inputId="event-search"
          type="search"
          aria-label="Cari judul event"
          placeholder="Cari judul event"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          icon={<IconSearch className="size-4 text-subtle-foreground" stroke={2} />}
          className="h-11 rounded-full bg-surface pr-12 text-sm"
          trailing={
            search ? (
              <Button
                variant="ghost"
                size="iconSm"
                aria-label="Hapus pencarian"
                onClick={() => {
                  setSearch("");
                  router.push(buildHref(basePath, timeframe, ""));
                }}
              >
                <IconX className="size-4" stroke={2} />
              </Button>
            ) : undefined
          }
        />
      </form>
    </div>
  );
}
