"use client";

import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SortTypeEnum } from "@/lib/types";
import Button from "../buttons/Button";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  // The sort the server applied, or null for the backend default.
  activeSort: { by: string; type: SortTypeEnum } | null;
  // Set on the column the backend already sorts by when no sort is sent.
  defaultDirection?: SortTypeEnum;
  className?: string;
}

export default function SortableHeader({
  label,
  sortKey,
  activeSort,
  defaultDirection,
  className = "",
}: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const direction: SortTypeEnum | null = activeSort
    ? activeSort.by === sortKey
      ? activeSort.type
      : null
    : (defaultDirection ?? null);

  // Default column: default → opposite → default. Others: off → asc → desc → off.
  function nextDirection(): SortTypeEnum | null {
    if (defaultDirection) {
      return direction === defaultDirection
        ? defaultDirection === "asc"
          ? "desc"
          : "asc"
        : null;
    }
    if (direction === null) return "asc";
    return direction === "asc" ? "desc" : null;
  }

  function handleClick() {
    const next = nextDirection();
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("sort_by", sortKey);
      params.set("sort_type", next);
    } else {
      params.delete("sort_by");
      params.delete("sort_type");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  const Icon = direction === "desc" ? IconSortDescending : IconSortAscending;

  return (
    <th
      className={`px-4 py-2 ${className}`}
      aria-sort={
        direction === "asc"
          ? "ascending"
          : direction === "desc"
            ? "descending"
            : "none"
      }
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`-ml-3 text-[13px] font-semibold uppercase tracking-wide ${
          direction ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
        <Icon
          className={`size-4 ${direction ? "" : "opacity-50"}`}
          stroke={2}
        />
      </Button>
    </th>
  );
}
