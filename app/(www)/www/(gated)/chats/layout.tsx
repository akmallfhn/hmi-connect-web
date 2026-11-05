import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/apis/session";
import ChatsPage from "@/components/pages/ChatsPage";
import { requireUserMode } from "@/lib/user-mode";

export const metadata: Metadata = {
  title: "Pesan",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChatsLayout({ children }: { children: ReactNode }) {
  await requireUserMode();
  const { user } = await getSession();

  return (
    <ChatsPage
      viewer={{
        fullName: user?.full_name,
        avatar: user?.avatar,
        userId: user?.id,
        username: user?.username,
        verificationStatus: user?.verification_status,
      }}
    >
      {children}
    </ChatsPage>
  );
}
