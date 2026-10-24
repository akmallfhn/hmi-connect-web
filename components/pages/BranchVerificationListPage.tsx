"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  Building2,
  CalendarDays,
  Check,
  Eye,
  GraduationCap,
  Search,
  X as XIcon,
} from "lucide-react";
import {
  IconBuildingBank,
  IconCake,
  IconCertificate,
  IconGenderBigender,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import { ADMIN_NAV_ICON } from "../navigations/admin-nav-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState, type ComponentType } from "react";
import { toast } from "sonner";
import type {
  VerificationRequestDetail,
  VerificationRequestListEntry,
} from "@/apis/verification-requests";
import {
  getVerificationRequestDetail,
} from "@/lib/actions";
import { DEGREE_LABELS } from "@/lib/education";
import ActiveFilterChips from "../common/ActiveFilterChips";
import Avatar from "../common/Avatar";
import FilterDropdown from "../common/FilterDropdown";
import Pagination from "../common/Pagination";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import Select from "../fields/Select";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import TextArea from "../fields/TextArea";
import AlumniStatusLabel from "../labels/AlumniStatusLabel";
import VerificationRequestStatusLabel from "../labels/VerificationRequestStatusLabel";
import AlertConfirmation from "../modals/AlertConfirmation";
import Modal from "../modals/Modal";
import EmptyState from "../states/EmptyState";
import { TrainingResultLabel } from "../trainings/TrainingLabels";
import { useBranch } from "@/hooks/useBranch";
import { useVerificationReview } from "@/hooks/useVerificationReview";

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

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSubmittedAt(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  })} WIB`;
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="break-words text-[15px] font-medium text-heading">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function HistorySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <p className="text-sm font-semibold text-heading">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function HistoryRow({
  icon: Icon,
  title,
  subtitle,
  trailing,
}: {
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-[15px] font-medium text-heading">
          {title}
        </p>
        {subtitle && (
          <p className="break-words text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </div>
  );
}

function EducationSummary({ detail }: { detail: VerificationRequestDetail }) {
  if (!detail.education_id) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada riwayat pendidikan.
      </p>
    );
  }
  const degree = detail.education_degree
    ? DEGREE_LABELS[detail.education_degree]
    : null;
  const years = detail.education_start_year
    ? `${detail.education_start_year} – ${detail.education_end_year ?? "Sekarang"}`
    : null;
  return (
    <HistoryRow
      // The detail response carries no institution logo, so the icon stands in for one.
      icon={IconBuildingBank}
      title={detail.education_institution_name ?? "—"}
      subtitle={[degree, detail.education_major, years]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

function TrainingSummary({ detail }: { detail: VerificationRequestDetail }) {
  if (!detail.training_id) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada riwayat LK 1.
      </p>
    );
  }
  return (
    <HistoryRow
      icon={IconCertificate}
      title={`LK 1 - ${detail.training_organizer_name ?? "—"}`}
      subtitle={detail.training_year ? `Tahun ${detail.training_year}` : undefined}
      trailing={
        <TrainingResultLabel result={detail.training_result ?? undefined} />
      }
    />
  );
}

// Keep the review sign-off separate from the applicant's profile fields.
function ReviewSummary({ detail }: { detail: VerificationRequestDetail }) {
  const approved = detail.status === "approved";
  const verb = approved ? "Disetujui" : "Ditolak";

  return (
    <div className="border-t border-border pt-4 text-[13px] text-muted-foreground">
      <div className="space-y-1">
        <p>
          {verb} pada{" "}
          {detail.reviewed_at ? formatSubmittedAt(detail.reviewed_at) : "—"}
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">{verb} oleh</span>
          {detail.reviewer_full_name && (
            <Avatar
              src={detail.reviewer_avatar}
              name={detail.reviewer_full_name}
              size={20}
            />
          )}
          <p className="min-w-0 break-words">
            {detail.reviewer_full_name ?? "—"}
            {detail.reviewer_full_name &&
              detail.reviewer_username &&
              ` (${detail.reviewer_username})`}
          </p>
        </div>
      </div>
      {!approved && detail.rejection_reason && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="font-medium">Alasan penolakan</p>
          <p className="mt-1 whitespace-pre-wrap break-words">
            {detail.rejection_reason}
          </p>
        </div>
      )}
    </div>
  );
}

// Mounted only while open, so the reason field always seeds fresh — no reset effect needed.
function RejectFields({
  requestId,
  branchId,
  onClose,
  onRejected,
}: {
  requestId: string;
  branchId?: string;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const { mutateAsync: review, isPending: loading } = useVerificationReview();

  async function handleSubmit() {
    try {
      await review({ id: requestId, branchId, decision: "rejected", reason });
      toast.success("Permintaan verifikasi berhasil ditolak.");
      onRejected();
      onClose();
    } catch (err) {
      console.error(
        "[VerificationRequestListPage] rejectVerificationRequest threw:",
        err
      );
      toast.error(
        err instanceof Error ? err.message : "Gagal menolak permintaan verifikasi."
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
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
      <div className="flex justify-end gap-2 border-t border-border pt-4">
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
  scopeBranchName?: string;
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
  scopeBranchName,
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
  const { mutate: review, isPending: approving } = useVerificationReview();
  const [reviewed, setReviewed] =
    useState<Record<string, "approved" | "rejected">>({});
  const visibleRequests = requests
    .map((request) => reviewed[request.id]
      ? { ...request, status: reviewed[request.id] }
      : request)
    .filter((request) => !initialStatus || request.status === initialStatus);

  const [rejectTarget, setRejectTarget] =
    useState<VerificationRequestListEntry | null>(null);
  const activeFilterCount =
    Number(Boolean(initialStatus)) +
    Number(showBranchFilter && Boolean(selectedBranch));
  const activeStatusOption = STATUS_FILTER_OPTIONS.find(
    (option) => option.value === initialStatus
  );

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    pushParams({ branch_id: "", status: "" });
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
    const target = approveTarget;
    review(
      { id: target.id, branchId: target.branch_id, decision: "approved" },
      {
        onSuccess: () => {
          setReviewed((previous) => ({ ...previous, [target.id]: "approved" }));
          toast.success("Permintaan verifikasi berhasil disetujui.");
          router.refresh();
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setApproveTarget(null),
      }
    );
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
        <FilterDropdown
          panelId="verification-filters"
          ariaLabel="Filter permintaan verifikasi"
          activeCount={activeFilterCount}
          onReset={clearFilters}
        >
          {showBranchFilter && (
            <SearchableSelect
              selectId="verification-branch-filter"
              label="Cabang"
              placeholder="Semua Cabang"
              value={branchOption}
              onChange={(option) =>
                pushParams({
                  branch_id: option ? String(option.value) : "",
                })
              }
              loadOptions={loadBranchOptions}
              defaultOptions={branchOption ? [branchOption] : []}
              portalMenu={false}
            />
          )}
          <Select
            selectId="verification-status-filter"
            label="Status"
            placeholder="Semua Status"
            value={initialStatus}
            onChange={(value) => pushParams({ status: String(value ?? "") })}
            options={STATUS_FILTER_OPTIONS}
          />
        </FilterDropdown>
      </div>

      <ActiveFilterChips
        chips={[
          ...(selectedBranch && showBranchFilter
            ? [
                {
                  key: "branch",
                  label: "Cabang",
                  value: selectedBranch.name,
                  onRemove: () => pushParams({ branch_id: "" }),
                },
              ]
            : []),
          ...(initialStatus
            ? [
                {
                  key: "status",
                  label: "Status",
                  value: activeStatusOption?.label ?? initialStatus,
                  onRemove: () => pushParams({ status: "" }),
                },
              ]
            : []),
        ]}
        onClearAll={clearFilters}
      />

      <div className="mt-6">
        {visibleRequests.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
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
          </div>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 xl:hidden">
              {visibleRequests.map((request) => (
                <li
                  key={request.id}
                  className="overflow-hidden rounded-2xl border border-border bg-surface"
                >
                  <div className="p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        src={request.avatar}
                        name={request.full_name}
                        size={44}
                      />
                      <div className="min-w-0">
                        <p className="break-words text-[15px] font-semibold leading-5 text-heading">
                          {request.full_name}
                        </p>
                        <p className="mt-0.5 break-all text-[13px] text-muted-foreground">
                          @{request.username}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <VerificationRequestStatusLabel status={request.status} />
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        Diajukan {formatSubmittedAt(request.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="border-y border-border bg-surface-subtle px-4 py-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground">
                      Asal Organisasi
                    </p>
                    <div className="space-y-2 text-[13px] text-heading">
                      {(showBranchFilter || !request.chapter_id) && (
                        <div className="flex items-start gap-2">
                          <Building2
                            className="mt-0.5 size-4 shrink-0 text-primary-foreground"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 break-words">
                            Cabang{" "}
                            {request.branch_name ?? selectedBranch?.name ?? "—"}
                          </span>
                        </div>
                      )}
                      {request.chapter_id && (
                        <div className="flex items-start gap-2">
                          <GraduationCap
                            className="mt-0.5 size-4 shrink-0 text-primary-foreground"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 break-words">
                            Komisariat {request.chapter_name ?? "—"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    {allowReviewActions && request.status === "pending" ? (
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-2">
                        <Button
                          variant="outline"
                          className="px-2.5"
                          onClick={() => handleOpenDetail(request)}
                        >
                          <Eye className="size-4" /> Detail
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => setRejectTarget(request)}
                        >
                          Tolak
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => setApproveTarget(request)}
                        >
                          Setujui
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleOpenDetail(request)}
                      >
                        <Eye className="size-4" /> Lihat Detail
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface xl:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Kader</th>
                    <th className="px-4 py-3">Asal Organisasi</th>
                    <th className="px-4 py-3">Diajukan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider text-[13px]">
                  {visibleRequests.map((request) => (
                    <tr key={request.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={request.avatar}
                            name={request.full_name}
                            size={36}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-heading">
                              {request.full_name}
                            </p>
                            <p className="truncate text-[13px] text-muted-foreground">
                              @{request.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-heading">
                        {request.chapter_id ? (
                          <div className="min-w-0">
                            <p className="truncate">
                              Komisariat {request.chapter_name ?? "—"}
                            </p>
                            {showBranchFilter && (
                              <p className="truncate text-[13px] text-muted-foreground">
                                Cabang{" "}
                                {request.branch_name ??
                                  selectedBranch?.name ??
                                  "—"}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <p className="truncate">
                              Cabang{" "}
                              {request.branch_name ??
                                selectedBranch?.name ??
                                scopeBranchName ??
                                "—"}
                            </p>
                            <p className="truncate text-[13px] text-muted-foreground">
                              Keanggotaan langsung
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-heading">
                        {formatSubmittedAt(request.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <VerificationRequestStatusLabel
                          status={request.status}
                        />
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
                          {allowReviewActions &&
                            request.status === "pending" && (
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
          </>
        )}
      </div>

      {visibleRequests.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Pagination currentPage={currentPage} totalPages={totalPage} />
          <p className="text-center text-sm text-muted-foreground">
            Menampilkan {visibleRequests.length} dari {totalData} permintaan
          </p>
        </div>
      )}

      <Modal
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        title="Detail Permintaan Verifikasi"
      >
        {detailLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Memuat detail...
          </p>
        ) : detailData ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Avatar
                src={detailData.avatar}
                name={detailData.full_name}
                size={48}
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-heading">
                  {detailData.full_name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  @{detailData.username}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field icon={IconMail} label="Email" value={detailData.email} />
              <Field
                icon={IconId}
                label="Nama Sesuai KTP"
                value={detailData.ktp_full_name}
              />
              <Field
                icon={IconPhone}
                label="Nomor HP"
                value={detailData.phone_number}
              />
              <Field
                icon={IconCake}
                label="Tanggal Lahir"
                value={formatDate(detailData.date_of_birth)}
              />
              <Field
                icon={IconGenderBigender}
                label="Jenis Kelamin"
                value={
                  detailData.gender
                    ? GENDER_LABEL[detailData.gender]
                    : undefined
                }
              />
              <Field
                icon={IconUser}
                label="Status Keanggotaan"
                value={<AlumniStatusLabel isAlumni={detailData.is_alumni} />}
              />
              <Field
                icon={ADMIN_NAV_ICON.branch}
                label="Cabang"
                value={
                  detailData.branch_name ??
                  detailTarget?.branch_name ??
                  selectedBranch?.name ??
                  scopeBranchName
                }
              />
              {detailData.chapter_id && (
                <Field
                  icon={ADMIN_NAV_ICON.chapter}
                  label="Komisariat"
                  value={detailData.chapter_name}
                />
              )}
              <div className="sm:col-span-2">
                <Field
                  icon={IconMapPin}
                  label="Alamat Lengkap"
                  // An applicant may skip the address entirely, and "" is not nullish enough for Field's dash.
                  value={
                    [
                      detailData.address_street,
                      detailData.district_name,
                      detailData.city_name,
                      detailData.province_name,
                    ]
                      .filter(Boolean)
                      .join(", ") || undefined
                  }
                />
              </div>
            </div>

            <HistorySection title="Pendidikan">
              <EducationSummary detail={detailData} />
            </HistorySection>

            <HistorySection title="Latihan Kader 1">
              <TrainingSummary detail={detailData} />
            </HistorySection>

            {detailData.status !== "pending" && (
              <ReviewSummary detail={detailData} />
            )}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
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
                branchId={rejectTarget.branch_id}
                onClose={() => setRejectTarget(null)}
                onRejected={() => {
                  setReviewed((previous) => ({
                    ...previous,
                    [rejectTarget.id]: "rejected",
                  }));
                  router.refresh();
                }}
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
  "description" | "showBranchFilter" | "selectedBranch" | "scopeBranchName"
>;

export default function BranchVerificationListPage(
  props: BranchVerificationListPageProps
) {
  const { branchName } = useBranch();

  return (
    <VerificationRequestListPage
      {...props}
      description={`Tinjau pengajuan verifikasi identitas kader di Cabang ${branchName}.`}
      scopeBranchName={branchName}
    />
  );
}
