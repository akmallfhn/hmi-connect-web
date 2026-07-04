import CreatePostCard from "./CreatePostCard";
import FeedPostCard from "./FeedPostCard";
import { FEED_POSTS } from "./mockData";
import PromoBanner from "./PromoBanner";

interface FeedProps {
  fullName?: string;
  avatar?: string;
}

export default function Feed({ fullName, avatar }: FeedProps) {
  return (
    <div className="flex flex-col gap-4">
      <CreatePostCard fullName={fullName} avatar={avatar} />
      <PromoBanner />
      {FEED_POSTS.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
