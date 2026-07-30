"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { VerificationRequestListEntry } from "@/apis/access";
import Avatar from "../common/Avatar";
import Pagination from "../common/Pagination";
import Select from "../fields/Select";
import VerificationRequestStatusLabel from "../labels/VerificationRequestStatusLabel";

const STATUS_FILTER_OPTIONS = [
  { label: "Menunggu Review", value: "pending" },
  { label: "Disetujui", value: "approved" },
  { label: "Ditolak", value: "rejected" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface BranchVerificationListPageProps {
  branchId: string;
  requests: VerificationRequestListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialStatus: string;
  pageSize: number;
}

// verification-requests/list has no search param, only status — narrower filter row than Daftar Kader's.
export default function BranchVerificationListPage({
  branchId,
  requests,
  totalData,
  totalPage,
  currentPage,
  initialStatus,
  pageSize,
}: BranchVerificationListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
          Permintaan Verifikasi
        </h1>
        <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
          Tinjau pengajuan verifikasi identitas KTP kader di bawah Cabang ini.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-52">
          <Select
            selectId="branch-verification-status-filter"
            placeholder="Status"
            value={initialStatus}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <ShieldCheck className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">
              Tidak ada permintaan verifikasi ditemukan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Kader</th>
                  <th className="px-4 py-3">Komisariat</th>
                  <th className="px-4 py-3">Diajukan</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {requests.map((request) => (
                  <tr key={request.id} className="align-middle">
                    <td className="px-4 py-3">
                      <Link
                        href={`/branches/${branchId}/verification/${request.id}`}
                        className="group flex items-center gap-3"
                      >
                        <Avatar name={request.full_name} size={36} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033] group-hover:text-primary">
                            {request.full_name}
                          </p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            @{request.username}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {request.chapter_name ?? (
                        <span className="text-[#5f6573]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <VerificationRequestStatusLabel status={request.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {requests.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {(currentPage - 1) * pageSize + requests.length} dari {totalData} permintaan
          </p>
        </div>
      )}
    </div>
  );
}
