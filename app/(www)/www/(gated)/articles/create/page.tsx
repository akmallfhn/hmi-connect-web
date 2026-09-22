import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listArticleCategories } from "@/apis/articles";
import { getSession } from "@/apis/session";
import ArticleComposerPage from "@/components/pages/ArticleComposerPage";

export const metadata: Metadata = {
  title: "Tulis Artikel",
  description: "Tulis dan siapkan artikel baru untuk HMI Connect.",
};

export default async function CreateArticleRoute() {
  const [{ user }, categories] = await Promise.all([
    getSession(),
    listArticleCategories({ pageSize: 100 }),
  ]);

  // articles/create needs a real author_id, and the JWT subject is the only one a non-admin may use.
  if (!user?.id) redirect("/auth/login?redirectTo=/articles/create");

  return (
    <ArticleComposerPage
      author={{
        id: user.id,
        fullName: user.full_name ?? "Penulis",
        avatar: user.avatar,
      }}
      categories={categories.list}
    />
  );
}
