"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  EllipsisVertical,
  Eye,
  LayoutGrid,
  Pencil,
  PlusCircle,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CoordinatingBodyListEntry } from "@/apis/coordinating-bodies";
import { deleteCoordinatingBody } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import CreateCoordinatingBodyFormSheet from "../forms/CreateCoordinatingBodyFormSheet";
import EditCoordinatingBodyFormSheet from "../forms/EditCoordinatingBodyFormSheet";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";
import LogoHmi from "../svg/LogoHmi";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

type ViewMode = "table" | "card";

const VIEW_MODE_STORAGE_KEY = "coordinating_body_view_mode";

interface AdminCoordinatingBodyListPageProps {
  coordinatingBodies: CoordinatingBodyListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  pageSize: number;
  allowDelete?: boolean;
  detailBasePath?: string;
}

function formatCoordinatingBodyName(name: string) {
  const normalizedName = name.replace(/^(?:hmi\s+)?badko\s+/i, "").trim();
  return `Badko ${normalizedName || name}`;
}

// Square, rounded-lg badge — falls back to the LogoHmi emblem (same treatment as EntitySidebar's header badge) when image_url is unset.
function CoordinatingBodyLogo({
  imageUrl,
  name,
  containerClassName,
  logoClassName,
}: {
  imageUrl: string | null;
  name: string;
  containerClassName: string;
  logoClassName: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb] ${containerClassName}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={64}
          height={64}
          className="h-full w-full object-cover"
        />
      ) : (
        <LogoHmi className={logoClassName} />
      )}
    </span>
  );
}

export default function AdminCoordinatingBodyListPage({
  coordinatingBodies,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  pageSize,
  allowDelete = true,
  detailBasePath = "/master/coordinating-bodies",
}: AdminCoordinatingBodyListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "Adjust state during render" (not a useEffect) when the server hands back a new initialSearch, same pattern as SearchPage.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  // Always start on table view so the client's first render matches the server's (no localStorage access there).
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "table" || stored === "card") setViewMode(stored);
  }, []);

  // Persisted from the click handler itself (not a reactive effect on viewMode) so the read-on-mount above never races a write that clobbers it right back.
  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editTarget, setEditTarget] =
    useState<CoordinatingBodyListEntry | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<CoordinatingBodyListEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushParams({ search: searchInput });
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function handleDelete() {
    if (!allowDelete || !deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteCoordinatingBody(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus Badko.");
        return;
      }
      toast.success("Badko berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(
        "[AdminCoordinatingBodyListPage] deleteCoordinatingBody threw:",
        err,
      );
      toast.error("Gagal menghapus Badko.");
    } finally {
      setIsDeleting(false);
    }
  }

  function renderActions(coordinatingBody: CoordinatingBodyListEntry) {
    if (!allowDelete) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`${detailBasePath}/${coordinatingBody.id}`)
          }
        >
          <Eye className="size-4" />
          Lihat Detail
        </Button>
      );
    }

    return (
      <Dropdown
        panelClassName="w-44 rounded-xl"
        trigger={({ toggle }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Aksi"
          >
            <EllipsisVertical className="size-4" />
          </Button>
        )}
      >
        <button
          type="button"
          onClick={() =>
            router.push(`${detailBasePath}/${coordinatingBody.id}`)
          }
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
        >
          <Eye className="size-4 text-[#5f6573]" />
          Lihat Detail
        </button>
        <button
          type="button"
          onClick={() => setEditTarget(coordinatingBody)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
        >
          <Pencil className="size-4 text-[#5f6573]" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setDeleteTarget(coordinatingBody)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
        >
          <Trash2 className="size-4" />
          Hapus
        </button>
      </Dropdown>
    );
  }

  function renderCardAction(coordinatingBody: CoordinatingBodyListEntry) {
    if (allowDelete) {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDeleteTarget(coordinatingBody);
          }}
          aria-label="Hapus Badko"
          className="text-destructive hover:bg-destructive-soft"
        >
          <Trash2 className="size-4" />
        </Button>
      );
    }

    return null;
  }

  const isEmpty = coordinatingBodies.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <AdminPageTitle description="Kelola data Badan Koordinasi (Badko) HMI.">
            Badko
          </AdminPageTitle>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="w-fit"
        >
          <PlusCircle className="size-4" />
          Tambah Badko
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="coordinating-body-search"
            placeholder="Cari nama Badko..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-52">
          <Select
            selectId="coordinating-body-status-filter"
            placeholder="Filter Status"
            value={initialStatus || null}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
        <div className="flex shrink-0 rounded-lg border border-[#dbe3ef] bg-white p-0.5 sm:ml-auto">
          <button
            type="button"
            onClick={() => handleViewModeChange("table")}
            aria-pressed={viewMode === "table"}
            title="Tampilan Tabel"
            className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors ${
              viewMode === "table"
                ? "bg-primary-soft text-primary"
                : "text-[#5f6573] hover:text-[#172033]"
            }`}
          >
            <Table2 className="size-3.5" />
            <span className="hidden sm:inline">Tabel</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("card")}
            aria-pressed={viewMode === "card"}
            title="Tampilan Card"
            className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors ${
              viewMode === "card"
                ? "bg-primary-soft text-primary"
                : "text-[#5f6573] hover:text-[#172033]"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">Card</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
          <EmptyState
            title={
              initialSearch || initialStatus
                ? "Badko tidak ditemukan"
                : "Belum ada Badko"
            }
            description={
              initialSearch || initialStatus
                ? "Coba ubah kata kunci pencarian atau filter status."
                : "Badko yang ditambahkan akan ditampilkan di sini."
            }
          />
        </div>
      ) : viewMode === "table" ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Nama Badko</th>
                  <th className="px-4 py-3">Jumlah Cabang</th>
                  <th className="px-4 py-3">Jumlah Kader</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {coordinatingBodies.map((coordinatingBody) => (
                  <tr key={coordinatingBody.id} className="align-middle">
                    <td className="px-4 py-3">
                      <Link
                        href={`${detailBasePath}/${coordinatingBody.id}`}
                        className="flex w-fit min-w-0 items-center gap-3"
                      >
                        <CoordinatingBodyLogo
                          imageUrl={coordinatingBody.image_url}
                          name={coordinatingBody.name}
                          containerClassName="size-10"
                          logoClassName="h-7 w-auto"
                        />
                        <p className="truncate text-sm font-semibold text-[#172033] hover:text-primary">
                          {formatCoordinatingBodyName(coordinatingBody.name)}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {coordinatingBody.branch_count ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {coordinatingBody.user_count ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Label
                        variant={
                          coordinatingBody.status === "active" ? "green" : "red"
                        }
                      >
                        {coordinatingBody.status === "active"
                          ? "Aktif"
                          : "Tidak Aktif"}
                      </Label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {renderActions(coordinatingBody)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coordinatingBodies.map((coordinatingBody) => (
            <Link
              key={coordinatingBody.id}
              href={`${detailBasePath}/${coordinatingBody.id}`}
              className="flex flex-col gap-4 rounded-xl border border-[#e6e9ef] bg-white p-5 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <CoordinatingBodyLogo
                    imageUrl={coordinatingBody.image_url}
                    name={coordinatingBody.name}
                    containerClassName="size-12"
                    logoClassName="h-8 w-auto"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#172033]">
                      {formatCoordinatingBodyName(coordinatingBody.name)}
                    </p>
                    <Label
                      size="sm"
                      variant={
                        coordinatingBody.status === "active" ? "green" : "red"
                      }
                    >
                      {coordinatingBody.status === "active"
                        ? "Aktif"
                        : "Tidak Aktif"}
                    </Label>
                  </div>
                </div>
                {renderCardAction(coordinatingBody)}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[#e6e9ef] pt-3 text-[13px]">
                <span className="text-[#5f6573]">
                  Jumlah Cabang{" "}
                  <span className="font-semibold text-[#172033]">
                    {coordinatingBody.branch_count ?? "—"}
                  </span>
                </span>
                <span className="text-[#5f6573]">
                  Jumlah Kader{" "}
                  <span className="font-semibold text-[#172033]">
                    {coordinatingBody.user_count ?? "—"}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {coordinatingBodies.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + coordinatingBodies.length} dari{" "}
            {totalData} Badko
          </p>
        </div>
      )}

      <CreateCoordinatingBodyFormSheet
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSaved={() => {
          setShowCreateForm(false);
          router.refresh();
        }}
      />

      <EditCoordinatingBodyFormSheet
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          router.refresh();
        }}
        coordinatingBody={editTarget}
      />

      {allowDelete && (
        <AlertConfirmation
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Hapus Badko ini?"
          message={`Apakah kamu yakin ingin menghapus ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          loading={isDeleting}
        />
      )}
    </div>
  );
}
