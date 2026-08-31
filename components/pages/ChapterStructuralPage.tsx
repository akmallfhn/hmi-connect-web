"use client";

import {
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  PlusCircle,
  Power,
  PowerOff,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ChapterDetail } from "@/apis/chapters";
import type {
  StructuralOfficer,
  StructuralPeriodDetail,
  StructuralPeriodSummary,
} from "@/apis/structurals";
import {
  createStructuralOfficer,
  createStructuralPeriod,
  deleteStructuralOfficer,
  updateStructuralOfficer,
  updateStructuralPeriod,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import AdminPageTitle from "../common/AdminPageTitle";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Label from "../common/Label";
import NumberInput from "../fields/NumberInput";
import Select from "../fields/Select";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import AlertConfirmation from "../modals/AlertConfirmation";
import Modal from "../modals/Modal";
import EmptyState from "../states/EmptyState";

interface ChapterStructuralPageProps {
  chapter: ChapterDetail;
  periods: StructuralPeriodSummary[];
  selectedPeriod: StructuralPeriodDetail | null;
  selectedPeriodId: number | null;
  canManage: boolean;
}

function periodLabel(
  period: Pick<StructuralPeriodSummary, "start_year" | "end_year">
) {
  return period.end_year
    ? `${period.start_year} - ${period.end_year}`
    : `${period.start_year} - sekarang`;
}

function isKetuaUmum(positionName: string) {
  return /ketua\s+umum/i.test(positionName);
}

function isSekretaris(positionName: string) {
  return /sekretaris\s+(jenderal|umum)/i.test(positionName);
}

function isBendaharaUmum(positionName: string) {
  return /bendahara\s+umum/i.test(positionName);
}

const TIER_ROW_SIZE = 3;

// Root is Ketua Umum by name match; Sekretaris/Bendahara Umum form the next tier regardless of position_id; the rest chunk into rows of TIER_ROW_SIZE.
function buildStructuralTiers(officers: StructuralOfficer[]): {
  root: StructuralOfficer | undefined;
  tiers: StructuralOfficer[][];
} {
  if (officers.length === 0) return { root: undefined, tiers: [] };

  const root =
    officers.find((officer) => isKetuaUmum(officer.position_name)) ??
    officers[0];
  const remaining = officers.filter((officer) => officer.id !== root.id);

  const secretary = remaining.find((officer) =>
    isSekretaris(officer.position_name)
  );
  const treasurer = remaining.find((officer) =>
    isBendaharaUmum(officer.position_name)
  );
  const secondTier = [secretary, treasurer].filter(
    (officer): officer is StructuralOfficer => Boolean(officer)
  );
  const secondTierIds = new Set(secondTier.map((officer) => officer.id));

  const rest = remaining.filter((officer) => !secondTierIds.has(officer.id));
  const restTiers: StructuralOfficer[][] = [];
  for (let i = 0; i < rest.length; i += TIER_ROW_SIZE) {
    restTiers.push(rest.slice(i, i + TIER_ROW_SIZE));
  }

  const tiers = secondTier.length > 0 ? [secondTier, ...restTiers] : restTiers;
  return { root, tiers };
}

async function loadChapterUserOptions(
  chapterId: string,
  inputValue: string,
  page: number
) {
  const params = new URLSearchParams({
    q: inputValue,
    page: String(page),
    chapter_id: chapterId,
  });
  const response = await fetch(`/api/users/search?${params}`);
  const json = await response.json();
  const results: { id: string; full_name: string; avatar?: string }[] =
    json.data ?? [];
  return {
    options: results.map((item) => ({
      label: item.full_name,
      value: item.id,
      image: item.avatar,
    })),
    hasMore: Boolean(json.hasMore),
  };
}

async function loadStructuralPositionOptions(inputValue: string, page: number) {
  const params = new URLSearchParams({ q: inputValue, page: String(page) });
  const response = await fetch(`/api/structural-positions/search?${params}`);
  const json = await response.json();
  const results: { id: number; name: string }[] = json.data ?? [];
  return {
    options: results.map((item) => ({ label: item.name, value: item.id })),
    hasMore: Boolean(json.hasMore),
  };
}

export default function ChapterStructuralPage({
  chapter,
  periods,
  selectedPeriod,
  selectedPeriodId,
  canManage,
}: ChapterStructuralPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreatePeriod, setShowCreatePeriod] = useState(false);
  const [showUpdatePeriod, setShowUpdatePeriod] = useState(false);
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [statusTarget, setStatusTarget] = useState<StructuralOfficer | null>(
    null
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [positionTarget, setPositionTarget] =
    useState<StructuralOfficer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StructuralOfficer | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  function selectPeriod(id: number | string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === null) params.delete("period");
    else params.set("period", String(id));
    router.push(`?${params.toString()}`);
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    const nextStatus =
      statusTarget.status === "active" ? "inactive" : "active";
    setIsUpdatingStatus(true);
    try {
      const result = await updateStructuralOfficer({
        id: statusTarget.id,
        status: nextStatus,
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui status anggota.");
        return;
      }
      toast.success(
        nextStatus === "active"
          ? "Anggota berhasil diaktifkan."
          : "Anggota berhasil dinonaktifkan."
      );
      setStatusTarget(null);
      router.refresh();
    } catch (err) {
      console.error(
        "[ChapterStructuralPage] update officer status threw:",
        err
      );
      toast.error("Gagal memperbarui status anggota.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDeleteOfficer() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteStructuralOfficer(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus anggota.");
        return;
      }
      toast.success("Anggota berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[ChapterStructuralPage] delete officer threw:", err);
      toast.error("Gagal menghapus anggota.");
    } finally {
      setIsDeleting(false);
    }
  }

  const { root, tiers } = buildStructuralTiers(selectedPeriod?.officers ?? []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageTitle>Struktur Kepengurusan</AdminPageTitle>

        {canManage && (
          <Button
            variant="primary"
            onClick={() => setShowCreatePeriod(true)}
            className="w-fit shrink-0"
          >
            <PlusCircle className="size-4" />
            Tambah Periode Kepengurusan
          </Button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {periods.length === 0 ? (
          <EmptyState
            title="Struktur kepengurusan belum tersedia"
            description="Belum ada periode kepengurusan untuk Komisariat ini."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e9ef] p-4 sm:p-6">
              <div className="w-full max-w-xs">
                <Select
                  selectId="structural-period"
                  placeholder="Pilih periode"
                  value={selectedPeriodId}
                  onChange={selectPeriod}
                  options={periods.map((period) => ({
                    label: `Periode ${periodLabel(period)}`,
                    value: period.id,
                  }))}
                />
              </div>
              {canManage && selectedPeriod && (
                <div className="flex w-fit shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpdatePeriod(true)}
                    className="w-fit shrink-0"
                  >
                    <Pencil className="size-4" />
                    Update Periode
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddOfficer(true)}
                    className="w-fit shrink-0"
                  >
                    <UserPlus className="size-4" />
                    Tambah Anggota
                  </Button>
                </div>
              )}
            </div>

            {!selectedPeriod || !root ? (
              <EmptyState
                title="Belum ada anggota"
                description="Anggota kepengurusan periode ini akan ditampilkan di sini."
              />
            ) : (
              <div className="flex flex-col items-center gap-2 overflow-x-auto p-6 sm:p-10">
                <div className="flex min-w-max flex-col items-center">
                  <OfficerNode
                    officer={root}
                    canManage={canManage}
                    onToggleStatus={() => setStatusTarget(root)}
                    onUpdatePosition={() => setPositionTarget(root)}
                    onDelete={() => setDeleteTarget(root)}
                  />

                  {tiers.map((tier, index) => (
                    <TreeTier
                      key={index}
                      officers={tier}
                      canManage={canManage}
                      onSelectOfficer={setStatusTarget}
                      onUpdatePosition={setPositionTarget}
                      onDeleteOfficer={setDeleteTarget}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {canManage && (
        <CreatePeriodModal
          open={showCreatePeriod}
          onClose={() => setShowCreatePeriod(false)}
          chapterId={chapter.id}
          onCreated={(newPeriodId) => {
            setShowCreatePeriod(false);
            selectPeriod(newPeriodId);
          }}
        />
      )}

      {canManage && selectedPeriod && (
        <UpdatePeriodModal
          open={showUpdatePeriod}
          onClose={() => setShowUpdatePeriod(false)}
          period={selectedPeriod}
          onUpdated={() => {
            setShowUpdatePeriod(false);
            router.refresh();
          }}
        />
      )}

      {canManage && selectedPeriod && (
        <AddOfficerModal
          open={showAddOfficer}
          onClose={() => setShowAddOfficer(false)}
          chapterId={chapter.id}
          periodId={selectedPeriod.id}
          onAdded={() => {
            setShowAddOfficer(false);
            router.refresh();
          }}
        />
      )}

      {canManage && positionTarget && (
        <UpdateOfficerPositionModal
          open={positionTarget !== null}
          onClose={() => setPositionTarget(null)}
          officer={positionTarget}
          onUpdated={() => {
            setPositionTarget(null);
            router.refresh();
          }}
        />
      )}

      <AlertConfirmation
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleStatus}
        title={
          statusTarget?.status === "active"
            ? "Nonaktifkan anggota ini?"
            : "Aktifkan anggota ini?"
        }
        message={`${statusTarget?.user_full_name} akan ditandai ${
          statusTarget?.status === "active" ? "tidak aktif" : "aktif"
        } sebagai ${statusTarget?.position_name}.`}
        confirmLabel={
          statusTarget?.status === "active" ? "Nonaktifkan" : "Aktifkan"
        }
        confirmVariant={
          statusTarget?.status === "active" ? "destructive" : "primary"
        }
        loading={isUpdatingStatus}
      />

      <AlertConfirmation
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOfficer}
        title="Hapus anggota ini?"
        message={`${deleteTarget?.user_full_name} akan dihapus permanen sebagai ${deleteTarget?.position_name} dari periode kepengurusan ini.`}
        confirmLabel="Hapus"
        confirmVariant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}

// A touch more visible than the app's usual #dbe3ef border tone, without going full mid-gray.
const TREE_LINE_CLASS = "bg-[#c7d0de]";

// One row below the root; each card owns its own half-connector so the bar meets the outermost stems at a clean right angle instead of overhanging past them.
function TreeTier({
  officers,
  canManage,
  onSelectOfficer,
  onUpdatePosition,
  onDeleteOfficer,
}: {
  officers: StructuralOfficer[];
  canManage: boolean;
  onSelectOfficer: (officer: StructuralOfficer) => void;
  onUpdatePosition: (officer: StructuralOfficer) => void;
  onDeleteOfficer: (officer: StructuralOfficer) => void;
}) {
  if (officers.length === 0) return null;

  if (officers.length === 1) {
    const officer = officers[0];
    return (
      <>
        <div className={`h-6 w-px ${TREE_LINE_CLASS}`} />
        <OfficerNode
          officer={officer}
          canManage={canManage}
          onToggleStatus={() => onSelectOfficer(officer)}
          onUpdatePosition={() => onUpdatePosition(officer)}
          onDelete={() => onDeleteOfficer(officer)}
        />
      </>
    );
  }

  return (
    <>
      <div className={`h-6 w-px ${TREE_LINE_CLASS}`} />
      <div className="flex items-start justify-center">
        {officers.map((officer, index) => (
          <div
            key={officer.id}
            className="relative flex flex-col items-center px-3"
          >
            {index > 0 && (
              <div
                className={`absolute right-1/2 top-0 h-px w-1/2 ${TREE_LINE_CLASS}`}
              />
            )}
            {index < officers.length - 1 && (
              <div
                className={`absolute left-1/2 top-0 h-px w-1/2 ${TREE_LINE_CLASS}`}
              />
            )}
            <div className={`h-6 w-px ${TREE_LINE_CLASS}`} />
            <OfficerNode
              officer={officer}
              canManage={canManage}
              onToggleStatus={() => onSelectOfficer(officer)}
              onUpdatePosition={() => onUpdatePosition(officer)}
              onDelete={() => onDeleteOfficer(officer)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function OfficerNode({
  officer,
  canManage,
  onToggleStatus,
  onUpdatePosition,
  onDelete,
}: {
  officer: StructuralOfficer;
  canManage: boolean;
  onToggleStatus: () => void;
  onUpdatePosition: () => void;
  onDelete: () => void;
}) {
  const isActive = officer.status === "active";

  return (
    <div
      className={`flex w-64 items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition ${
        isActive
          ? "border-primary/30 ring-1 ring-primary/10"
          : "border-[#e6e9ef] opacity-70"
      }`}
    >
      <Avatar src={officer.user_avatar} name={officer.user_full_name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033]">
          {officer.user_full_name}
        </p>
        <div className="group/position relative min-w-0 w-fit">
          <p className="line-clamp-2 text-xs text-[#5f6573]">
            {officer.position_name}
          </p>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-56 -translate-x-1/2 translate-y-1 rounded-md bg-[#172033] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover/position:translate-y-0 group-hover/position:opacity-100"
          >
            {officer.position_name}
          </span>
        </div>
        <Label variant={isActive ? "green" : "gray"} size="sm" className="mt-1">
          {isActive ? "Aktif" : "Non-aktif"}
        </Label>
      </div>

      {canManage && (
        <Dropdown
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Aksi untuk ${officer.user_full_name}`}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#5f6573] hover:bg-[#f5f7fb]"
            >
              <MoreVertical className="size-4" />
            </button>
          )}
        >
          <button
            type="button"
            onClick={onToggleStatus}
            className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-[#f5f7fb] ${
              isActive ? "text-destructive" : "text-primary"
            }`}
          >
            {isActive ? (
              <PowerOff className="size-4" />
            ) : (
              <Power className="size-4" />
            )}
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button
            type="button"
            onClick={onUpdatePosition}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[#172033] hover:bg-[#f5f7fb]"
          >
            <Pencil className="size-4" />
            Update Jabatan
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-destructive hover:bg-[#f5f7fb]"
          >
            <Trash2 className="size-4" />
            Hapus Anggota
          </button>
        </Dropdown>
      )}
    </div>
  );
}

type OfficerDraft = {
  key: string;
  user: SearchableOption | null;
  position: SearchableOption | null;
};

function createEmptyOfficerDraft(): OfficerDraft {
  return { key: crypto.randomUUID(), user: null, position: null };
}

function CreatePeriodModal({
  open,
  onClose,
  chapterId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  chapterId: string;
  onCreated: (periodId: number) => void;
}) {
  const [startYear, setStartYear] = useState("");
  const [isOngoing, setIsOngoing] = useState(true);
  const [endYear, setEndYear] = useState("");
  const [officers, setOfficers] = useState<OfficerDraft[]>([
    createEmptyOfficerDraft(),
  ]);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setStartYear("");
    setIsOngoing(true);
    setEndYear("");
    setOfficers([createEmptyOfficerDraft()]);
  }

  function updateOfficer(key: string, patch: Partial<OfficerDraft>) {
    setOfficers((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }

  function addOfficerRow() {
    setOfficers((prev) => [...prev, createEmptyOfficerDraft()]);
  }

  function removeOfficerRow(key: string) {
    setOfficers((prev) =>
      prev.length > 1 ? prev.filter((item) => item.key !== key) : prev
    );
  }

  async function handleSubmit() {
    const parsedStartYear = Number(startYear);
    if (!startYear || Number.isNaN(parsedStartYear) || parsedStartYear <= 0) {
      toast.error("Tahun mulai wajib diisi dengan angka yang valid.");
      return;
    }

    if (!isOngoing && !endYear) {
      toast.error("Tahun selesai wajib diisi, atau centang masih berjalan.");
      return;
    }
    const parsedEndYear = !isOngoing && endYear ? Number(endYear) : undefined;
    if (parsedEndYear !== undefined && parsedEndYear < parsedStartYear) {
      toast.error("Tahun selesai tidak boleh lebih kecil dari tahun mulai.");
      return;
    }

    const validOfficers = officers.filter(
      (item) => item.user && item.position
    );
    if (validOfficers.length === 0) {
      toast.error("Tambahkan minimal satu anggota beserta jabatannya.");
      return;
    }
    if (validOfficers.length !== officers.length) {
      toast.error(
        "Lengkapi setiap baris anggota, atau hapus baris yang kosong."
      );
      return;
    }

    setIsSaving(true);
    try {
      const result = await createStructuralPeriod({
        entity_type: "chapter",
        entity_id: chapterId,
        start_year: parsedStartYear,
        ...(parsedEndYear !== undefined ? { end_year: parsedEndYear } : {}),
        officers: validOfficers.map((item) => ({
          user_id: String(item.user!.value),
          position_id: Number(item.position!.value),
        })),
      });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.message ?? "Gagal membuat periode kepengurusan.");
        return;
      }

      toast.success("Periode kepengurusan berhasil dibuat.");
      resetForm();
      onCreated(result.data.id);
    } catch (err) {
      console.error("[ChapterStructuralPage] create period threw:", err);
      toast.error("Gagal membuat periode kepengurusan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Tambah Periode Kepengurusan"
      panelClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <NumberInput
          inputId="structural-start-year"
          label="Tahun Mulai"
          placeholder="2026"
          value={startYear}
          onValueChange={setStartYear}
          characterLength={4}
          required
        />

        <label
          htmlFor="structural-is-ongoing"
          className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#172033]"
        >
          <input
            id="structural-is-ongoing"
            type="checkbox"
            checked={isOngoing}
            onChange={(e) => setIsOngoing(e.target.checked)}
            className="size-4 rounded border-[#dbe3ef] accent-primary"
          />
          Kepengurusan masih berjalan
        </label>

        {!isOngoing && (
          <NumberInput
            inputId="structural-end-year"
            label="Tahun Selesai"
            placeholder="2027"
            value={endYear}
            onValueChange={setEndYear}
            characterLength={4}
            required
          />
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[#172033]">
              Anggota <span className="text-destructive">*</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={addOfficerRow}
              className="w-fit"
            >
              <Plus className="size-4" />
              Tambah Baris
            </Button>
          </div>

          {officers.map((officerDraft, index) => (
            <div
              key={officerDraft.key}
              className="flex flex-col gap-2 rounded-lg border border-[#e6e9ef] p-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <SearchableSelect
                  selectId={`structural-officer-${officerDraft.key}`}
                  label={index === 0 ? "Kader" : undefined}
                  placeholder="Cari nama kader..."
                  value={officerDraft.user}
                  onChange={(user) => updateOfficer(officerDraft.key, { user })}
                  loadOptions={(inputValue, page) =>
                    loadChapterUserOptions(chapterId, inputValue, page)
                  }
                  showOptionAvatar
                />
              </div>
              <div className="w-full sm:w-48">
                <SearchableSelect
                  selectId={`structural-position-${officerDraft.key}`}
                  label={index === 0 ? "Jabatan" : undefined}
                  placeholder="Cari jabatan..."
                  value={officerDraft.position}
                  onChange={(position) =>
                    updateOfficer(officerDraft.key, { position })
                  }
                  loadOptions={loadStructuralPositionOptions}
                  menuPlacement="auto"
                />
              </div>
              {officers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOfficerRow(officerDraft.key)}
                  aria-label="Hapus baris"
                  className="shrink-0 text-destructive hover:bg-destructive-soft"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function UpdatePeriodModal({
  open,
  onClose,
  period,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  period: StructuralPeriodDetail;
  onUpdated: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Update Periode Kepengurusan">
      {open && (
        <UpdatePeriodFields
          period={period}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Modal>
  );
}

// Mounted only while the modal is open, so its state seeds fresh from `period` every open.
function UpdatePeriodFields({
  period,
  onClose,
  onUpdated,
}: {
  period: StructuralPeriodDetail;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [startYear, setStartYear] = useState(String(period.start_year));
  const [isOngoing, setIsOngoing] = useState(period.end_year === null);
  const [endYear, setEndYear] = useState(
    period.end_year !== null ? String(period.end_year) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    const parsedStartYear = Number(startYear);
    if (!startYear || Number.isNaN(parsedStartYear) || parsedStartYear <= 0) {
      toast.error("Tahun mulai wajib diisi dengan angka yang valid.");
      return;
    }

    if (!isOngoing && !endYear) {
      toast.error("Tahun selesai wajib diisi, atau centang masih berjalan.");
      return;
    }
    const parsedEndYear = !isOngoing && endYear ? Number(endYear) : null;
    if (parsedEndYear !== null && parsedEndYear < parsedStartYear) {
      toast.error("Tahun selesai tidak boleh lebih kecil dari tahun mulai.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateStructuralPeriod({
        id: period.id,
        start_year: parsedStartYear,
        end_year: parsedEndYear,
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.message ?? "Gagal memperbarui periode kepengurusan."
        );
        return;
      }

      toast.success("Periode kepengurusan berhasil diperbarui.");
      onUpdated();
    } catch (err) {
      console.error("[ChapterStructuralPage] update period threw:", err);
      toast.error("Gagal memperbarui periode kepengurusan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <NumberInput
        inputId="structural-update-start-year"
        label="Tahun Mulai"
        placeholder="2026"
        value={startYear}
        onValueChange={setStartYear}
        characterLength={4}
        required
      />

      <label
        htmlFor="structural-update-is-ongoing"
        className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#172033]"
      >
        <input
          id="structural-update-is-ongoing"
          type="checkbox"
          checked={isOngoing}
          onChange={(e) => setIsOngoing(e.target.checked)}
          className="size-4 rounded border-[#dbe3ef] accent-primary"
        />
        Kepengurusan masih berjalan
      </label>

      {!isOngoing && (
        <NumberInput
          inputId="structural-update-end-year"
          label="Tahun Selesai"
          placeholder="2027"
          value={endYear}
          onValueChange={setEndYear}
          characterLength={4}
          required
        />
      )}

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Pencil className="size-3.5" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}

function UpdateOfficerPositionModal({
  open,
  onClose,
  officer,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  officer: StructuralOfficer;
  onUpdated: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Update Jabatan">
      {open && (
        <UpdateOfficerPositionFields
          officer={officer}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </Modal>
  );
}

// Mounted only while the modal is open, so its state seeds fresh from `officer` every open.
function UpdateOfficerPositionFields({
  officer,
  onClose,
  onUpdated,
}: {
  officer: StructuralOfficer;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [position, setPosition] = useState<SearchableOption | null>({
    label: officer.position_name,
    value: officer.position_id,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!position) {
      toast.error("Pilih jabatan terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateStructuralOfficer({
        id: officer.id,
        position_id: Number(position.value),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui jabatan.");
        return;
      }

      toast.success("Jabatan berhasil diperbarui.");
      onUpdated();
    } catch (err) {
      console.error(
        "[ChapterStructuralPage] update officer position threw:",
        err
      );
      toast.error("Gagal memperbarui jabatan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchableSelect
        selectId="structural-update-officer-position"
        label="Jabatan"
        placeholder="Cari jabatan..."
        value={position}
        onChange={setPosition}
        loadOptions={loadStructuralPositionOptions}
        defaultOptions={[
          { label: officer.position_name, value: officer.position_id },
        ]}
      />

      <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Pencil className="size-3.5" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}

function AddOfficerModal({
  open,
  onClose,
  chapterId,
  periodId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  chapterId: string;
  periodId: number;
  onAdded: () => void;
}) {
  const [selectedUser, setSelectedUser] = useState<SearchableOption | null>(
    null
  );
  const [selectedPosition, setSelectedPosition] =
    useState<SearchableOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setSelectedUser(null);
    setSelectedPosition(null);
  }

  async function handleSubmit() {
    if (!selectedUser) {
      toast.error("Pilih kader terlebih dahulu.");
      return;
    }
    if (!selectedPosition) {
      toast.error("Pilih jabatan terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createStructuralOfficer({
        structural_period_id: periodId,
        user_id: String(selectedUser.value),
        position_id: Number(selectedPosition.value),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menambahkan anggota.");
        return;
      }

      toast.success(`${selectedUser.label} berhasil ditambahkan.`);
      resetForm();
      onAdded();
    } catch (err) {
      console.error("[ChapterStructuralPage] add officer threw:", err);
      toast.error("Gagal menambahkan anggota.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Tambah Anggota"
    >
      <div className="flex flex-col gap-4">
        <SearchableSelect
          selectId="structural-add-officer"
          label="Kader"
          placeholder="Cari nama kader..."
          value={selectedUser}
          onChange={setSelectedUser}
          loadOptions={(inputValue, page) =>
            loadChapterUserOptions(chapterId, inputValue, page)
          }
          showOptionAvatar
        />
        <SearchableSelect
          selectId="structural-add-officer-position"
          label="Jabatan"
          placeholder="Cari jabatan..."
          value={selectedPosition}
          onChange={setSelectedPosition}
          loadOptions={loadStructuralPositionOptions}
          required
        />

        <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UserPlus className="size-3.5" />
            )}
            {isSaving ? "Menambahkan..." : "Tambah"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
