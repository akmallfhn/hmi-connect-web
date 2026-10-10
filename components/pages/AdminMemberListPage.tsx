"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserListEntry } from "@/apis/users";
import { formatShortDateTime } from "@/lib/time-manipulation";
import {
  hasMemberFilters,
  type MemberFilterAnchors,
  type MemberFilterSelection,
  type MemberSort,
} from "@/lib/member-filters";
import MemberFilterBar from "../admin/MemberFilterBar";
import MemberMobileCard from "../admin/MemberMobileCard";
import Button from "../buttons/Button";
import AdminPageTitle from "../common/AdminPageTitle";
import Avatar from "../common/Avatar";
import Pagination from "../common/Pagination";
import SortableHeader from "../common/SortableHeader";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";
import EmptyState from "../states/EmptyState";

export type MemberManagementScope =
  | "organization"
  | "coordinating_body"
  | "branch"
  | "coordinating_chapter"
  | "chapter";

export interface AdminMemberListDataProps {
  users: UserListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  selection: MemberFilterSelection;
  sort: MemberSort;
  filterAnchors?: MemberFilterAnchors;
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
  selection,
  sort,
  filterAnchors,
  pageSize,
}: AdminMemberListPageProps) {
  const router = useRouter();
  const showBranchContext =
    managementScope === "organization" ||
    managementScope === "coordinating_body";
  const isFiltered = Boolean(initialSearch) || hasMemberFilters(selection);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageTitle description={`Daftar kader di ${scopeName}.`}>
        Daftar Kader
      </AdminPageTitle>

      <MemberFilterBar
        scope={managementScope}
        anchors={filterAnchors}
        initialSearch={initialSearch}
        selection={selection}
        sort={sort}
      />

      <div className="mt-6">
        {users.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <EmptyState
              title={isFiltered ? "Kader tidak ditemukan" : "Belum ada kader"}
              description={
                isFiltered
                  ? "Coba ubah kata kunci pencarian atau filter yang dipakai."
                  : "Kader yang terdaftar akan ditampilkan di sini."
              }
            />
          </div>
        ) : (
          <>
            <ul className="space-y-3 xl:hidden">
              {users.map((user) => (
                <MemberMobileCard
                  key={user.id}
                  user={user}
                  detailHref={`${basePath}/members/${encodeURIComponent(user.username)}`}
                  showBranchContext={showBranchContext}
                />
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface xl:block">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <SortableHeader
                      label="User"
                      sortKey="full_name"
                      activeSort={sort}
                    />
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">
                      {showBranchContext ? "Cabang / Komisariat" : "Komisariat"}
                    </th>
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
                <tbody className="divide-y divide-divider text-[13px]">
                  {users.map((user) => (
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
                            <p className="truncate text-sm font-semibold text-heading group-hover:text-primary-foreground">
                              {user.full_name}
                            </p>
                            <p className="truncate text-[13px] text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="block max-w-56 truncate">
                          {user.email || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-heading">
                        {user.chapter_name ? (
                          <div className="min-w-0">
                            <p className="truncate">
                              Komisariat {user.chapter_name}
                            </p>
                            {showBranchContext && user.branch_name && (
                              <p className="truncate text-[13px] text-muted-foreground">
                                Cabang {user.branch_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <UserStatusLabel status={user.status} />
                      </td>
                      <td className="px-4 py-3">
                        <UserVerifiedLabel status={user.verification_status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {user.created_at
                          ? formatShortDateTime(user.created_at)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `${basePath}/members/${encodeURIComponent(user.username)}`,
                              )
                            }
                            aria-label={`Lihat detail ${user.full_name}`}
                          >
                            <Eye className="size-4" />
                            Lihat Detail
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {users.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-muted-foreground">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + users.length} dari {totalData} kader
          </p>
        </div>
      )}
    </div>
  );
}
