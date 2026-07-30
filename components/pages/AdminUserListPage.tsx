"use client";

import {
  EllipsisVertical,
  Eye,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserListEntry } from "@/apis/users";
import { deleteUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import AdminUserQuickEditForm from "../forms/AdminUserQuickEditForm";
import UserRoleLabel from "../labels/UserRoleLabel";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";
import AlertConfirmation from "../modals/AlertConfirmation";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface AdminUserListPageProps {
  users: UserListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  pageSize: number;
}

export default function AdminUserListPage({
  users,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  pageSize,
}: AdminUserListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "Adjust state during render" (not a useEffect) when the server hands back a new initialSearch, same pattern as SearchPage.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [editTarget, setEditTarget] = useState<UserListEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListEntry | null>(null);
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
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteUser(deleteTarget.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus user.");
        return;
      }
      toast.success("User berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminUserListPage] deleteUser threw:", err);
      toast.error("Gagal menghapus user.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
            Kelola akun dan hak akses user HMI Connect.
          </p>
        </div>
        <Link href="/master/users/create" className="w-fit">
          <Button variant="primary">
            <PlusCircle className="size-4" />
            Tambah User
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="user-search"
            placeholder="Cari nama, username, atau email..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-52">
          <Select
            selectId="user-status-filter"
            placeholder="Semua Status"
            value={initialStatus}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Users className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">
              Tidak ada user ditemukan.
            </p>
            {(initialSearch || initialStatus) && (
              <p className="text-xs text-[#5f6573]">
                Coba ubah kata kunci pencarian atau filter status.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Cabang / Komisariat</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Terverifikasi</th>
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
                      <UserVerifiedLabel isVerified={user.is_verified} />
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
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
                          >
                            <Trash2 className="size-4" />
                            Hapus
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
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus user ini?"
        message={`Apakah kamu yakin ingin menghapus ${deleteTarget?.full_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />
    </div>
  );
}
