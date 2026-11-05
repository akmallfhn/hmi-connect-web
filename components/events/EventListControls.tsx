"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "../buttons/Button";
import Input from "../fields/Input";

function buildHref(basePath: string, search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function EventListControls({
  basePath,
  initialSearch,
}: {
  basePath: string;
  initialSearch: string;
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
    router.push(buildHref(basePath, search.trim()));
  }

  return (
    <div className="flex justify-start">
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
                  router.push(buildHref(basePath, ""));
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
