import NewsCard from "./NewsCard";
import ExploreSearchBar from "./ExploreSearchBar";
import SuggestedConnectionsCard from "./SuggestedConnectionsCard";

export default function RightSidebar() {
  return (
    <div className="flex flex-col gap-1.5 lg:gap-6">
      <ExploreSearchBar />
      <SuggestedConnectionsCard />
      <NewsCard />
      <p className="px-2 text-xs text-[#7b8190]">
        HMI Connect · Terhubung, bertumbuh, dan berdampak bersama HMI.
      </p>
    </div>
  );
}
