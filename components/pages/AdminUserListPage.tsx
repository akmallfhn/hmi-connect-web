"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  Ban,
  EllipsisVertical,
  Eye,
  Mail,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { UserListEntry } from "@/apis/users";
import { formatShortDateTime } from "@/lib/time-manipulation";
import {
  deactivateUser,
  deleteUser,
  sendVerificationReminder,
} from "@/lib/actions";
import {
  hasMemberFilters,
  type MemberFilterSelection,
  type MemberSort,
} from "@/lib/member-filters";
import { isSuccessStatus } from "@/lib/types";
import MemberFilterBar from "../admin/MemberFilterBar";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Pagination from "../common/Pagination";
import SortableHeader from "../common/SortableHeader";
import AdminUserQuickEditForm from "../forms/AdminUserQuickEditForm";
import UserRoleLabel from "../labels/UserRoleLabel";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";
import AlertConfirmation from "../modals/AlertConfirmation";
import ConfirmDeleteUserModal from "../modals/ConfirmDeleteUserModal";
import EmptyState from "../states/EmptyState";

interface AdminUserListPageProps {
  users: UserListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  selection: MemberFilterSelection;
  sort: MemberSort;
  pageSize: number;
}

export default function AdminUserListPage({
  users,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  selection,
  sort,
  pageSize,
}: AdminUserListPageProps) {
  const router = useRouter();
  const isFiltered = Boolean(initialSearch) || hasMemberFilters(selection);

  const [editTarget, setEditTarget] = useState<UserListEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deactivateTarget, setDeactivateTarget] =
    useState<UserListEntry | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<UserListEntry | null>(
    null
  );
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteUser(deleteTarget.id, deleteTarget.username);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus user.");
        return;
      }
      toast.success("User berhasil dihapus permanen.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminUserListPage] deleteUser threw:", err);
      toast.error("Gagal menghapus user.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSendReminder() {
    if (!reminderTarget) return;
    setIsSendingReminder(true);
    try {
      const result = await sendVerificationReminder(reminderTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(
          result.status === "TOO_MANY_REQUESTS"
            ? "Reminder sudah dikirim kurang dari 30 menit lalu. Coba lagi nanti."
            : (result.message ?? "Gagal mengirim reminder.")
        );
        return;
      }
      toast.success("Reminder berhasil dikirim.");
      setReminderTarget(null);
    } catch (err) {
      console.error("[AdminUserListPage] sendVerificationReminder threw:", err);
      toast.error("Gagal mengirim reminder.");
    } finally {
      setIsSendingReminder(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      const result = await deactivateUser(deactivateTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menonaktifkan user.");
        return;
      }
      toast.success("User berhasil dinonaktifkan.");
      setDeactivateTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminUserListPage] deactivateUser threw:", err);
      toast.error("Gagal menonaktifkan user.");
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <AdminPageTitle description="Kelola akun dan hak akses user HMI Connect.">
            User Management
          </AdminPageTitle>
        </div>
        <Link href="/master/users/create" className="w-fit">
          <Button variant="primary">
            <PlusCircle className="size-4" />
            Tambah User
          </Button>
        </Link>
      </div>

      <MemberFilterBar
        scope="master"
        initialSearch={initialSearch}
        selection={selection}
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {users.length === 0 ? (
          <EmptyState
            title={isFiltered ? "User tidak ditemukan" : "Belum ada user"}
            description={
              isFiltered
                ? "Coba ubah kata kunci pencarian atau filter yang dipakai."
                : "User yang ditambahkan akan ditampilkan di sini."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <SortableHeader
                    label="User"
                    sortKey="full_name"
                    activeSort={sort}
                  />
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Cabang / Komisariat</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Terverifikasi</th>
                  <SortableHeader
                    label="Terdaftar Sejak"
                    sortKey="created_at"
                    defaultDirection="desc"
                    activeSort={sort}
                  />
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {users.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="px-4 py-3">
                      <Link
                        href={`/master/users/${encodeURIComponent(user.username)}`}
                        className="group flex items-center gap-3"
                      >
                        <Avatar
                          src={user.avatar}
                          name={user.full_name}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033] group-hover:text-primary">
                            {user.full_name}
                          </p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            @{user.username}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#5f6573]">
                      <span className="block max-w-56 truncate">
                        {user.email || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {user.chapter_name ? (
                        <div className="min-w-0">
                          <p className="truncate">{user.chapter_name}</p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            Cabang {user.branch_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#5f6573]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleLabel
                        roleId={user.role_id}
                        roleName={user.role_name}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusLabel status={user.status} />
                    </td>
                    <td className="px-4 py-3">
                      <UserVerifiedLabel status={user.verification_status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[#5f6573]">
                      {user.created_at ? formatShortDateTime(user.created_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Dropdown
                          panelClassName="w-48 rounded-xl"
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
                          <Link
                            href={`/master/users/${encodeURIComponent(user.username)}`}
                          >
                            <div className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]">
                              <Eye className="size-4 text-[#5f6573]" />
                              Lihat Detail
                            </div>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditTarget(user)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                          >
                            <Pencil className="size-4 text-[#5f6573]" />
                            Edit Cepat
                          </button>
                          {user.verification_status === "unverified" && (
                            <button
                              type="button"
                              onClick={() => setReminderTarget(user)}
                              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                            >
                              <Mail className="size-4 text-[#5f6573]" />
                              Kirim Reminder
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeactivateTarget(user)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
                          >
                            <Ban className="size-4" />
                            Nonaktifkan
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
                          >
                            <Trash2 className="size-4" />
                            Hapus Permanen
                          </button>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {users.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + users.length} dari {totalData} user
          </p>
        </div>
      )}

      <AdminUserQuickEditForm
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          router.refresh();
        }}
        user={editTarget}
      />

      <AlertConfirmation
        open={reminderTarget !== null}
        onClose={() => setReminderTarget(null)}
        onConfirm={handleSendReminder}
        title="Kirim reminder?"
        message={`Email pengingat aktivasi dan verifikasi akan dikirim ke ${reminderTarget?.email || reminderTarget?.full_name}. Reminder berikutnya untuk user ini baru bisa dikirim setelah jeda 30 menit.`}
        confirmLabel="Kirim Reminder"
        confirmVariant="primary"
        loading={isSendingReminder}
      />

      <AlertConfirmation
        open={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Nonaktifkan akun ini?"
        message={`Apakah kamu yakin ingin menonaktifkan ${deactivateTarget?.full_name}? Akun akan disoftdelete dan tidak bisa login, tapi datanya tetap tersimpan — email, username, dan nomor kartu anggotanya tetap dicadangkan.`}
        confirmLabel="Nonaktifkan"
        loading={isDeactivating}
      />

      <ConfirmDeleteUserModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        fullName={deleteTarget?.full_name ?? ""}
        username={deleteTarget?.username ?? ""}
        loading={isDeleting}
      />
    </div>
  );
}
