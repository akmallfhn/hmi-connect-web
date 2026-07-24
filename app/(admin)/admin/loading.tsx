import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  );
}
