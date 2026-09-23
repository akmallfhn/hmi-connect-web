import NewsCard from "./NewsCard";
import ExploreSearchBar from "./ExploreSearchBar";
import FollowingCard from "./FollowingCard";

export default function RightSidebar({ userId }: { userId?: string }) {
  return (
    <div className="flex flex-col gap-1.5 lg:gap-6">
      <ExploreSearchBar />
      <FollowingCard userId={userId} />
      <NewsCard />
      <p className="px-2 text-xs text-[#7b8190]">
        HMI Connect · SilaturaHMI Membangun Negeri
      </p>
    </div>
  );
}
