import type { ReactNode } from "react";
import { getChapterDetail } from "@/apis/chapters";
import { getSession } from "@/apis/session";
import { getMainSiteOrigin } from "@/lib/constants";
import EntitySidebar from "@/components/navigations/EntitySidebar";
import PageState from "@/components/states/PageState";

interface ChapterLayoutProps {
  children: ReactNode;
  params: Promise<{ chapter_id: string }>;
}

export default async function ChapterLayout({
  children,
  params,
}: ChapterLayoutProps) {
  const { chapter_id } = await params;
  const { user } = await getSession();

  const isSuperAdmin = user?.role_name === "Super Admin";
  const canManageThisChapter =
    Boolean(user?.can_manage_chapter) && user?.chapter_id === chapter_id;

  if (!isSuperAdmin && !canManageThisChapter) {
    return (
      <PageState
        variant="forbidden"
        backHref={getMainSiteOrigin()}
        message="Kamu tidak memiliki akses untuk mengelola Komisariat ini."
      />
    );
  }

  const chapter = await getChapterDetail(chapter_id);
  if (!chapter) {
    return <PageState variant="not_found" backHref={getMainSiteOrigin()} />;
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <EntitySidebar
        storageKey="chapter_sidebar_collapsed"
        href={`/chapters/${chapter.id}`}
        entityLabel="Komisariat"
        entityName={chapter.name}
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
