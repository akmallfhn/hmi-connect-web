"use client";

import {
  CirclePause,
  CirclePlay,
  EllipsisVertical,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SpecialBodyAdminEntry } from "@/apis/special-bodies";
import {
  activateSpecialBody,
  deleteSpecialBody,
  suspendSpecialBody,
} from "@/lib/actions";
import {
  SPECIAL_BODY_FULL_NAME,
  SPECIAL_BODY_LABEL,
  SPECIAL_BODY_PARENT_TYPES,
  formatSpecialBodyName,
  formatSpecialBodyParent,
  specialBodyLevelLabel,
} from "@/lib/special-body";
import {
  isSuccessStatus,
  type AccessEntityTypeEnum,
  type SpecialBodyTypeEnum,
} from "@/lib/types";
import Button from "../buttons/Button";
import ActiveFilterChips, {
  type ActiveFilterChip,
} from "../common/ActiveFilterChips";
import AdminPageTitle from "../common/AdminPageTitle";
import Dropdown from "../common/Dropdown";
import FilterDropdown from "../common/FilterDropdown";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import CreateSpecialBodyFormSheet from "../forms/CreateSpecialBodyFormSheet";
import EditSpecialBodyFormSheet from "../forms/EditSpecialBodyFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";
import SpecialBodyLogoFallback from "../svg/SpecialBodyLogoFallback";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

export type SpecialBodyRow = SpecialBodyAdminEntry & { canManage: boolean };

interface AdminSpecialBodyListPageProps {
  type: SpecialBodyTypeEnum;
  specialBodies: SpecialBodyRow[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  pageSize: number;
  initialSearch: string;
  initialStatus: string;
  initialLevel: string;
  createParentLevels: AccessEntityTypeEnum[];
  organization: { id: string; name: string } | null;
  allowDelete?: boolean;
}

function parentLabel(body: SpecialBodyAdminEntry): string {
  if (!body.parent) {
    return `${specialBodyLevelLabel(body.parent_entity_type)} tidak ditemukan`;
  }
  return formatSpecialBodyParent(body.parent_entity_type, body.parent.name);
}

function displayName(body: SpecialBodyAdminEntry): string {
  return formatSpecialBodyName(body.type, body.parent_entity_type, body.name);
}

function SpecialBodyLogo({ body, className }: { body: SpecialBodyAdminEntry; className: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted ${className}`}
    >
      {body.image_url ? (
        <Image
          src={body.image_url}
          alt={displayName(body)}
          width={48}
          height={48}
          className="size-full object-cover"
        />
      ) : (
        <SpecialBodyLogoFallback type={body.type} className="h-7 w-auto" />
      )}
    </span>
  );
}

function StatusLabel({ body, size }: { body: SpecialBodyAdminEntry; size?: "sm" }) {
  return (
    <Label size={size} variant={body.status === "active" ? "green" : "red"}>
      {body.status === "active" ? "Aktif" : "Tidak Aktif"}
    </Label>
  );
}

function ParentCell({ body }: { body: SpecialBodyAdminEntry }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-heading">{parentLabel(body)}</p>
      {body.parent?.branchName && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatSpecialBodyParent("branch", body.parent.branchName)}
        </p>
      )}
    </div>
  );
}

export default function AdminSpecialBodyListPage({
  type,
  specialBodies,
  totalData,
  totalPage,
  currentPage,
  pageSize,
  initialSearch,
  initialStatus,
  initialLevel,
  createParentLevels,
  organization,
  allowDelete = false,
}: AdminSpecialBodyListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const label = SPECIAL_BODY_LABEL[type];

  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SpecialBodyRow | null>(null);
  const [statusTarget, setStatusTarget] = useState<SpecialBodyRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpecialBodyRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushParams({ search: searchInput.trim() });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function handleStatusChange() {
    if (!statusTarget) return;
    const suspending = statusTarget.status === "active";
    setIsSubmitting(true);
    try {
      const result = suspending
        ? await suspendSpecialBody(statusTarget.id)
        : await activateSpecialBody(statusTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? `Gagal mengubah status ${label}.`);
        return;
      }
      toast.success(suspending ? `${label} disuspend.` : `${label} diaktifkan kembali.`);
      setStatusTarget(null);
      router.refresh();
    } catch (error) {
      console.error("[AdminSpecialBodyListPage] status change threw:", error);
      toast.error(`Gagal mengubah status ${label}. Coba lagi.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!allowDelete || !deleteTarget) return;
    setIsSubmitting(true);
    try {
      const result = await deleteSpecialBody(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? `Gagal menghapus ${label}.`);
        return;
      }
      toast.success(`${label} berhasil dihapus.`);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error("[AdminSpecialBodyListPage] delete threw:", error);
      toast.error(`Gagal menghapus ${label}. Coba lagi.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderActions(body: SpecialBodyRow) {
    if (!body.canManage && !allowDelete) {
      return <span className="text-sm text-muted-foreground">—</span>;
    }
    return (
      <Dropdown
        panelClassName="w-44 rounded-xl"
        trigger={({ toggle }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={`Aksi untuk ${displayName(body)}`}
          >
            <EllipsisVertical className="size-4" />
          </Button>
        )}
      >
        {body.canManage && (
          <>
            <button
              type="button"
              onClick={() => setEditTarget(body)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
            >
              <Pencil className="size-4 text-muted-foreground" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setStatusTarget(body)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-heading transition hover:bg-surface-muted"
            >
              {body.status === "active" ? (
                <CirclePause className="size-4 text-muted-foreground" />
              ) : (
                <CirclePlay className="size-4 text-muted-foreground" />
              )}
              {body.status === "active" ? "Suspend" : "Aktifkan"}
            </button>
          </>
        )}
        {allowDelete && (
          <button
            type="button"
            onClick={() => setDeleteTarget(body)}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive-foreground transition hover:bg-destructive-soft"
          >
            <Trash2 className="size-4" />
            Hapus
          </button>
        )}
      </Dropdown>
    );
  }

  const levelOptions = [
    { label: "Semua Tingkatan", value: "" },
    ...SPECIAL_BODY_PARENT_TYPES[type].map((level) => ({
      label: specialBodyLevelLabel(level),
      value: level,
    })),
  ];

  const filterChips: ActiveFilterChip[] = [
    ...(initialLevel
      ? [
          {
            key: "level",
            label: "Tingkatan",
            value:
              levelOptions.find((option) => option.value === initialLevel)
                ?.label ?? initialLevel,
            onRemove: () => pushParams({ level: "" }),
          },
        ]
      : []),
    ...(initialStatus
      ? [
          {
            key: "status",
            label: "Status",
            value:
              STATUS_FILTER_OPTIONS.find(
                (option) => option.value === initialStatus,
              )?.label ?? initialStatus,
            onRemove: () => pushParams({ status: "" }),
          },
        ]
      : []),
  ];

  function clearFilters() {
    pushParams({ level: "", status: "" });
  }

  const allowCreate = createParentLevels.length > 0;
  const isFiltered = Boolean(initialSearch || initialStatus || initialLevel);
  const statusSuspending = statusTarget?.status === "active";

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <AdminPageTitle
            description={`Kelola ${label} (${SPECIAL_BODY_FULL_NAME[type]}) di seluruh tingkat HMI.`}
          >
            {label}
          </AdminPageTitle>
        </div>
        {allowCreate && (
          <div className="hidden sm:block">
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <PlusCircle className="size-4" />
              Tambah {label}
            </Button>
          </div>
        )}
      </div>

      {allowCreate && (
        <Button
          variant="primary"
          size="icon"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-20 size-14! rounded-full! shadow-lg sm:hidden"
          aria-label={`Tambah ${label}`}
          title={`Tambah ${label}`}
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-6" />
        </Button>
      )}

      <div className="mt-6 flex items-center gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="special-body-search"
            placeholder={`Cari nama ${label}...`}
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <FilterDropdown
          panelId="special-body-filters"
          ariaLabel={`Filter daftar ${label}`}
          activeCount={filterChips.length}
          onReset={clearFilters}
        >
          {levelOptions.length > 2 && (
            <Select
              selectId="special-body-level-filter"
              label="Tingkatan"
              placeholder="Semua Tingkatan"
              value={initialLevel || null}
              onChange={(value) => pushParams({ level: String(value ?? "") })}
              options={levelOptions}
            />
          )}
          <Select
            selectId="special-body-status-filter"
            label="Status"
            placeholder="Semua Status"
            value={initialStatus || null}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </FilterDropdown>
      </div>

      <ActiveFilterChips chips={filterChips} onClearAll={clearFilters} />

      {specialBodies.length === 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <EmptyState
            title={isFiltered ? `${label} tidak ditemukan` : `Belum ada ${label}`}
            description={
              isFiltered
                ? "Coba ubah kata kunci pencarian atau filter."
                : `${label} yang ditambahkan akan ditampilkan di sini.`
            }
            action={
              !isFiltered && allowCreate ? (
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  <PlusCircle className="size-4" />
                  Tambah {label}
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Nama {label}</th>
                    <th className="px-4 py-3">Dinaungi Oleh</th>
                    <th className="px-4 py-3">Tingkatan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider text-[13px]">
                  {specialBodies.map((body) => (
                    <tr key={body.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <SpecialBodyLogo body={body} className="size-10" />
                          <p className="truncate text-sm font-semibold text-heading">
                            {displayName(body)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ParentCell body={body} />
                      </td>
                      <td className="px-4 py-3 text-heading">
                        {specialBodyLevelLabel(body.parent_entity_type)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusLabel body={body} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {renderActions(body)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
            {specialBodies.map((body) => (
              <div
                key={body.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <SpecialBodyLogo body={body} className="size-11" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-heading">
                      {displayName(body)}
                    </p>
                    <StatusLabel body={body} size="sm" />
                  </div>
                </div>
                {renderActions(body)}
                <div className="col-span-full border-t border-border pt-3 text-xs">
                  <p className="text-muted-foreground">
                    Dinaungi oleh ·{" "}
                    {specialBodyLevelLabel(body.parent_entity_type)}
                  </p>
                  <div className="mt-0.5 text-[13px]">
                    <ParentCell body={body} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Pagination currentPage={currentPage} totalPages={totalPage} />
            <p className="text-center text-sm text-muted-foreground">
              Menampilkan {(currentPage - 1) * pageSize + 1}–
              {(currentPage - 1) * pageSize + specialBodies.length} dari{" "}
              {totalData} {label}
            </p>
          </div>
        </>
      )}

      {allowCreate && (
        <CreateSpecialBodyFormSheet
          open={createOpen}
          type={type}
          parentLevels={createParentLevels}
          organization={organization}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      )}

      <EditSpecialBodyFormSheet
        open={editTarget !== null}
        specialBody={editTarget}
        parentLabel={editTarget ? parentLabel(editTarget) : ""}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          router.refresh();
        }}
      />

      <AlertConfirmation
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        onConfirm={() => void handleStatusChange()}
        title={statusSuspending ? `Suspend ${label} ini?` : `Aktifkan ${label} ini?`}
        message={
          statusSuspending
            ? `${statusTarget ? displayName(statusTarget) : label} akan dinonaktifkan sampai diaktifkan kembali.`
            : `${statusTarget ? displayName(statusTarget) : label} akan aktif kembali.`
        }
        confirmLabel={statusSuspending ? "Suspend" : "Aktifkan"}
        confirmVariant={statusSuspending ? "destructive" : "primary"}
        loading={isSubmitting}
      />

      {allowDelete && (
        <AlertConfirmation
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void handleDelete()}
          title={`Hapus ${label} ini?`}
          message={`Apakah kamu yakin ingin menghapus ${deleteTarget ? displayName(deleteTarget) : label}? Slot ${label} di induknya akan kosong kembali.`}
          confirmLabel="Hapus"
          loading={isSubmitting}
        />
      )}
    </div>
  );
}
