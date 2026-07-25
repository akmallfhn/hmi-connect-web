import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { SessionUser } from "@/apis/session";

type MenuItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  featured?: boolean;
  visible: (isSuperAdmin: boolean, user: SessionUser | null) => boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: "Kelola Cabang",
    description: "Kelola data dan status Cabang HMI di seluruh wilayah.",
    href: "/branches",
    icon: Building2,
    iconBg: "bg-primary-soft",
    iconColor: "text-primary",
    visible: (isSuperAdmin, user) =>
      isSuperAdmin || Boolean(user?.can_manage_branch),
  },
  {
    title: "Kelola Komisariat",
    description: "Kelola data Komisariat di bawah naungan tiap Cabang.",
    href: "/chapters",
    icon: GraduationCap,
    iconBg: "bg-tertiary/10",
    iconColor: "text-tertiary",
    visible: (isSuperAdmin, user) =>
      isSuperAdmin || Boolean(user?.can_manage_chapter),
  },
  {
    title: "Kelola Badko",
    description: "Kelola data Badan Koordinasi (Badko) tingkat wilayah.",
    href: "/coordinating-bodies",
    icon: Network,
    iconBg: "bg-secondary-soft",
    iconColor: "text-secondary",
    visible: (isSuperAdmin, user) =>
      isSuperAdmin || Boolean(user?.can_manage_coordinating_body),
  },
  {
    title: "Dashboard Super Admin",
    description: "Akses penuh ke seluruh pengaturan dan data platform.",
    href: "/master",
    icon: ShieldCheck,
    iconBg: "bg-white/10",
    iconColor: "text-white",
    featured: true,
    visible: (isSuperAdmin) => isSuperAdmin,
  },
];

interface AdminDashboardPageProps {
  user: SessionUser | null;
}

export default function AdminDashboardPage({ user }: AdminDashboardPageProps) {
  const isSuperAdmin = user?.role_name === "Super Admin";
  const menuItems = MENU_ITEMS.filter((item) =>
    item.visible(isSuperAdmin, user)
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-6 py-10">
      <h1 className="text-2xl font-bold text-[#172033]">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-[#5f6573]">
        Selamat datang, {user?.full_name ?? "Admin"}.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {menuItems.map(
          ({
            title,
            description,
            href,
            icon: Icon,
            iconBg,
            iconColor,
            featured,
          }) => (
            <Link
              key={href}
              href={href}
              className={[
                "group flex flex-col justify-between rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                featured
                  ? "bg-[#172033] hover:bg-[#1d2740]"
                  : "border border-[#e6e9ef] bg-white",
              ].join(" ")}
            >
              <div>
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
                >
                  <Icon className="size-5" />
                </div>
                <p
                  className={`mt-4 text-base font-bold ${featured ? "text-white" : "text-[#172033]"}`}
                >
                  {title}
                </p>
                <p
                  className={`mt-1.5 text-sm ${featured ? "text-white/70" : "text-[#5f6573]"}`}
                >
                  {description}
                </p>
              </div>
              <div
                className={`mt-5 flex items-center gap-1 text-sm font-semibold ${featured ? "text-white" : "text-primary"}`}
              >
                Buka
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
