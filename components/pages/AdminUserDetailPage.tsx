"use client";

import {
  ArrowLeft,
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
import {
  deleteUser,
  grantBranchAdmin,
  grantChapterAdmin,
  grantCoordinatingBodyAdmin,
  revokeBranchAdmin,
  revokeChapterAdmin,
  revokeCoordinatingBodyAdmin,
} from "@/lib/actions";
import { isSuccessStatus, type UserStatusEnum } from "@/lib/types";
import UserRoleLabel from "../labels/UserRoleLabel";
import UserStatusLabel from "../labels/UserStatusLabel";
import UserVerifiedLabel from "../labels/UserVerifiedLabel";
import Button from "../buttons/Button";
import Switch from "../buttons/Switch";
import Avatar from "../common/Avatar";
import AdminEditUserAccountForm from "../forms/AdminEditUserAccountForm";
import AdminEditUserContactForm from "../forms/AdminEditUserContactForm";
import AdminEditUserMembershipForm from "../forms/AdminEditUserMembershipForm";
import AdminEditUserOrganizationForm from "../forms/AdminEditUserOrganizationForm";
import AlertConfirmation from "../modals/AlertConfirmation";

const STATUS_DOT_CLASSNAME: Record<UserStatusEnum, string> = {
  active: "bg-primary",
  pending: "bg-secondary",
  inactive: "bg-destructive",
};

type ManagementScope = "branch" | "chapter" | "coordinating_body";

const SCOPE_LABEL: Record<ManagementScope, string> = {
  coordinating_body: "Administrator Badko",
  branch: "Administrator Cabang",
  chapter: "Administrator Komisariat",
};

const GRANT_ACTION: Record<
  ManagementScope,
  (id: string) => ReturnType<typeof grantBranchAdmin>
> = {
  branch: grantBranchAdmin,
  chapter: grantChapterAdmin,
  coordinating_body: grantCoordinatingBodyAdmin,
};

const REVOKE_ACTION: Record<
  ManagementScope,
  (id: string) => ReturnType<typeof revokeBranchAdmin>
> = {
  branch: revokeBranchAdmin,
  chapter: revokeChapterAdmin,
  coordinating_body: revokeCoordinatingBodyAdmin,
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

function ScopeToggleChip({
  scope,
  checked,
  disabled,
  onRequestChange,
}: {
  scope: ManagementScope;
  checked: boolean;
  disabled: boolean;
  onRequestChange: (scope: ManagementScope, nextValue: boolean) => void;
}) {
  return (
    <div
      className={`flex w-full items-center justify-center gap-2.5 rounded-lg border px-3.5 py-2 transition ${
        checked ? "border-primary bg-primary-soft/30" : "border-[#e6e9ef]"
      }`}
    >
      <Switch
        switchId={`admin-org-can-manage-${scope}`}
        checked={checked}
        onChange={(next) => onRequestChange(scope, next)}
        disabled={disabled}
      />
      <span
        className={`text-[13px] font-medium ${checked ? "text-primary" : "text-[#172033]"}`}
      >
        {SCOPE_LABEL[scope]}
      </span>
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
  const [pendingScope, setPendingScope] = useState<{
    scope: ManagementScope;
    nextValue: boolean;
  } | null>(null);
  const [isSavingScope, setIsSavingScope] = useState(false);

  function handleSaved() {
    setEditSection(null);
    router.refresh();
  }

  function requestScopeToggle(scope: ManagementScope, nextValue: boolean) {
    setPendingScope({ scope, nextValue });
  }

  async function confirmScopeToggle() {
    if (!pendingScope) return;
    const { scope, nextValue } = pendingScope;
    setIsSavingScope(true);
    try {
      const action = nextValue ? GRANT_ACTION[scope] : REVOKE_ACTION[scope];
      const result = await action(user.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal memperbarui hak akses.");
        return;
      }
      toast.success("Hak akses berhasil diperbarui.");
      setPendingScope(null);
      router.refresh();
    } catch (err) {
      console.error("[AdminUserDetailPage] access toggle threw:", err);
      toast.error("Gagal memperbarui hak akses.");
    } finally {
      setIsSavingScope(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteUser(user.id);
      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menghapus user.");
        return;
      }
      toast.success("User berhasil dihapus.");
      router.push("/master/users");
    } catch (err) {
      console.error("[AdminUserDetailPage] deleteUser threw:", err);
      toast.error("Gagal menghapus user.");
    } finally {
      setIsDeleting(false);
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
            <h1 className="text-xl font-bold text-[#172033]">
              {user.full_name}
            </h1>
            <p className="mt-0.5 text-sm text-[#5f6573]">@{user.username}</p>
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
            value={<UserVerifiedLabel isVerified={user.is_verified} />}
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
          {user.role_name === "Administrator" && (
            <div className="flex flex-col gap-3 border-t border-[#e6e9ef] pt-4 sm:col-span-2">
              <p className="text-sm font-medium text-[#172033]">
                Hak Akses Admin
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <ScopeToggleChip
                  scope="coordinating_body"
                  checked={user.can_manage_coordinating_body}
                  disabled={isSavingScope}
                  onRequestChange={requestScopeToggle}
                />
                <ScopeToggleChip
                  scope="branch"
                  checked={user.can_manage_branch}
                  disabled={isSavingScope}
                  onRequestChange={requestScopeToggle}
                />
                <ScopeToggleChip
                  scope="chapter"
                  checked={user.can_manage_chapter}
                  disabled={isSavingScope}
                  onRequestChange={requestScopeToggle}
                />
              </div>
            </div>
          )}
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

      <div className="mt-4 flex justify-end">
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-fit"
        >
          <Trash2 className="size-3.5" />
          Hapus User
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
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus user ini?"
        message={`Apakah kamu yakin ingin menghapus ${user.full_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={isDeleting}
      />

      <AlertConfirmation
        open={pendingScope !== null}
        onClose={() => setPendingScope(null)}
        onConfirm={confirmScopeToggle}
        title={
          pendingScope
            ? pendingScope.nextValue
              ? `Jadikan ${SCOPE_LABEL[pendingScope.scope]}?`
              : `Cabut akses ${SCOPE_LABEL[pendingScope.scope]}?`
            : ""
        }
        message={
          pendingScope
            ? pendingScope.nextValue
              ? `Apakah kamu yakin ingin menjadikan ${user.full_name} sebagai ${SCOPE_LABEL[pendingScope.scope]}?`
              : `Apakah kamu yakin ingin mencabut akses ${SCOPE_LABEL[pendingScope.scope]} dari ${user.full_name}?`
            : ""
        }
        confirmLabel={pendingScope?.nextValue ? "Jadikan Admin" : "Cabut Akses"}
        confirmVariant={pendingScope?.nextValue ? "primary" : "destructive"}
        loading={isSavingScope}
      />
    </div>
  );
}
