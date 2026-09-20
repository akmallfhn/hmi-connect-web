"use client";

import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Input from "../fields/Input";

export default function ExploreSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    if (!value) return;

    router.push(`/search?${new URLSearchParams({ q: value }).toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <Input
        inputId="home-explore-search"
        type="search"
        aria-label="Cari di HMI Connect"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari di HMI Connect"
        icon={<IconSearch aria-hidden="true" className="size-4" stroke={1.8} />}
        className="h-10 rounded-xl py-0 text-sm"
      />
    </form>
  );
}
