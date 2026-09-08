import Image from "next/image";
import Link from "next/link";
import LogoHmi from "../svg/LogoHmi";

export type EntityChildItem = {
  id: string;
  name: string;
  href: string;
  imageUrl?: string | null;
  meta?: string;
};

interface EntityChildrenCardProps {
  title: string;
  items: EntityChildItem[];
  emptyMessage: string;
}

export default function EntityChildrenCard({
  title,
  items,
  emptyMessage,
}: EntityChildrenCardProps) {
  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#172033] xl:text-[15px]">
          {title}
        </h2>
        {items.length > 0 && (
          <span className="text-xs text-[#5f6573] xl:text-[13px]">
            {items.length} terdaftar
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-sm text-[#5f6573] xl:text-[15px]">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e6e9ef] p-3 transition hover:bg-[#f5f7fb]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e6e9ef] bg-[#f5f7fb]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LogoHmi className="size-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#172033]">
                  {item.name}
                </p>
                {item.meta && (
                  <p className="truncate text-xs text-[#5f6573] xl:text-[13px]">
                    {item.meta}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
