import { Users } from "lucide-react";
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
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-4 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#172033]">
        <Users className="size-4 text-primary" />
        {title}
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {list.map((connection) => (
          <FollowRecommendationRow key={connection.id} connection={connection} />
        ))}
      </div>
    </div>
  );
}
