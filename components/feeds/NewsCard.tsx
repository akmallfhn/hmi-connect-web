import Image from "next/image";
import { ChevronRight, Newspaper } from "lucide-react";
import { NEWS_ITEMS } from "./mockData";

export default function NewsCard() {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
        <Newspaper className="size-4 text-primary" />
        Kabar HMI
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {NEWS_ITEMS.map((item) => (
          <a
            key={item.id}
            href="#"
            className="flex items-center gap-3 rounded-lg transition hover:bg-[#f5f7fb]"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f7fb]">
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium text-[#172033]">
                {item.title}
              </p>
              <p className="text-xs text-[#5f6573]">{item.source}</p>
            </div>
          </a>
        ))}
      </div>

      <a
        href="#"
        className="mt-3 flex items-center justify-between border-t border-[#e6e9ef] pt-3 text-sm font-medium text-primary"
      >
        Lihat Semua Berita
        <ChevronRight className="size-4" />
      </a>
    </div>
  );
}
