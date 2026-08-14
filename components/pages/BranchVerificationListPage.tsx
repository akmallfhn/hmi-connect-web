"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  Building2,
  Cake,
  Check,
  Eye,
  GraduationCap,
  IdCard,
  MapPin,
  Mail,
  Phone,
  Search,
  VenusAndMars,
  X as XIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState, type ComponentType } from "react";
import { toast } from "sonner";
import type {
  VerificationRequestDetail,
  VerificationRequestListEntry,
} from "@/apis/access";
import {
  approveVerificationRequest,
  getVerificationRequestDetail,
  rejectVerificationRequest,
} from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Avatar from "../common/Avatar";
import Pagination from "../common/Pagination";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import VerificationRequestStatusLabel from "../labels/VerificationRequestStatusLabel";
import AlertConfirmation from "../modals/AlertConfirmation";
import Modal from "../modals/Modal";
import EmptyState from "../states/EmptyState";
import { useBranch } from "@/hooks/useBranch";

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Menunggu Review", value: "pending" },
  { label: "Disetujui", value: "approved" },
  { label: "Ditolak", value: "rejected" },
];

const GENDER_LABEL: Record<string, string> = {
  male: "Laki-laki",
  female: "Perempuan",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#5f6573]">{label}</p>
        <p className="break-words text-[15px] font-medium text-[#172033]">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

// Mounted only while open, so the reason field always seeds fresh — no reset effect needed.
function RejectFields({
  requestId,
  onClose,
  onRejected,
}: {
  requestId: string;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const result = await rejectVerificationRequest(requestId, reason);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menolak permintaan verifikasi.");
        return;
      }
      toast.success("Permintaan verifikasi berhasil ditolak.");
      onRejected();
      onClose();
    } catch (err) {
      console.error(
        "[VerificationRequestListPage] rejectVerificationRequest threw:",
        err
      );
      toast.error("Gagal menolak permintaan verifikasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#5f6573]">
        Kader dapat mengajukan verifikasi ulang setelah permintaan ini ditolak.
      </p>
      <TextArea
        textAreaId="verification-rejection-reason"
        label="Alasan Penolakan"
        placeholder="Contoh: Foto KTP buram, mohon unggah ulang."
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex justify-end gap-2 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
          {loading ? "Memproses..." : "Tolak Permintaan"}
        </Button>
      </div>
    </div>
  );
}

export interface VerificationRequestListPageProps {
  requests: VerificationRequestListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialStatus: string;
  initialSearch: string;
  description: string;
  showBranchFilter?: boolean;
  selectedBranch?: { id: string; name: string } | null;
  allowReviewActions?: boolean;
}

export function VerificationRequestListPage({
  requests,
  totalData,
  totalPage,
  currentPage,
  initialStatus,
  initialSearch,
  description,
  showBranchFilter = false,
  selectedBranch = null,
  allowReviewActions = true,
}: VerificationRequestListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchOption: SearchableOption | null = selectedBranch
    ? { label: selectedBranch.name, value: selectedBranch.id }
    : null;

  // "Adjust state during render" (not a useEffect) when the server hands back a new initialSearch, same pattern as AdminUserListPage.
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  const [detailTarget, setDetailTarget] =
    useState<VerificationRequestListEntry | null>(null);
  const [detailData, setDetailData] =
    useState<VerificationRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [approveTarget, setApproveTarget] =
    useState<VerificationRequestListEntry | null>(null);
  const [approving, setApproving] = useState(false);

  const [rejectTarget, setRejectTarget] =
    useState<VerificationRequestListEntry | null>(null);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  async function loadBranchOptions(inputValue: string, page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (inputValue) params.set("q", inputValue);
    const response = await fetch(`/api/branches/search?${params}`);
    const json = await response.json();
    const results: { id: string; name: string }[] = json.data ?? [];
    return {
      options: results.map((item) => ({ label: item.name, value: item.id })),
      hasMore: Boolean(json.hasMore),
    };
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushParams({ search: searchInput });
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function handleOpenDetail(request: VerificationRequestListEntry) {
    setDetailTarget(request);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const detail = await getVerificationRequestDetail(request.id);
      setDetailData(detail);
      if (!detail) toast.error("Gagal memuat detail permintaan verifikasi.");
    } catch (err) {
      console.error(
        "[VerificationRequestListPage] getVerificationRequestDetail threw:",
        err
      );
      toast.error("Gagal memuat detail permintaan verifikasi.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleApprove() {
    if (!approveTarget) return;
    setApproving(true);
    approveVerificationRequest(approveTarget.id)
      .then((result) => {
        if (isSuccessStatus(result.status)) {
          toast.success("Permintaan verifikasi berhasil disetujui.");
          router.refresh();
        } else {
          toast.error(
            result.message ?? "Gagal menyetujui permintaan verifikasi."
          );
        }
      })
      .finally(() => {
        setApproving(false);
        setApproveTarget(null);
      });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <AdminPageTitle description={description}>
          Permintaan Verifikasi
        </AdminPageTitle>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId={`${showBranchFilter ? "master" : "branch"}-verification-search`}
            placeholder="Cari nama..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {showBranchFilter && (
          <div className="w-full sm:max-w-xs">
            <SearchableSelect
              selectId="master-verification-branch-filter"
              placeholder="Filter Cabang"
              value={branchOption}
              onChange={(option) =>
                pushParams({
                  branch_id: option ? String(option.value) : "",
                })
              }
              loadOptions={loadBranchOptions}
              defaultOptions={branchOption ? [branchOption] : []}
            />
          </div>
        )}
        <div className="w-full sm:max-w-52">
          <Select
            selectId={`${showBranchFilter ? "master" : "branch"}-verification-status-filter`}
            placeholder="Filter Status"
            value={initialStatus || null}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        {requests.length === 0 ? (
          <EmptyState
            title={
              initialSearch || initialStatus || selectedBranch
                ? "Permintaan verifikasi tidak ditemukan"
                : "Belum ada permintaan verifikasi"
            }
            description={
              initialSearch || initialStatus || selectedBranch
                ? "Coba ubah kata kunci pencarian atau filter status."
                : "Permintaan verifikasi kader akan ditampilkan di sini."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Kader</th>
                  <th className="px-4 py-3">
                    {showBranchFilter ? "Cabang / Komisariat" : "Komisariat"}
                  </th>
                  <th className="px-4 py-3">Diajukan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {requests.map((request) => (
                  <tr key={request.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={request.avatar}
                          name={request.full_name}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {request.full_name}
                          </p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            @{request.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {request.chapter_name ? (
                        <div className="min-w-0">
                          <p className="truncate">
                            Komisariat {request.chapter_name}
                          </p>
                          {showBranchFilter && (
                            <p className="truncate text-[13px] text-[#5f6573]">
                              Cabang {request.branch_name ?? selectedBranch?.name ?? "—"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#5f6573]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#172033]">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <VerificationRequestStatusLabel status={request.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Lihat Detail"
                          onClick={() => handleOpenDetail(request)}
                        >
                          <Eye className="size-4" /> Lihat Detail
                        </Button>
                        {allowReviewActions && request.status === "pending" && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              aria-label="Reject"
                              onClick={() => setRejectTarget(request)}
                            >
                              <XIcon className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              aria-label="Approve"
                              onClick={() => setApproveTarget(request)}
                            >
                              <Check className="size-4" />
                            </Button>
                          </>
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

      {requests.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {requests.length} dari {totalData} permintaan
          </p>
        </div>
      )}

      <Modal
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        title="Detail Permintaan Verifikasi"
      >
        {detailLoading ? (
          <p className="py-6 text-center text-sm text-[#5f6573]">
            Memuat detail...
          </p>
        ) : detailData ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-[#e6e9ef] pb-4">
              <Avatar
                src={detailData.avatar}
                name={detailData.full_name}
                size={48}
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[#172033]">
                  {detailData.full_name}
                </p>
                <p className="truncate text-sm text-[#5f6573]">
                  @{detailData.username}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field icon={Mail} label="Email" value={detailData.email} />
              <Field
                icon={IdCard}
                label="Nama Sesuai KTP"
                value={detailData.ktp_full_name}
              />
              <Field
                icon={Phone}
                label="Nomor HP"
                value={detailData.phone_number}
              />
              <Field
                icon={Cake}
                label="Tanggal Lahir"
                value={formatDate(detailData.date_of_birth)}
              />
              <Field
                icon={VenusAndMars}
                label="Jenis Kelamin"
                value={
                  detailData.gender
                    ? GENDER_LABEL[detailData.gender]
                    : undefined
                }
              />
              <Field
                icon={GraduationCap}
                label="Komisariat"
                value={detailData.chapter_name}
              />
              {showBranchFilter && (
                <Field
                  icon={Building2}
                  label="Cabang"
                  value={
                    detailData.branch_name ??
                    detailTarget?.branch_name ??
                    selectedBranch?.name
                  }
                />
              )}
              <div className="sm:col-span-2">
                <Field
                  icon={MapPin}
                  label="Alamat Lengkap"
                  value={[
                    detailData.address_street,
                    detailData.district_name,
                    detailData.city_name,
                    detailData.province_name,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-[#5f6573]">
            Detail tidak ditemukan.
          </p>
        )}
      </Modal>

      {allowReviewActions && (
        <>
          <AlertConfirmation
            open={approveTarget !== null}
            onClose={() => setApproveTarget(null)}
            onConfirm={handleApprove}
            title="Setujui Permintaan Verifikasi?"
            message="Kader akan mendapatkan status terverifikasi, kartu anggota, dan langganan aktif selama satu tahun."
            confirmLabel="Setujui"
            confirmVariant="primary"
            loading={approving}
          />

          <Modal
            open={rejectTarget !== null}
            onClose={() => setRejectTarget(null)}
            title="Tolak Permintaan Verifikasi"
          >
            {rejectTarget && (
              <RejectFields
                requestId={rejectTarget.id}
                onClose={() => setRejectTarget(null)}
                onRejected={() => router.refresh()}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}

type BranchVerificationListPageProps = Omit<
  VerificationRequestListPageProps,
  "description" | "showBranchFilter" | "selectedBranch"
>;

export default function BranchVerificationListPage(
  props: BranchVerificationListPageProps
) {
  const { branchName } = useBranch();

  return (
    <VerificationRequestListPage
      {...props}
      description={`Tinjau pengajuan verifikasi identitas kader di Cabang ${branchName}.`}
    />
  );
}
