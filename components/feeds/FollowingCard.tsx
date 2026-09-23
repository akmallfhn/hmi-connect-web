import { listFollowing } from "@/apis/users";
import Image from "next/image";
import Link from "next/link";
import { getInitials } from "../common/Avatar";

// A strip, not a grid — the sidebar fits four faces and the reader follows more than four.
const FOLLOWING_LIMIT = 12;
const TILE_SIZE = 78;

export default async function FollowingCard({ userId }: { userId?: string }) {
  if (!userId) return null;

  const { list } = await listFollowing(userId, { pageSize: FOLLOWING_LIMIT });
  if (list.length === 0) return null;

  return (
    <section className="border border-x-0 border-[#e6e9ef] bg-white py-4 lg:rounded-2xl lg:border-x">
      <h2 className="font-stack-sans-headline px-4 text-sm font-medium text-[#172033] xl:text-[15px]">
        Mengikuti
      </h2>

      <div className="mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map((person) => (
          <Link
            key={person.id}
            href={`/profile/${person.username}`}
            title={person.full_name}
            className="group flex shrink-0 snap-start flex-col items-center gap-2"
            style={{ width: TILE_SIZE }}
          >
            {/* Not the shared Avatar: it hardcodes rounded-full, which a className can't outrank. */}
            <span
              style={{ width: TILE_SIZE, height: TILE_SIZE }}
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-primary-soft ring-[3px] ring-transparent transition group-hover:ring-secondary"
            >
              {person.avatar ? (
                <Image
                  src={person.avatar}
                  alt={person.full_name}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  className="size-full object-cover"
                />
              ) : (
                <span
                  style={{ fontSize: TILE_SIZE * 0.4 }}
                  className="font-semibold text-primary"
                >
                  {getInitials(person.full_name)}
                </span>
              )}
            </span>
            <span className="line-clamp-2 text-center text-xs leading-4 text-[#5f6573]">
              {person.full_name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
