import type { ReactNode } from "react";
import { requireUserMode } from "@/lib/user-mode";

export default async function UserOnlyWwwLayout({ children }: { children: ReactNode }) {
  await requireUserMode();
  return children;
}
