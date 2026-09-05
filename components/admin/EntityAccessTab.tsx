"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { AccessGrantEntry } from "@/apis/access-grants";
import { inviteAccessGrant, revokeAccessGrant } from "@/lib/actions";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { isSuccessStatus, type AccessEntityTypeEnum } from "@/lib/types";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import Button from "../buttons/Button";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import Modal from "../modals/Modal";
import AlertConfirmation from "../modals/AlertConfirmation";
import EmptyState from "../states/EmptyState";

// The /api/users/search query param that scopes people search to each entity.
const SEARCH_PARAM: Record<AccessEntityTypeEnum, string> = {
  organization: "organization_id",
  coordinating_body: "coordinating_body_id",
  branch: "branch_id",
  coordinating_chapter: "coordinating_chapter_id",
  chapter: "chapter_id",
};

interface EntityAccessTabProps {
  entityType: AccessEntityTypeEnum;
  entityId: string;
  grants: AccessGrantEntry[];
  // Anyone holding manage on this entity may invite others to it — not just Super Admin.
  canManageAccess: boolean;
}

export default function EntityAccessTab({
  entityType,
  entityId,
  grants,
  canManageAccess,
}: EntityAccessTabProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AccessGrantEntry | null>(
    null
  );
  const [isRevoking, setIsRevoking] = useState(false);
  const entityLabel = ADMIN_ENTITY_LABEL[entityType];

  async function handleRevoke() {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      const result = await revokeAccessGrant(revokeTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal mencabut akses.");
        return;
      }
      const cascaded = (result.data?.revoked_count ?? 1) - 1;
      toast.success(
        cascaded > 0
          ? `Akses ${revokeTarget.user_full_name} dicabut, beserta ${cascaded} akses turunannya.`
          : `Akses ${revokeTarget.user_full_name} berhasil dicabut.`
      );
      setRevokeTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[EntityAccessTab] revoke access threw:", err);
      toast.error("Gagal mencabut akses.");
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#172033]">
            Admin {entityLabel}
          </h2>
          <p className="mt-1 text-sm text-[#5f6573]">
            Pengguna yang memiliki akses untuk mengelola dashboard {entityLabel}{" "}
            ini.
          </p>
        </div>
        {canManageAccess && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="w-fit"
          >
            <UserPlus className="size-4" />
            Tambah Akses
          </Button>
        )}
      </div>

      {!canManageAccess && (
        <p className="mt-3 text-xs text-[#5f6573]">
          Hanya pemegang akses {entityLabel} ini yang dapat menambah atau
          mencabut akses.
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {grants.length === 0 ? (
          <EmptyState
            title="Belum ada admin"
            description={`Admin yang diberi akses untuk ${entityLabel} ini akan ditampilkan di sini.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Diberikan Oleh</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {grants.map((grant) => (
                  <tr key={grant.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          src={grant.user_avatar ?? undefined}
                          name={grant.user_full_name ?? ""}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {grant.user_full_name}
                          </p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            @{grant.user_username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {grant.status === "accepted" ? (
                        <Label variant="green">Aktif</Label>
                      ) : (
                        <Label variant="orange">Menunggu Konfirmasi</Label>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#5f6573]">
                      {grant.granted_by_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {canManageAccess ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRevokeTarget(grant)}
                            aria-label={`Cabut akses ${grant.user_full_name}`}
                            className="text-destructive hover:bg-destructive-soft"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <span className="text-[#5f6573]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManageAccess && (
        <AddAccessModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          entityType={entityType}
          entityId={entityId}
          entityLabel={entityLabel}
          onInvited={() => {
            setShowAddModal(false);
            router.refresh();
          }}
        />
      )}

      <AlertConfirmation
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Cabut akses admin ini?"
        message={`${revokeTarget?.user_full_name} tidak akan bisa lagi mengelola dashboard ${entityLabel} ini. Akses yang ia berikan ke orang lain pada ${entityLabel} ini ikut dicabut.`}
        confirmLabel="Cabut Akses"
        loading={isRevoking}
      />
    </section>
  );
}

function AddAccessModal({
  open,
  onClose,
  entityType,
  entityId,
  entityLabel,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  entityType: AccessEntityTypeEnum;
  entityId: string;
  entityLabel: string;
  onInvited: () => void;
}) {
  const [selected, setSelected] = useState<SearchableOption | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  async function loadOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({
      q: inputValue,
      page: String(page),
      [SEARCH_PARAM[entityType]]: entityId,
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

  async function handleInvite() {
    if (!selected) {
      toast.error("Pilih pengguna terlebih dahulu.");
      return;
    }

    setIsInviting(true);
    try {
      const result = await inviteAccessGrant({
        userId: String(selected.value),
        entityType,
        entityId,
      });
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal mengirim undangan akses.");
        return;
      }
      toast.success(`Undangan akses dikirim ke ${selected.label}.`);
      setSelected(null);
      onInvited();
    } catch (err) {
      console.error("[EntityAccessTab] invite access threw:", err);
      toast.error("Gagal mengirim undangan akses.");
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Akses">
      <div className="flex flex-col gap-4">
        <SearchableSelect
          selectId={`${entityType}-add-access`}
          label="Cari Kader"
          placeholder="Cari nama kader..."
          value={selected}
          onChange={setSelected}
          loadOptions={loadOptions}
          showOptionAvatar
        />
        <p className="text-xs text-[#5f6573]">
          Undangan dikirim sebagai permintaan — pengguna baru bisa mengelola{" "}
          {entityLabel} ini setelah menerimanya.
        </p>

        <div className="mt-2 flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
          <Button variant="outline" onClick={onClose} disabled={isInviting}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleInvite}
            disabled={isInviting}
          >
            {isInviting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UserPlus className="size-3.5" />
            )}
            {isInviting ? "Mengirim..." : "Kirim Undangan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
