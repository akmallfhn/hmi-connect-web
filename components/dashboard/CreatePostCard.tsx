import { FileText, ImageIcon, Video } from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../buttons/Button";

interface CreatePostCardProps {
  fullName?: string;
  avatar?: string;
}

const ACTIONS = [
  { label: "Foto", icon: ImageIcon, color: "text-primary" },
  { label: "Video", icon: Video, color: "text-secondary" },
  { label: "Tulisan", icon: FileText, color: "text-[#5f6573]" },
];

export default function CreatePostCard({
  fullName,
  avatar,
}: CreatePostCardProps) {
  const firstName = (fullName ?? "Kader").split(" ")[0];

  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} name={fullName ?? "Kader"} size={44} />
        <Button
          variant="ghost"
          className="flex-1 justify-start rounded-full bg-[#f5f7fb] px-4 py-2.5 text-left text-sm font-normal text-[#5f6573] hover:bg-[#eef1f6]"
        >
          Apa yang ingin kamu bagikan, {firstName}?
        </Button>
      </div>
      <div className="mt-3 flex items-center justify-around border-t border-[#e6e9ef] pt-3">
        {ACTIONS.map(({ label, icon: Icon, color }) => (
          <Button
            key={label}
            variant="ghost"
            className="gap-2 rounded-lg px-3 py-1.5 text-sm text-[#5f6573] hover:bg-[#f5f7fb]"
          >
            <Icon className={`size-4 ${color}`} />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
