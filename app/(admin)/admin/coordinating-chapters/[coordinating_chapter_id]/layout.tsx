import type { ReactNode } from "react";
import { getCoordinatingChapterDetail } from "@/apis/coordinating-chapters";
import { getSession } from "@/apis/session";
import { canManageEntity } from "@/lib/access";
import { getMainSiteOrigin } from "@/lib/constants";
import EntitySidebar from "@/components/navigations/EntitySidebar";
import PageState from "@/components/states/PageState";

interface CoordinatingChapterLayoutProps {
  children: ReactNode;
  params: Promise<{ coordinating_chapter_id: string }>;
}

export default async function CoordinatingChapterLayout({
  children,
  params,
}: CoordinatingChapterLayoutProps) {
  const { coordinating_chapter_id } = await params;
  const { user } = await getSession();

  if (
    !canManageEntity(user, "coordinating_chapter", coordinating_chapter_id)
  ) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Korkom ini."
      />
    );
  }

  const coordinatingChapter = await getCoordinatingChapterDetail(
    coordinating_chapter_id,
  );
  if (!coordinatingChapter) {
    return <PageState variant="not_found" backHref={getMainSiteOrigin()} />;
  }

  if (coordinatingChapter.status === "inactive") {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Korkom ini sedang tidak aktif dan tidak dapat dikelola."
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <EntitySidebar
        scope="coordinating_chapter"
        entityId={coordinatingChapter.id}
        entityName={coordinatingChapter.name}
        parentName={coordinatingChapter.branch_name}
        imageUrl={coordinatingChapter.image_url}
        fullName={user?.full_name}
        avatar={user?.avatar}
        roleName={user?.role_name}
      />
      <main className="min-h-screen min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
