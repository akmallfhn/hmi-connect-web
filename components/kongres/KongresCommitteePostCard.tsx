import Image from "next/image";
import type { KongresCommitteeMember } from "@/lib/kongres-data";

// Each committee keeps the frame colour of its own announcement: gold for Panasko, green for SC.
const FRAME_CLASS = {
  gold: "from-[#f5a300] via-[#ffc928] to-[#fff27a]",
  green: "from-[#22b35e] via-[#0a8a42] to-[#065f2e]",
};

// After the committee's announcements: a white card whose cutout rises out of a coloured frame.
export default function KongresCommitteePostCard({
  member,
  tone,
  featured,
  className = "",
}: {
  member: KongresCommitteeMember;
  tone: keyof typeof FRAME_CLASS;
  featured?: boolean;
  className?: string;
}) {
  return (
    <li className={`flex flex-col pt-6 sm:pt-8 ${className}`}>
      <div className="flex flex-1 flex-col rounded-2xl bg-white px-2.5 pb-3 sm:px-3 sm:pb-4">
        <div className="relative -mt-6 aspect-[600/635] sm:-mt-8">
          <div className={`absolute inset-x-0 bottom-0 top-[28%] rounded-lg bg-linear-to-br ${FRAME_CLASS[tone]}`} />
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes={featured ? "(min-width: 1024px) 30vw, 50vw" : "(min-width: 1024px) 20vw, 50vw"}
            className="object-contain object-bottom"
          />
        </div>
        <p
          className={`mt-3 text-center font-bold leading-tight text-[#111] ${
            featured ? "text-base sm:text-lg" : "text-sm sm:text-base"
          }`}
        >
          {member.name}
        </p>
        <p className="mt-0.5 text-center text-[11px] italic leading-snug text-[#333] sm:text-xs">
          {member.role}
        </p>
      </div>
    </li>
  );
}
