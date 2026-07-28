"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/apis/users";
import { updateUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import Modal from "../modals/Modal";

interface AdminEditUserMembershipFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: UserProfile;
}

export default function AdminEditUserMembershipForm({
  open,
  onClose,
  onSaved,
  user,
}: AdminEditUserMembershipFormProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Informasi Lainnya">
      {open && <MembershipFields user={user} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

// Mounted only while open, so state always seeds fresh from the fetched user — no reset effect needed.
function MembershipFields({
  user,
  onClose,
  onSaved,
}: {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [headline, setHeadline] = useState(user.headline ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [subscriptionStart, setSubscriptionStart] = useState(
    toDateInputValue(user.subscription_started_at)
  );
  const [subscriptionEnd, setSubscriptionEnd] = useState(
    toDateInputValue(user.subscription_ended_at)
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    setIsSaving(true);
    try {
      const result = await updateUser({
        id: user.id,
        headline,
        bio,
        ...(subscriptionStart ? { subscription_started_at: subscriptionStart } : {}),
        ...(subscriptionEnd ? { subscription_ended_at: subscriptionEnd } : {}),
      });

      if (!isSuccessStatus(result.status)) {
        toast.error(result.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      toast.success("Data keanggotaan berhasil diperbarui.");
      onSaved();
    } catch (err) {
      console.error("[AdminEditUserMembershipForm] updateUser threw:", err);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        inputId="admin-membership-headline"
        label="Headline"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />
      <TextArea
        textAreaId="admin-membership-bio"
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        characterLength={280}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          inputId="admin-membership-sub-start"
          type="date"
          label="Mulai Langganan"
          value={subscriptionStart}
          onChange={(e) => setSubscriptionStart(e.target.value)}
        />
        <Input
          inputId="admin-membership-sub-end"
          type="date"
          label="Berakhir Langganan"
          value={subscriptionEnd}
          onChange={(e) => setSubscriptionEnd(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#e6e9ef] pt-4">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
