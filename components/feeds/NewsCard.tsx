import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Newspaper, TrendingUp } from "lucide-react";
import { listNewsArticles } from "@/apis/news";

export default async function NewsCard() {
  const { list } = await listNewsArticles({ pageSize: 5 });

  if (list.length === 0) return null;

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
        <TrendingUp className="size-4 text-primary" />
        Kabar Trending
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {list.map((article) => (
          <a
            key={article.id}
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg transition hover:bg-[#f5f7fb]"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f7fb]">
              {article.image_url ? (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Newspaper className="size-5 text-[#c3c7d1]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium text-[#172033]">
                {article.title}
              </p>
              <p className="text-xs text-[#5f6573]">{article.source_name}</p>
            </div>
          </a>
        ))}
      </div>

      <Link
        href="/news"
        className="mt-3 flex items-center justify-between border-t border-[#e6e9ef] pt-3 text-sm font-medium text-primary"
      >
        Lihat Semua Berita
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
