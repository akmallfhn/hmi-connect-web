import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SessionUser } from "@/apis/session";
import {
  ADMIN_ENTITY_BASE_PATH,
  ADMIN_ENTITY_LABEL,
  ADMIN_ENTITY_ORDER,
  adminEntityHref,
  isSuperAdmin as isSuperAdminUser,
  manageGrants,
} from "@/lib/access";
import { getMainSiteOrigin } from "@/lib/constants";
import type { AccessEntityTypeEnum } from "@/lib/types";
import AdminPageTitle from "../common/AdminPageTitle";
import PageMargin from "../common/PageMargin";
import AdminDashboardBanner from "../banners/AdminDashboardBanner";
import AdminUserMenu from "../buttons/AdminUserMenu";

const ORGANIZATION_ILLUSTRATION =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_29_46%20PM.webp";
const COORDINATING_BODY_ILLUSTRATION =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_28_11%20PM.webp";
const BRANCH_ILLUSTRATION =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_27_53%20PM.webp";
const CHAPTER_ILLUSTRATION =
  "https://fkzvvwtrwpjsclpthqex.supabase.co/storage/v1/object/public/hmi-connect/ChatGPT%20Image%20Jul%2025,%202026,%2002_28_00%20PM.webp";

const ENTITY_PRESENTATION: Record<
  AccessEntityTypeEnum,
  { description: string; illustration: string }
> = {
  organization: {
    description: "Kelola data dan pengaturan organisasi HMI.",
    illustration: ORGANIZATION_ILLUSTRATION,
  },
  coordinating_body: {
    description: "Kelola data Badan Koordinasi (Badko) tingkat wilayah.",
    illustration: COORDINATING_BODY_ILLUSTRATION,
  },
  branch: {
    description: "Kelola data dan status Cabang HMI di seluruh wilayah.",
    illustration: BRANCH_ILLUSTRATION,
  },
  coordinating_chapter: {
    description: "Kelola Koordinator Komisariat di bawah naungan Cabang.",
    illustration: CHAPTER_ILLUSTRATION,
  },
  chapter: {
    description: "Kelola data Komisariat di bawah naungan tiap Cabang.",
    illustration: CHAPTER_ILLUSTRATION,
  },
};

type MenuCard = {
  key: string;
  title: string;
  description: string;
  href: string;
  illustration: string;
};

// Super Admin holds no grants, so its cards still come from the session's own hierarchy ids.
function superAdminCards(
  user: SessionUser | null,
  organizationId?: string
): MenuCard[] {
  const entityIds: Record<AccessEntityTypeEnum, string | undefined> = {
    organization: user?.organization_id ?? organizationId,
    coordinating_body: user?.coordinating_body_id,
    branch: user?.branch_id,
    coordinating_chapter: user?.coordinating_chapter_id,
    chapter: user?.chapter_id,
  };

  return ADMIN_ENTITY_ORDER.map((entityType) => {
    const entityId = entityIds[entityType];
    return {
      key: entityType,
      title: `Kelola ${ADMIN_ENTITY_LABEL[entityType]}`,
      description: ENTITY_PRESENTATION[entityType].description,
      href: entityId
        ? adminEntityHref(entityType, entityId)
        : ADMIN_ENTITY_BASE_PATH[entityType],
      illustration: ENTITY_PRESENTATION[entityType].illustration,
    };
  });
}

// One card per accepted grant — a grant may point at any entity, and a holder may have several.
function grantCards(user: SessionUser | null): MenuCard[] {
  const grants = manageGrants(user);
  return ADMIN_ENTITY_ORDER.flatMap((entityType) =>
    grants
      .filter((grant) => grant.entity_type === entityType)
      .map((grant) => ({
        key: grant.id,
        title: grant.entity_name
          ? `Kelola ${ADMIN_ENTITY_LABEL[entityType]} ${grant.entity_name}`
          : `Kelola ${ADMIN_ENTITY_LABEL[entityType]}`,
        description: ENTITY_PRESENTATION[entityType].description,
        href: adminEntityHref(entityType, grant.entity_id),
        illustration: ENTITY_PRESENTATION[entityType].illustration,
      }))
  );
}

interface AdminIndexPageProps {
  user: SessionUser | null;
  organizationId?: string;
}

export default function AdminIndexPage({
  user,
  organizationId,
}: AdminIndexPageProps) {
  const isSuperAdmin = isSuperAdminUser(user);
  const menuItems: MenuCard[] = isSuperAdmin
    ? [
        {
          key: "master",
          title: "Dashboard Super Admin",
          description: "Akses penuh ke seluruh pengaturan dan data platform.",
          href: "/master",
          illustration: ORGANIZATION_ILLUSTRATION,
        },
        ...superAdminCards(user, organizationId),
      ]
    : grantCards(user);
  const firstName = user?.full_name?.split(" ")[0] ?? "Admin";
  const mainSiteOrigin = getMainSiteOrigin();

  return (
    <div className="min-h-screen pb-16">
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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {menuItems.map(
            ({ key, title, description, href, illustration }) => (
              <Link
                key={key}
                href={href}
                className="group flex flex-col rounded-2xl border border-[#e6e9ef] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                  <Image
                    src={illustration}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
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
            )
          )}
        </div>
      </PageMargin>
    </div>
  );
}
