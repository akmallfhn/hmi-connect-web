import Link from "next/link";
import { listFollowRecommendations } from "@/apis/users";
import FollowRecommendationRow from "./FollowRecommendationRow";

interface SuggestedConnectionsCardProps {
  title?: string;
}

export default async function SuggestedConnectionsCard({
  title = "Mungkin Kamu Kenal",
}: SuggestedConnectionsCardProps) {
  const { list } = await listFollowRecommendations({ pageSize: 5 });

  if (list.length === 0) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-4 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
          {title}
        </h2>
        <Link
          href="/people-recommendation"
          className="shrink-0 text-xs font-semibold text-primary-foreground xl:text-[13px]"
        >
          Lihat semua
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {list.map((connection) => (
          <FollowRecommendationRow
            key={connection.id}
            connection={connection}
          />
        ))}
      </div>
    </div>
  );
}
