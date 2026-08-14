"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserListEntry } from "@/apis/users";
import AdminPageTitle from "../common/AdminPageTitle";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import Select from "../fields/Select";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";
import EmptyState from "../states/EmptyState";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

export type MemberManagementScope =
  | "organization"
  | "coordinating_body"
  | "branch"
  | "coordinating_chapter"
  | "chapter";

const ADMIN_LABELS: Record<MemberManagementScope, string> = {
  organization: "Administrator Organisasi",
  coordinating_body: "Administrator Badko",
  branch: "Administrator Cabang",
  coordinating_chapter: "Administrator Korkom",
  chapter: "Administrator Komisariat",
};

function canManageScope(
  user: UserListEntry,
  scope: MemberManagementScope
) {
  switch (scope) {
    case "organization":
      return user.can_manage_organization;
    case "coordinating_body":
      return user.can_manage_coordinating_body;
    case "branch":
      return user.can_manage_branch;
    case "coordinating_chapter":
      return user.can_manage_coordinating_chapter;
    case "chapter":
      return user.can_manage_chapter;
  }
}

export interface AdminMemberListDataProps {
  users: UserListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  initialStatus: string;
  pageSize: number;
}

interface AdminMemberListPageProps extends AdminMemberListDataProps {
  basePath: string;
  scopeName: string;
  managementScope: MemberManagementScope;
}

// Shared read-only roster for every organization scope — no create/edit/delete affordances.
export default function AdminMemberListPage({
  basePath,
  scopeName,
  managementScope,
  users,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  initialStatus,
  pageSize,
}: AdminMemberListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Adjust state during render when the server hands back a new search value, same pattern as SearchPage.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle description={`Daftar kader di ${scopeName}.`}>
        Daftar Kader
      </AdminPageTitle>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId={`${managementScope}-member-search`}
            placeholder="Cari nama, username, atau email..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-52">
          <Select
            selectId={`${managementScope}-member-status-filter`}
            placeholder="Semua Status"
            value={initialStatus}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {users.length === 0 ? (
          <EmptyState
            title={
              initialSearch || initialStatus
                ? "Kader tidak ditemukan"
                : "Belum ada kader"
            }
            description={
              initialSearch || initialStatus
                ? "Coba ubah kata kunci pencarian atau filter status."
                : "Kader yang terdaftar akan ditampilkan di sini."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold tracking-wide text-[#5f6573] uppercase">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Komisariat</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Terverifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {users.map((user) => {
                  const isScopeAdmin = canManageScope(user, managementScope);
                  return (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-3">
                        <Link
                          href={`${basePath}/members/${encodeURIComponent(user.username)}`}
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
                        {user.chapter_name ?? (
                          <span className="text-[#5f6573]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Label variant={isScopeAdmin ? "purple" : "gray"}>
                          {isScopeAdmin
                            ? ADMIN_LABELS[managementScope]
                            : "Kader Anggota"}
                        </Label>
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusLabel status={user.status} />
                      </td>
                      <td className="px-4 py-3">
                        <UserVerifiedLabel status={user.verification_status} />
                      </td>
                    </tr>
                  );
                })}
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
            {(currentPage - 1) * pageSize + users.length} dari {totalData} kader
          </p>
        </div>
      )}
    </div>
  );
}
