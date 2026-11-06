"use client";

import { uploadPublicMediaFile } from "@/lib/media-upload";

export const TRAINING_PROPOSAL_ACCEPT = "application/pdf,.pdf";
export const TRAINING_PROPOSAL_MAX_BYTES = 10 * 1024 * 1024;

export async function uploadTrainingProposal(file: File): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (file.type !== "application/pdf" || !/\.pdf$/i.test(file.name)) {
    return { ok: false, message: "Jika diunggah, proposal harus berupa berkas PDF." };
  }
  if (file.size === 0 || file.size > TRAINING_PROPOSAL_MAX_BYTES) {
    return { ok: false, message: "Ukuran proposal maksimal 10MB dan tidak boleh kosong." };
  }
  try {
    const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    if (signature !== "%PDF-") {
      return { ok: false, message: "Isi berkas bukan PDF yang valid." };
    }
    const uploaded = await uploadPublicMediaFile(file, "document");
    return { ok: true, url: uploaded.publicUrl };
  } catch (error) {
    console.error("[uploadTrainingProposal] upload threw:", error);
    return { ok: false, message: "Proposal belum berhasil diunggah. Coba lagi." };
  }
}
