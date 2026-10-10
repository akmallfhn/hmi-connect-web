"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MEMBER_FILTER_LEVELS,
  MEMBER_STATUS_OPTIONS,
  MEMBER_VERIFICATION_OPTIONS,
  type MemberFilterAnchors,
  type MemberFilterEntity,
  type MemberFilterLevel,
  type MemberFilterScope,
  type MemberFilterSelection,
} from "@/lib/member-filters";
import ActiveFilterChips, {
  type ActiveFilterChip,
} from "../common/ActiveFilterChips";
import FilterDropdown from "../common/FilterDropdown";
import Input from "../fields/Input";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import Select from "../fields/Select";

const LEVEL_PARAM: Record<MemberFilterLevel, string> = {
  coordinating_body: "coordinating_body_id",
  branch: "branch_id",
  coordinating_chapter: "coordinating_chapter_id",
  chapter: "chapter_id",
};

const LEVEL_LABEL: Record<MemberFilterLevel, string> = {
  coordinating_body: "Badko",
  branch: "Cabang",
  coordinating_chapter: "Korkom",
  chapter: "Komisariat",
};

const LEVEL_ORDER: MemberFilterLevel[] = [
  "coordinating_body",
  "branch",
  "coordinating_chapter",
  "chapter",
];

interface MemberFilterBarProps {
  scope: MemberFilterScope;
  anchors?: MemberFilterAnchors;
  initialSearch: string;
  selection: MemberFilterSelection;
}

function toOption(entity: MemberFilterEntity | null): SearchableOption | null {
  return entity ? { label: entity.name, value: entity.id } : null;
}

async function fetchOptions(path: string, params: Record<string, string>) {
  const response = await fetch(`${path}?${new URLSearchParams(params)}`);
  if (!response.ok) return { options: [], hasMore: false };
  const json = await response.json();
  const results: { id: string; name: string }[] = json.data ?? [];
  return {
    options: results.map((item) => ({ label: item.name, value: item.id })),
    hasMore: Boolean(json.hasMore),
  };
}

export default function MemberFilterBar({
  scope,
  anchors = {},
  initialSearch,
  selection,
}: MemberFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const levels = MEMBER_FILTER_LEVELS[scope];

  // Adjust state during render when the server hands back a new search value, same pattern as SearchPage.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const selected: Record<MemberFilterLevel, MemberFilterEntity | null> = {
    coordinating_body: selection.coordinatingBody,
    branch: selection.branch,
    coordinating_chapter: selection.coordinatingChapter,
    chapter: selection.chapter,
  };
  const bodyAnchor =
    selection.coordinatingBody?.id ?? anchors.coordinatingBodyId;
  const branchAnchor = selection.branch?.id ?? anchors.branchId;
  const korkomAnchor =
    selection.coordinatingChapter?.id ?? anchors.coordinatingChapterId;

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  // A parent change invalidates every pick beneath it, so those are cleared together.
  function setLevel(level: MemberFilterLevel, value: string) {
    const next: Record<string, string> = { [LEVEL_PARAM[level]]: value };
    LEVEL_ORDER.slice(LEVEL_ORDER.indexOf(level) + 1).forEach((child) => {
      next[LEVEL_PARAM[child]] = "";
    });
    pushParams(next);
  }

  function clearFilters() {
    pushParams({
      status: "",
      verification_status: "",
      ...Object.fromEntries(
        LEVEL_ORDER.map((level) => [LEVEL_PARAM[level], ""]),
      ),
    });
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushParams({ search: searchInput });
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const levelConfig: Record<
    MemberFilterLevel,
    {
      disabledHint?: string;
      load: (
        inputValue: string,
        page: number,
      ) => ReturnType<typeof fetchOptions>;
    }
  > = {
    coordinating_body: {
      load: (q, page) =>
        fetchOptions("/api/coordinating-bodies/search", {
          page: String(page),
          ...(q ? { q } : {}),
        }),
    },
    branch: {
      load: (q, page) =>
        fetchOptions("/api/branches/search", {
          page: String(page),
          ...(q ? { q } : {}),
          ...(bodyAnchor ? { coordinating_body_id: bodyAnchor } : {}),
        }),
    },
    coordinating_chapter: {
      disabledHint: branchAnchor ? undefined : "Pilih Cabang terlebih dahulu",
      load: (q, page) =>
        fetchOptions("/api/coordinating-chapters/search", {
          page: String(page),
          ...(q ? { q } : {}),
          branch_id: branchAnchor ?? "",
        }),
    },
    chapter: {
      disabledHint:
        branchAnchor || korkomAnchor
          ? undefined
          : "Pilih Cabang terlebih dahulu",
      load: (q, page) =>
        fetchOptions("/api/chapters/search", {
          page: String(page),
          ...(q ? { q } : {}),
          ...(korkomAnchor
            ? { coordinating_chapter_id: korkomAnchor }
            : { branch_id: branchAnchor ?? "" }),
        }),
    },
  };

  const statusLabel = MEMBER_STATUS_OPTIONS.find(
    (option) => option.value === selection.status,
  )?.label;
  const verificationLabel = MEMBER_VERIFICATION_OPTIONS.find(
    (option) => option.value === selection.verificationStatus,
  )?.label;

  const chips: ActiveFilterChip[] = [
    ...levels.flatMap((level) => {
      const entity = selected[level];
      return entity
        ? [
            {
              key: level,
              label: LEVEL_LABEL[level],
              value: entity.name,
              onRemove: () => setLevel(level, ""),
            },
          ]
        : [];
    }),
    ...(selection.status
      ? [
          {
            key: "status",
            label: "Status",
            value: statusLabel ?? selection.status,
            onRemove: () => pushParams({ status: "" }),
          },
        ]
      : []),
    ...(selection.verificationStatus
      ? [
          {
            key: "verification_status",
            label: "Verifikasi",
            value: verificationLabel ?? selection.verificationStatus,
            onRemove: () => pushParams({ verification_status: "" }),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId={`${scope}-member-search`}
            placeholder="Cari nama, username, atau email..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <FilterDropdown
          panelId={`${scope}-member-filters`}
          ariaLabel="Filter daftar kader"
          activeCount={chips.length}
          onReset={clearFilters}
          layout={levels.length > 0 ? "split" : "stack"}
        >
          {levels.length > 0 && (
            <div className="flex flex-col gap-3">
              {levels.map((level) => {
                const config = levelConfig[level];
                const option = toOption(selected[level]);
                return (
                  <SearchableSelect
                    // Remount when the parent pick changes so the option list reloads under the new scope.
                    key={`${level}-${bodyAnchor}-${branchAnchor}-${korkomAnchor}`}
                    selectId={`${scope}-member-${level}-filter`}
                    label={LEVEL_LABEL[level]}
                    placeholder={
                      config.disabledHint ?? `Semua ${LEVEL_LABEL[level]}`
                    }
                    value={option}
                    onChange={(next) =>
                      setLevel(level, next ? String(next.value) : "")
                    }
                    loadOptions={config.load}
                    defaultOptions={option ? [option] : []}
                    disabled={Boolean(config.disabledHint)}
                    portalMenu={false}
                  />
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Select
              selectId={`${scope}-member-status-filter`}
              label="Status Akun"
              placeholder="Semua Status"
              value={selection.status}
              onChange={(value) => pushParams({ status: String(value ?? "") })}
              options={MEMBER_STATUS_OPTIONS}
            />
            <Select
              selectId={`${scope}-member-verification-filter`}
              label="Status Verifikasi"
              placeholder="Semua Status Verifikasi"
              value={selection.verificationStatus}
              onChange={(value) =>
                pushParams({ verification_status: String(value ?? "") })
              }
              options={MEMBER_VERIFICATION_OPTIONS}
            />
          </div>
        </FilterDropdown>
      </div>

      <ActiveFilterChips chips={chips} onClearAll={clearFilters} />
    </>
  );
}
