import { toast } from "sonner";
import type { ApiEnvelope } from "@/apis/api";
import { isSuccessStatus } from "@/lib/types";

// Runs one profile-entry create/update/delete, toasting the outcome and calling onDone only on success.
export async function runProfileEntryMutation(
  mutation: () => Promise<ApiEnvelope<unknown>>,
  {
    success,
    failure,
    setSaving,
    onDone,
    tag,
  }: {
    success: string;
    failure: string;
    setSaving: (saving: boolean) => void;
    onDone: () => void;
    tag: string;
  }
) {
  setSaving(true);
  try {
    const result = await mutation();
    if (!isSuccessStatus(result.status)) {
      toast.error(result.message ?? failure);
      return;
    }
    toast.success(success);
    onDone();
  } catch (err) {
    console.error(`[${tag}] mutation threw:`, err);
    toast.error(failure);
  } finally {
    setSaving(false);
  }
}

