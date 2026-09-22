import type { Metadata } from "next";
import ArticleCreatePage from "@/components/pages/ArticleCreatePage";

export const metadata: Metadata = {
  title: "Tulis Artikel",
  description: "Tulis dan siapkan artikel baru untuk HMI Connect.",
};

export default function CreateArticleRoute() {
  return <ArticleCreatePage />;
}
