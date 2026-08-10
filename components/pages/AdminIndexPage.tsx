import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SessionUser } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import AdminPageTitle from "../common/AdminPageTitle";
import PageMargin from "../common/PageMargin";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import AdminUserMenu from "../buttons/AdminUserMenu";

type MenuItem = {
  title: string;
  description: string;
  getHref: (user: SessionUser | null) => string;
  illustration: string;
  visible: (isSuperAdmin: boolean, user: SessionUser | null) => boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard Super Admin",
    description: "Akses penuh ke seluruh pengaturan dan data platform.",
    getHref: () => "/master",
    illustration:
      "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_29_46%20PM.webp",
    visible: (isSuperAdmin) => isSuperAdmin,
  },
  {
    title: "Kelola Badko",
    description: "Kelola data Badan Koordinasi (Badko) tingkat wilayah.",
    getHref: (user) =>
      user?.coordinating_body_id
        ? `/coordinating-bodies/${user.coordinating_body_id}`
        : "/coordinating-bodies",
    illustration:
      "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_28_11%20PM.webp",
    visible: (isSuperAdmin, user) =>
      isSuperAdmin || Boolean(user?.can_manage_coordinating_body),
  },
  {
    title: "Kelola Cabang",
    description: "Kelola data dan status Cabang HMI di seluruh wilayah.",
    getHref: (user) =>
      user?.branch_id ? `/branches/${user.branch_id}` : "/branches",
    illustration:
      "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_27_53%20PM.webp",
    visible: (isSuperAdmin, user) =>
      isSuperAdmin || Boolean(user?.can_manage_branch),
  },
  {
    title: "Kelola Komisariat",
    description: "Kelola data Komisariat di bawah naungan tiap Cabang.",
    getHref: (user) =>
      user?.chapter_id ? `/chapters/${user.chapter_id}` : "/chapters",
    illustration:
      "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_28_00%20PM.webp",
    visible: (isSuperAdmin, user) =>
      isSuperAdmin || Boolean(user?.can_manage_chapter),
  },
];

interface AdminIndexPageProps {
  user: SessionUser | null;
}

export default function AdminIndexPage({ user }: AdminIndexPageProps) {
  const isSuperAdmin = user?.role_name === "Super Admin";
  const menuItems = MENU_ITEMS.filter((item) =>
    item.visible(isSuperAdmin, user)
  );
  const firstName = user?.full_name?.split(" ")[0] ?? "Admin";
  const mainSiteOrigin = getMainSiteOrigin();

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-16">
      <PageMargin className="py-8 lg:py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <AdminPageTitle description="Kelola data dan pengaturan HMI dengan mudah dan efisien.">
              Selamat datang, {firstName} 👋
            </AdminPageTitle>
          </div>
          <AdminUserMenu
            fullName={user?.full_name}
            avatar={user?.avatar}
            roleName={user?.role_name}
            mainSiteOrigin={mainSiteOrigin}
          />
        </div>
        <div className="mt-6">
          <AdminDashboardBanner />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {menuItems.map(({ title, description, getHref, illustration }) => (
            <Link
              key={title}
              href={getHref(user)}
              className="group flex flex-col rounded-2xl border border-[#e6e9ef] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                <Image
                  src={illustration}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>

              <div className="mt-4 flex-1">
                <p className="font-bold text-[#172033]">{title}</p>
                <p className="mt-1.5 text-sm text-[#5f6573]">{description}</p>
              </div>

              <div className="mt-4 flex items-center gap-1 border-t border-[#e6e9ef] pt-4 text-sm font-semibold text-secondary">
                Buka
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </PageMargin>
    </div>
  );
}
