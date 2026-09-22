"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserStatusEnum, VerificationStatusEnum } from "@/lib/types";

type InteractionGuardOptions = {
  userId?: string;
  userStatus?: UserStatusEnum;
  verificationStatus?: VerificationStatusEnum;
};

// One gate for every feed interaction, shared by FeedItemCard and CommentItem.
export function useInteractionGuard({
  userId,
  userStatus,
  verificationStatus,
}: InteractionGuardOptions) {
  const router = useRouter();

  return function requireVerified(): boolean {
    if (!userId) {
      router.push("/auth/login");
      return false;
    }
    if (verificationStatus === "verified") return true;

    // /verification redirects both of these straight back, so pushing there would do nothing visible.
    if (userStatus === "pending") {
      toast.error(
        "Selesaikan aktivasi akunmu dulu untuk bisa menyukai dan mengomentari postingan."
      );
      return false;
    }
    if (verificationStatus === "pending") {
      toast.error(
        "Verifikasi akunmu masih ditinjau admin. Tunggu sampai disetujui untuk bisa berinteraksi."
      );
      return false;
    }

    router.push("/verification");
    return false;
  };
}
