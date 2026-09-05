"use client";

import AdminPageTitle from "../common/AdminPageTitle";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  UserCheck,
  Users as UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/apis/users";
import { deactivateUser, deleteUser } from "@/lib/actions";
import { isSuccessStatus, type UserStatusEnum } from "@/lib/types";
import UserRoleLabel from "../labels/UserRoleLabel";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import AdminEditUserAccountForm from "../forms/AdminEditUserAccountForm";
import AdminEditUserContactForm from "../forms/AdminEditUserContactForm";
import AdminEditUserMembershipForm from "../forms/AdminEditUserMembershipForm";
import AdminEditUserOrganizationForm from "../forms/AdminEditUserOrganizationForm";
import AlertConfirmation from "../modals/AlertConfirmation";
import ConfirmDeleteUserModal from "../modals/ConfirmDeleteUserModal";

const STATUS_DOT_CLASSNAME: Record<UserStatusEnum, string> = {
  active: "bg-primary",
  pending: "bg-secondary",
  inactive: "bg-destructive",
};

interface AdminUserDetailPageProps {
  user: UserProfile;
}

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

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#172033]">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>
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

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e6e9ef] bg-white px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-[#5f6573]">{label}</p>
        <p className="truncate text-[15px] font-bold text-[#172033]">{value}</p>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage({
  user,
}: AdminUserDetailPageProps) {
  const router = useRouter();
  const [editSection, setEditSection] = useState<
    "account" | "contact" | "organization" | "membership" | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  function handleSaved() {
    setEditSection(null);
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteUser(user.id, user.username);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus user.");
        return;
      }
      toast.success("User berhasil dihapus permanen.");
      router.push("/master/users");
    } catch (err) {
      console.error("[AdminUserDetailPage] deleteUser threw:", err);
      toast.error("Gagal menghapus user.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDeactivate() {
    setIsDeactivating(true);
    try {
      const result = await deactivateUser(user.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menonaktifkan user.");
        return;
      }
      toast.success("User berhasil dinonaktifkan.");
      router.push("/master/users");
    } catch (err) {
      console.error("[AdminUserDetailPage] deactivateUser threw:", err);
      toast.error("Gagal menonaktifkan user.");
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/master/users" className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar user
        </Button>
      </Link>

      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-[#e6e9ef] bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar src={user.avatar} name={user.full_name} size={64} />
            <span
              className={`absolute bottom-0 right-0 size-4 rounded-full border-2 border-white ${STATUS_DOT_CLASSNAME[user.status]}`}
              title={`Status: ${user.status}`}
            />
          </div>
          <div>
            <AdminPageTitle
              variant="compact"
              description={`@${user.username}`}
            >
              {user.full_name}
            </AdminPageTitle>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:shrink-0">
          <StatPill
            icon={UserCheck}
            label="Mengikuti"
            value={user.following_count}
          />
          <StatPill
            icon={UsersIcon}
            label="Pengikut"
            value={user.followers_count}
          />
          <StatPill icon={FileText} label="Postingan" value={user.feed_count} />
          <StatPill
            icon={CalendarDays}
            label="Terdaftar Sejak"
            value={formatDate(user.created_at)}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard
          title="Akun & Peran"
          onEdit={() => setEditSection("account")}
        >
          <Field label="Nama Lengkap" value={user.full_name} />
          <Field label="Username" value={`@${user.username}`} />
          <Field label="Email" value={user.email} />
          <Field
            label="Role"
            value={
              <UserRoleLabel roleId={user.role_id} roleName={user.role_name} />
            }
          />
          <Field
            label="Status"
            value={<UserStatusLabel status={user.status} />}
          />
          <Field
            label="Terverifikasi"
            value={<UserVerifiedLabel status={user.verification_status} />}
          />
        </SectionCard>

        <SectionCard
          title="Data KTP & Kontak"
          onEdit={() => setEditSection("contact")}
        >
          <Field label="Nama Sesuai KTP" value={user.ktp_full_name} />
          <Field label="Nomor HP" value={user.phone_number} />
          <Field label="Tanggal Lahir" value={formatDate(user.date_of_birth)} />
          <Field
            label="Jenis Kelamin"
            value={user.gender ? GENDER_LABEL[user.gender] : undefined}
          />
          <Field label="Alamat" value={user.address_street} />
          <Field label="Provinsi" value={user.province_name} />
          <Field label="Kota/Kabupaten" value={user.city_name} />
          <Field label="Kecamatan" value={user.district_name} />
        </SectionCard>

        <SectionCard
          title="Organisasi"
          onEdit={() => setEditSection("organization")}
        >
          <Field label="Komisariat" value={user.chapter_name} />
          <Field label="Cabang" value={user.branch_name} />
          <Field label="Badko" value={user.coordinating_body_name} />
          <Field label="Organisasi" value={user.organization_name} />
          <Field label="Nomor Kartu Anggota" value={user.member_card} />
          <div className="flex flex-col gap-1 border-t border-[#e6e9ef] pt-4 sm:col-span-2">
            <p className="text-sm font-medium text-[#172033]">Hak Akses Admin</p>
            <p className="text-[13px] text-[#5f6573]">
              Akses admin kini diberikan per entitas lewat undangan. Buka
              Pengaturan &rarr; Akses pada Badko/Cabang/Korkom/Komisariat yang
              bersangkutan untuk mengundang atau mencabut akses.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Informasi Lainnya"
          onEdit={() => setEditSection("membership")}
        >
          <Field label="Headline" value={user.headline} />
          <Field
            label="Mulai Langganan"
            value={formatDate(user.subscription_started_at)}
          />
          <Field
            label="Berakhir Langganan"
            value={formatDate(user.subscription_ended_at)}
          />
          <Field label="Bio" value={user.bio} />
        </SectionCard>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setShowDeactivateConfirm(true)}
          className="w-fit text-destructive"
        >
          <Ban className="size-3.5" />
          Nonaktifkan Akun
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-fit"
        >
          <Trash2 className="size-3.5" />
          Hapus User Permanen
        </Button>
      </div>

      <AdminEditUserAccountForm
        open={editSection === "account"}
        onClose={() => setEditSection(null)}
        onSaved={handleSaved}
        user={user}
      />
      <AdminEditUserContactForm
        open={editSection === "contact"}
        onClose={() => setEditSection(null)}
        onSaved={handleSaved}
        user={user}
      />
      <AdminEditUserOrganizationForm
        open={editSection === "organization"}
        onClose={() => setEditSection(null)}
        onSaved={handleSaved}
        user={user}
      />
      <AdminEditUserMembershipForm
        open={editSection === "membership"}
        onClose={() => setEditSection(null)}
        onSaved={handleSaved}
        user={user}
      />

      <AlertConfirmation
        open={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivate}
        title="Nonaktifkan akun ini?"
        message={`Apakah kamu yakin ingin menonaktifkan ${user.full_name}? Akun akan disoftdelete dan tidak bisa login, tapi datanya tetap tersimpan — email, username, dan nomor kartu anggotanya tetap dicadangkan.`}
        confirmLabel="Nonaktifkan"
        loading={isDeactivating}
      />

      <ConfirmDeleteUserModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        fullName={user.full_name}
        username={user.username}
        loading={isDeleting}
      />

    </div>
  );
}
