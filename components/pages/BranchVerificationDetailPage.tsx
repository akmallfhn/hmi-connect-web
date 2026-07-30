"use client";

import { ArrowLeft, Check, X as XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import type { VerificationRequestDetail } from "@/apis/access";
import { approveVerificationRequest, rejectVerificationRequest } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import VerificationRequestStatusLabel from "../labels/VerificationRequestStatusLabel";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import TextArea from "../fields/TextArea";
import AlertConfirmation from "../modals/AlertConfirmation";
import Modal from "../modals/Modal";

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

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white p-5">
      <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm text-[#5f6573]">{label}</p>
      <p className="text-[15px] font-medium text-[#172033]">{value ?? "—"}</p>
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
      console.error("[BranchVerificationDetailPage] rejectVerificationRequest threw:", err);
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

interface BranchVerificationDetailPageProps {
  branchId: string;
  request: VerificationRequestDetail;
}

export default function BranchVerificationDetailPage({
  branchId,
  request,
}: BranchVerificationDetailPageProps) {
  const router = useRouter();
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const isPending = request.status === "pending";

  function handleApprove() {
    setApproving(true);
    approveVerificationRequest(request.id)
      .then((result) => {
        if (isSuccessStatus(result.status)) {
          toast.success("Permintaan verifikasi berhasil disetujui.");
          router.refresh();
        } else {
          toast.error(result.message ?? "Gagal menyetujui permintaan verifikasi.");
        }
      })
      .finally(() => {
        setApproving(false);
        setShowApproveConfirm(false);
      });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link
        href={`/branches/${branchId}/verification`}
        className="inline-block w-fit"
      >
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar permintaan verifikasi
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-[#e6e9ef] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={request.full_name} size={64} />
          <div>
            <h1 className="text-xl font-bold text-[#172033]">{request.full_name}</h1>
            <p className="mt-0.5 text-sm text-[#5f6573]">@{request.username}</p>
            <div className="mt-2">
              <VerificationRequestStatusLabel status={request.status} />
            </div>
          </div>
        </div>

        {isPending && (
          <div className="flex shrink-0 gap-2">
            <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
              <XIcon className="size-4" />
              Tolak
            </Button>
            <Button variant="primary" onClick={() => setShowApproveConfirm(true)}>
              <Check className="size-4" />
              Setujui
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard title="Akun">
          <Field label="Nama Lengkap" value={request.full_name} />
          <Field label="Username" value={`@${request.username}`} />
          <Field label="Diajukan" value={formatDate(request.created_at)} />
        </SectionCard>

        <SectionCard title="Data KTP & Kontak">
          <Field label="Nama Sesuai KTP" value={request.ktp_full_name} />
          <Field label="NIK" value={request.nik} />
          <Field label="Nomor HP" value={request.phone_number} />
          <Field label="Tanggal Lahir" value={formatDate(request.date_of_birth)} />
          <Field
            label="Jenis Kelamin"
            value={request.gender ? GENDER_LABEL[request.gender] : undefined}
          />
        </SectionCard>

        <SectionCard title="Alamat & Organisasi">
          <Field label="Alamat" value={request.address_street} />
          <Field label="ID Kecamatan" value={request.district_id} />
          <Field label="Komisariat" value={request.chapter_name} />
        </SectionCard>
      </div>

      <AlertConfirmation
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Setujui Permintaan Verifikasi?"
        message="Kader akan mendapatkan status terverifikasi, kartu anggota, dan langganan aktif selama satu tahun."
        confirmLabel="Setujui"
        confirmVariant="primary"
        loading={approving}
      />

      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Tolak Permintaan Verifikasi"
      >
        {showRejectModal && (
          <RejectFields
            requestId={request.id}
            onClose={() => setShowRejectModal(false)}
            onRejected={() => router.refresh()}
          />
        )}
      </Modal>
    </div>
  );
}
