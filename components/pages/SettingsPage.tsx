"use client";

import {
  ADMIN_ENTITY_LABEL,
  ADMIN_ENTITY_ORDER,
  adminEntityHref,
  officialEntityHref,
} from "@/lib/access";
import type { EducationHistoryEntry } from "@/apis/users";
import { logoutUser } from "@/lib/actions";
import type { AccessEntityTypeEnum, VerificationStatusEnum } from "@/lib/types";
import {
  BadgeCheck,
  ChevronRight,
  Info,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import PageMargin from "../common/PageMargin";
import PasswordForm from "../forms/PasswordForm";
import ProfileSidebar from "../feeds/ProfileSidebar";
import AboutProfileModal from "../modals/AboutProfileModal";
import AlertConfirmation from "../modals/AlertConfirmation";
import BottomNav from "../navigations/BottomNav";
import Header from "../navigations/Header";
import { useHeaderAdminAccess } from "../navigations/HeaderAdminAccessContext";
import LogoHmi from "../svg/LogoHmi";

interface SettingsPageProps {
  fullName?: string;
  avatar?: string;
  email?: string;
  userId?: string;
  username?: string;
  verificationStatus?: VerificationStatusEnum;
  isAlumni?: boolean;
  hasPassword?: boolean;
  headline?: string;
  followingCount?: number;
  followersCount?: number;
  educationHistories?: EducationHistoryEntry[];
  createdAt?: string;
  registrationNumber?: number;
  provinceName?: string;
}

// An organization is named outright; the other four read as "Cabang Depok".
function formatEntityName(
  entityType: AccessEntityTypeEnum,
  name?: string | null,
) {
  if (!name) return ADMIN_ENTITY_LABEL[entityType];
  if (entityType === "organization") return name;
  return `${ADMIN_ENTITY_LABEL[entityType]} ${name}`;
}

interface SettingsMenuItem {
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
}

export default function SettingsPage({
  fullName,
  avatar,
  email,
  userId,
  username,
  verificationStatus,
  isAlumni,
  hasPassword,
  headline,
  followingCount,
  followersCount,
  educationHistories,
  createdAt,
  registrationNumber,
  provinceName,
}: SettingsPageProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const adminAccess = useHeaderAdminAccess();

  const adminEntities = adminAccess
    ? adminAccess.grants
        .slice()
        .sort(
          (a, b) =>
            ADMIN_ENTITY_ORDER.indexOf(a.entity_type) -
            ADMIN_ENTITY_ORDER.indexOf(b.entity_type),
        )
        .map((grant) => ({
          key: grant.id,
          name: formatEntityName(grant.entity_type, grant.entity_name),
          imageUrl: grant.entity_image_url,
          items: [
            {
              label: "Dashboard",
              description: `Kelola data dan anggota ${formatEntityName(grant.entity_type, grant.entity_name)}.`,
              href: `${adminAccess.adminOrigin}${adminEntityHref(grant.entity_type, grant.entity_id)}`,
              icon: LayoutDashboard,
              external: true,
            },
            {
              label: "Official Account",
              description: `Buat postingan atas nama ${formatEntityName(grant.entity_type, grant.entity_name)}.`,
              href: officialEntityHref(grant.entity_type, grant.entity_id),
              icon: BadgeCheck,
            },
          ] satisfies SettingsMenuItem[],
        }))
    : [];

  const accountItems: SettingsMenuItem[] = [
    {
      label: "Tentang Saya",
      description: "Nama, tanggal bergabung, dan lokasi akun kamu.",
      onClick: () => setIsAboutOpen(true),
      icon: Info,
    },
    ...(verificationStatus === "unverified"
      ? [
          {
            label: "Verifikasi Akun",
            description: "Lengkapi verifikasi identitas kamu.",
            href: "/verification",
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      label: hasPassword ? "Ubah Password" : "Buat Password",
      description: hasPassword
        ? "Ganti password yang kamu pakai untuk login."
        : "Buat password agar bisa login tanpa Google.",
      onClick: () => setIsPasswordOpen(true),
      icon: KeyRound,
    },
    // Super Admin manages no single entity, so its dashboard is a plain row, not a per-entity card.
    ...(adminAccess?.roleName === "Super Admin"
      ? [
          {
            label: "Dashboard Super Admin",
            description: "Kelola seluruh data dan anggota HMI Connect.",
            href: `${adminAccess.adminOrigin}/master`,
            icon: LayoutDashboard,
            external: true,
          },
        ]
      : []),
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("[SettingsPage] logoutUser threw:", err);
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16 lg:pb-0">
      <Header
        fullName={fullName}
        avatar={avatar}
        email={email}
        userId={userId}
        username={username}
        verificationStatus={verificationStatus}
        mobileBackTitle="Pengaturan & Admin"
      />

      <PageMargin className="py-6">
        <div className="mx-auto lg:max-w-[900px]">
          <div className="hidden lg:mb-4 lg:block">
            <h1 className="text-2xl font-bold text-[#172033]">
              Pengaturan &amp; Admin
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[280px_minmax(0,600px)] lg:gap-4">
            <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
              <ProfileSidebar
                userId={userId}
                fullName={fullName}
                avatar={avatar}
                headline={headline}
                username={username}
                verificationStatus={verificationStatus}
                isAlumni={isAlumni}
                followingCount={followingCount}
                followersCount={followersCount}
                educationHistories={educationHistories}
              />
            </aside>

            <main className="min-w-0">
              <div className="flex flex-col gap-4">
                <MenuCard items={accountItems} />

                {adminEntities.map((entity) => (
                  <MenuCard
                    key={entity.key}
                    items={entity.items}
                    header={
                      <>
                        <EntityBadge
                          name={entity.name}
                          imageUrl={entity.imageUrl}
                        />
                        <p className="min-w-0 truncate text-sm font-semibold text-[#172033]">
                          {entity.name}
                        </p>
                      </>
                    }
                  />
                ))}

                <div className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white">
                  <button
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition hover:bg-destructive-soft"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive">
                      <LogOut className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-destructive">
                        Keluar
                      </span>
                      <span className="block truncate text-[13px] text-[#5f6573]">
                        Keluar dari akun ini di perangkat ini.
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </PageMargin>

      <AboutProfileModal
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        fullName={fullName}
        username={username}
        avatar={avatar}
        createdAt={createdAt}
        registrationNumber={registrationNumber}
        provinceName={provinceName}
      />

      <PasswordForm
        open={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        hasPassword={Boolean(hasPassword)}
      />

      <AlertConfirmation
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Keluar dari akun?"
        message="Kamu perlu masuk kembali untuk mengakses akun ini."
        confirmLabel="Keluar"
        loading={loggingOut}
      />

      <BottomNav userId={userId} username={username} />
    </div>
  );
}

function MenuCard({
  items,
  header,
}: {
  items: SettingsMenuItem[];
  header?: ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e6e9ef] bg-white">
      {header && (
        <div className="flex items-center gap-2.5 px-4 py-3">{header}</div>
      )}
      {items.map((item, index) => (
        <MenuRow
          key={item.label}
          item={item}
          className={index > 0 || header ? "border-t border-[#e6e9ef]" : ""}
        />
      ))}
    </div>
  );
}

function MenuRow({
  item,
  className,
}: {
  item: SettingsMenuItem;
  className?: string;
}) {
  const rowClasses = [
    "flex items-center gap-3 px-4 py-3.5 transition hover:bg-[#f5f7fb]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <item.icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-[#172033]">
          {item.label}
        </span>
        <span className="block truncate text-[13px] text-[#5f6573]">
          {item.description}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-[#7b8190]" />
    </>
  );

  if (!item.href) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={`w-full cursor-pointer text-left ${rowClasses}`}
      >
        {body}
      </button>
    );
  }

  // The admin subdomain is a different origin, so it needs a real full navigation, not <Link>.
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={rowClasses}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href} className={rowClasses}>
      {body}
    </Link>
  );
}

// The entity's own logo, square like every admin list badge, falling back to the HMI emblem.
function EntityBadge({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={32}
          height={32}
          className="h-full w-full object-cover"
        />
      ) : (
        <LogoHmi className="size-4" />
      )}
    </span>
  );
}
