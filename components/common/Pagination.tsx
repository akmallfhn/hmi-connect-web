"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../buttons/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  queryKey?: string;
}

// Numbered pagination driving ?page=, same page-window/ellipsis logic as sevenpreneur's AppNumberPagination, ported to plain Tailwind.
export default function Pagination({
  currentPage,
  totalPages,
  queryKey = "page",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    if (page === currentPage || page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryKey, String(page));
    router.push(`?${params.toString()}`);
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    const maxVisible = 5;
    const pages: (number | "ellipsis")[] = [1];

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) end = Math.min(maxVisible, totalPages - 1);
    if (currentPage >= totalPages - 2) start = Math.max(2, totalPages - maxVisible + 1);

    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="default"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Button>

      {getPageNumbers().map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-[#5f6573]"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "outline"}
            size="icon"
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="default"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <span className="hidden sm:inline">Selanjutnya</span>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
