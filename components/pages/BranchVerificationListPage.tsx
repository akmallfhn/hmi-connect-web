"use client";

import {
  Cake,
  Check,
  Eye,
  Fingerprint,
  GraduationCap,
  IdCard,
  MapPin,
  Mail,
  Phone,
  Search,
  ShieldCheck,
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
import TextArea from "../fields/TextArea";
import VerificationRequestStatusLabel from "../labels/VerificationRequestStatusLabel";
import AlertConfirmation from "../modals/AlertConfirmation";
import Modal from "../modals/Modal";

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
        "[BranchVerificationListPage] rejectVerificationRequest threw:",
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

interface BranchVerificationListPageProps {
  requests: VerificationRequestListEntry[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialStatus: string;
  initialSearch: string;
}

export default function BranchVerificationListPage({
  requests,
  totalData,
  totalPage,
  currentPage,
  initialStatus,
  initialSearch,
}: BranchVerificationListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        "[BranchVerificationListPage] getVerificationRequestDetail threw:",
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
        <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
          Permintaan Verifikasi
        </h1>
        <p className="mt-1.5 text-sm text-[#5f6573] sm:text-base">
          Tinjau pengajuan verifikasi identitas kader di bawah Cabang ini.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            inputId="branch-verification-search"
            placeholder="Cari nama..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
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
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Kader</th>
                  <th className="px-4 py-3">Komisariat</th>
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
                        {request.status === "pending" && (
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
              <Field icon={Fingerprint} label="NIK" value={detailData.nik} />
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
    </div>
  );
}
